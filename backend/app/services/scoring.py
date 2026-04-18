"""
정책 시나리오 효과 스코어링 엔진 (동적 위도 보정 버전).

변경 이력:
  v2 — LON_TO_M을 bbox 중심 위도 기반 동적 계산으로 교체
       (지방 지자체에서도 정확한 경도 거리 계산 보장).
       인구 매핑도 KDTree 기반으로 통일.
"""
from __future__ import annotations

import math
from typing import Any

import numpy as np
from scipy.spatial import KDTree

_LAT_TO_M      = 111_000
NETWORK_FACTOR = 1.35
CAR_SPEED_MPM  = 500    # 30 km/h

COVERAGE_MIN = 15.0  # 15분 이내 = 커버리지 달성

DISEASE_WEIGHTS: dict[str, float] = {
    "emergency": 1.5,
    "chronic":   1.0,
    "pediatric": 1.3,
    "all":       1.0,
}

REGION_POP_KEY: dict[str, str] = {
    "rural":    "elderly",
    "suburban": "none",
    "urban":    "child",
}


def _to_m(records: list[dict], lat_scale: float, lon_scale: float) -> np.ndarray:
    return np.array([[r["lat"] * lat_scale, r["lon"] * lon_scale] for r in records])


def compute_score(
    proposed:     list[dict],
    existing:     list[dict],
    pop_cells:    list[dict],
    disease_type: str = "all",
    region_type:  str = "urban",
    center_lat:   float = 37.55,   # bbox 중심 위도 (동적 전달 권장)
) -> dict[str, Any]:
    if not pop_cells or not existing:
        return {"score": 0, "error": "데이터 부족 — 뷰포트를 더 좁게 설정하세요"}

    # 동적 위도 보정
    lon_to_m   = _LAT_TO_M * math.cos(math.radians(center_lat))
    lat_scale  = _LAT_TO_M
    lon_scale  = lon_to_m

    weight  = DISEASE_WEIGHTS.get(disease_type, 1.0)
    pop_key = REGION_POP_KEY.get(region_type, "none")

    pop_m  = _to_m(pop_cells, lat_scale, lon_scale)
    pop_raw = np.array([c["population"] for c in pop_cells], dtype=float)

    # 역학적 인구 가중치
    if pop_key == "elderly":
        ep_w = np.array([c.get("elderly_ratio", 0.15) for c in pop_cells])
    elif pop_key == "child":
        ep_w = np.array([c.get("child_ratio", 0.11) for c in pop_cells])
    else:
        ep_w = np.zeros(len(pop_cells))
    pop_weights = pop_raw * (1.0 + ep_w)

    # ── Before: 기존 시설만 ───────────────────────────────────────
    before_tree  = KDTree(_to_m(existing, lat_scale, lon_scale))
    before_dists, _ = before_tree.query(pop_m)
    before_times = before_dists * NETWORK_FACTOR / CAR_SPEED_MPM

    # ── After: 기존 + 제안 시설 ──────────────────────────────────
    all_recs    = existing + proposed
    after_tree  = KDTree(_to_m(all_recs, lat_scale, lon_scale))
    after_dists, _ = after_tree.query(pop_m)
    after_times = after_dists * NETWORK_FACTOR / CAR_SPEED_MPM

    total_wp = float(np.sum(pop_weights))
    if total_wp == 0:
        return {"score": 0, "error": "인구 데이터 없음"}

    # 커버리지 (15분 이내)
    cov_before = float(np.sum(pop_weights[before_times <= COVERAGE_MIN]))
    cov_after  = float(np.sum(pop_weights[after_times  <= COVERAGE_MIN]))
    cov_added  = int(cov_after - cov_before)

    # 가중 평균 이동시간
    avg_before = float(np.sum(before_times * pop_weights) / total_wp)
    avg_after  = float(np.sum(after_times  * pop_weights) / total_wp)
    time_red   = (avg_before - avg_after) / avg_before * 100 if avg_before > 0 else 0

    # 중복도 검사
    redundancy_warning = False
    overlap_pct        = 0.0
    if proposed and existing:
        ex_arr = _to_m(existing, lat_scale, lon_scale)
        pr_arr = _to_m(proposed, lat_scale, lon_scale)
        ex_tree = KDTree(ex_arr)
        pr_dists, _ = ex_tree.query(pr_arr)
        redundancy_warning = bool(np.any(pr_dists < 800))
        overlap_pct = float(np.mean(pr_dists < 1_500) * 100)

    # 세부 점수
    access_score   = min(100.0, time_red * 2.0)
    coverage_score = min(100.0, (cov_added / total_wp * 100) * 5)
    redundancy_pen = 25.0 if redundancy_warning else 0.0

    raw         = (access_score * 0.5 + coverage_score * 0.5 - redundancy_pen) * weight
    final_score = max(0, min(100, int(raw)))

    return {
        "score":                  final_score,
        "coverage_added":         cov_added,
        "total_population":       int(total_wp),
        "coverage_before":        int(cov_before),
        "coverage_after":         int(cov_after),
        "coverage_rate_before":   round(cov_before / total_wp * 100, 1),
        "coverage_rate_after":    round(cov_after  / total_wp * 100, 1),
        "avg_time_before":        round(avg_before, 1),
        "avg_time_after":         round(avg_after,  1),
        "time_reduction_pct":     round(time_red,   1),
        "redundancy_warning":     redundancy_warning,
        "redundancy_overlap_pct": round(overlap_pct, 1),
        "disease_weight":         weight,
        "access_score":           round(access_score,   1),
        "coverage_score":         round(coverage_score, 1),
    }
