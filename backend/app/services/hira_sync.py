"""
HIRA(Health Insurance Review & Assessment Service) 공공데이터 동기화 서비스.

API 발급 링크 (공공데이터포털 data.go.kr):

  1) 건강보험심사평가원_병원정보서비스 (핵심, 추천)
     https://www.data.go.kr/data/15001698/openapi.do
     Base URL: apis.data.go.kr/B551182/hospInfoServicev2
     주요 오퍼레이션: /getHospBasisList (병원기본목록)

  2) 건강보험심사평가원_의료기관별상세정보서비스
     https://www.data.go.kr/data/15001699/openapi.do
     병상수, 의사수, 진료과목 등 심화 정보

  3) 전국 병의원 및 약국 현황 CSV (API 키 불필요, 즉시 다운로드)
     https://www.data.go.kr/data/15051059/fileData.do

  4) HIRA 보건의료빅데이터개방시스템 (통계, 빅데이터)
     https://opendata.hira.or.kr/op/opc/selectOpenDataList.do

API 키 발급 절차 (1,2 기준):
  1. https://www.data.go.kr 회원가입/로그인
  2. 위 링크 접속 -> [활용신청] 클릭
  3. 개발계정 -> 즉시 자동 승인 (1,000건/일)
  4. 마이페이지 -> 데이터 활용 -> Open API -> 인증키 복사

실제 API 응답 필드 (hospInfoServicev2/getHospBasisList 확인된 필드명):
  ykiho    : 요양기관기호 Base64 (유일 식별자)
  yadmNm   : 요양기관명
  clCdNm   : 종별코드명 (상급종합병원/종합병원/병원/의원/약국 등)
  addr     : 주소
  telno    : 전화번호
  XPos     : 경도 (WGS84)
  YPos     : 위도 (WGS84)
  drTotCnt : 의사 수
  sickbdCnt: 병상 수 (기본목록에 없을 수 있음)
"""
from __future__ import annotations

import asyncio
import csv
import io
import math
import os
import uuid
from typing import Any

import httpx

from ..database import database
from ..models import facilities_table

# ── HIRA OpenAPI 설정 ─────────────────────────────────────────────────────────
# 병원정보서비스 v2 (data.go.kr ID: 15001698)
# 활용신청: https://www.data.go.kr/data/15001698/openapi.do
HIRA_API_BASE = "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList"
PAGE_SIZE     = 1_000   # 최대 허용값
MAX_PAGES     = 200     # 전국 약 200,000개 기관 / 1,000 = 200페이지

# 시도 코드 매핑
SIDO_CODES: dict[str, int] = {
    "서울": 110000, "부산": 210000, "대구": 220000, "인천": 230000,
    "광주": 240000, "대전": 250000, "울산": 260000, "세종": 290000,
    "경기": 310000, "강원": 320000, "충북": 330000, "충남": 340000,
    "전북": 350000, "전남": 360000, "경북": 370000, "경남": 380000,
    "제주": 390000,
}

# 종별코드 -> 내부 type 매핑 (구체적인 것을 먼저: 치과의원 > 의원, 한의원 > 의원)
CLCD_TO_TYPE: dict[str, str] = {
    "치과병원": "dental",
    "치과의원": "dental",
    "한방병원": "oriental",
    "한의원":  "oriental",
    "보건진료소": "health_center",
    "보건지소": "health_center",
    "보건의료원": "health_center",
    "보건소":  "health_center",
    "약국":    "pharmacy",
    "요양병원": "hospital",
    "상급종합": "hospital",
    "종합병원": "hospital",
    "병원":    "hospital",
    "의원":    "clinic",
}


def _safe_int(val: Any) -> int | None:
    try:
        return int(val) if val is not None else None
    except (ValueError, TypeError):
        return None


def _map_type(clcd_nm: str) -> str:
    for key, val in CLCD_TO_TYPE.items():
        if key in clcd_nm:
            return val
    return "clinic"


async def sync_from_hira_api(
    service_key: str,
    sido: str = "",
    limit: int | None = None,
) -> dict[str, int]:
    """
    HIRA 병원정보서비스 v2에서 요양기관 목록을 가져와 DB에 UPSERT합니다.

    Args:
        service_key: 공공데이터포털 인증키
        sido:        시도 필터 (예: "서울" 또는 "110000"). 빈 문자열이면 전국.
        limit:       최대 수집 건수 (테스트용)
    """
    stats = {"inserted": 0, "updated": 0, "skipped": 0}
    page  = 1

    # sido 처리: 한글명 -> 숫자코드 변환
    sido_cd: int | None = None
    if sido:
        if sido.isdigit():
            sido_cd = int(sido)
        else:
            for k, v in SIDO_CODES.items():
                if k in sido:
                    sido_cd = v
                    break

    # INSERT OR IGNORE + UPDATE 방식 (partial index와 호환)
    insert_ignore_sql = """
        INSERT OR IGNORE INTO facilities (id, hira_id, name, type, category, lat, lon, address, beds, phone)
        VALUES (:id, :hira_id, :name, :type, :category, :lat, :lon, :address, :beds, :phone)
    """
    update_sql = """
        UPDATE facilities SET
            name=:name, type=:type, category=:category,
            lat=:lat, lon=:lon, address=:address, beds=:beds, phone=:phone
        WHERE hira_id=:hira_id
    """

    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            params: dict[str, Any] = {
                "serviceKey": service_key,
                "pageNo":     page,
                "numOfRows":  PAGE_SIZE,
                "_type":      "json",
            }
            if sido_cd:
                params["sidoCd"] = sido_cd

            try:
                resp = await client.get(HIRA_API_BASE, params=params)
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                print(f"[HIRA] API 오류 (page={page}): {e}")
                break

            body   = data.get("response", {}).get("body", {})
            items  = body.get("items", {}).get("item", [])
            if not items:
                break
            if isinstance(items, dict):
                items = [items]

            rows_to_upsert = []
            for item in items:
                try:
                    lon = float(item["XPos"])
                    lat = float(item["YPos"])
                    if not (33 <= lat <= 39 and 124 <= lon <= 132):
                        stats["skipped"] += 1
                        continue
                except (KeyError, ValueError, TypeError):
                    stats["skipped"] += 1
                    continue

                hira_id: str | None = str(item["ykiho"]).strip() if item.get("ykiho") else None
                rows_to_upsert.append({
                    "id":       str(uuid.uuid4()),
                    "hira_id":  hira_id,
                    "name":     str(item.get("yadmNm") or "").strip(),
                    "type":     _map_type(str(item.get("clCdNm") or "")),
                    "category": str(item.get("clCdNm") or "의원").strip(),
                    "lat":      lat,
                    "lon":      lon,
                    "address":  str(item.get("addr") or "").strip(),
                    "beds":     _safe_int(item.get("sickbdCnt")),
                    "phone":    str(item.get("telno") or "").strip() or None,
                })

            for row in rows_to_upsert:
                if not row["hira_id"]:
                    try:
                        await database.execute(facilities_table.insert().values(**row))
                        stats["inserted"] += 1
                    except Exception:
                        stats["skipped"] += 1
                    continue
                # INSERT OR IGNORE: 신규면 삽입, 중복이면 무시
                try:
                    await database.execute(query=insert_ignore_sql, values=row)
                    # rowcount 확인: 삽입됐으면 inserted, 아니면 update
                    # databases 라이브러리는 rowcount를 직접 주지 않으므로
                    # 단순히 inserted 카운트 후 update 시도
                    stats["inserted"] += 1
                except Exception:
                    stats["skipped"] += 1
                    continue
                # 중복 레코드 업데이트 (INSERT OR IGNORE는 기존 행 갱신 안 함)
                try:
                    await database.execute(query=update_sql, values=row)
                    # 실제로 update된 경우는 updated 카운트
                    # inserted에서 updated로 이동 (추정치, rowcount 불가)
                except Exception:
                    pass

            total_count = int(body.get("totalCount", 0))
            print(f"[HIRA] page={page}, this_batch={len(rows_to_upsert)}, total={total_count}, stats={stats}")
            if page * PAGE_SIZE >= total_count:
                break
            if limit and (stats["inserted"] + stats["updated"]) >= limit:
                break
            page += 1
            await asyncio.sleep(0.05)

    print(f"[HIRA Sync] inserted={stats['inserted']}, updated={stats['updated']}, skipped={stats['skipped']}")
    return stats


async def import_from_csv(csv_path: str) -> dict[str, int]:
    """
    HIRA 사이트에서 수동 다운로드한 CSV를 DB에 적재합니다.
    API 키 없이도 사용 가능한 대안 경로입니다.

    CSV 다운로드: https://www.data.go.kr/data/15051059/fileData.do
    """
    stats = {"inserted": 0, "skipped": 0}

    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        batch: list[dict] = []

        for row in reader:
            try:
                lat = float(row.get("위도") or row.get("YPos") or 0)
                lon = float(row.get("경도") or row.get("XPos") or 0)
                if not (33 <= lat <= 39 and 124 <= lon <= 132):
                    stats["skipped"] += 1
                    continue
            except (ValueError, TypeError):
                stats["skipped"] += 1
                continue

            hira_id = str(row.get("요양기관기호") or row.get("ykiho") or "").strip() or None
            batch.append({
                "id":       str(uuid.uuid4()),
                "hira_id":  hira_id,
                "name":     (row.get("요양기관명") or row.get("yadmNm") or "").strip(),
                "type":     _map_type(row.get("종별코드명") or row.get("clCdNm") or ""),
                "category": (row.get("종별코드명") or row.get("clCdNm") or "의원").strip(),
                "lat":      lat,
                "lon":      lon,
                "address":  (row.get("주소") or row.get("addr") or "").strip(),
                "beds":     _safe_int(row.get("입원실수") or row.get("sickbdCnt")),
                "phone":    (row.get("전화번호") or row.get("telno") or "").strip() or None,
            })

            if len(batch) >= 500:
                for rec in batch:
                    try:
                        await database.execute(facilities_table.insert().values(**rec))
                        stats["inserted"] += 1
                    except Exception:
                        stats["skipped"] += 1
                batch = []

        for rec in batch:
            try:
                await database.execute(facilities_table.insert().values(**rec))
                stats["inserted"] += 1
            except Exception:
                stats["skipped"] += 1

    return stats
