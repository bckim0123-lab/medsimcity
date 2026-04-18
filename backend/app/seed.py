"""
HIRA 데이터 기반 서울 의료 인프라 Mock 데이터 시드 스크립트.
실제 배포 시에는 HIRA 공공데이터포털 API로 대체합니다.
"""
import math
import random
import uuid

from .database import database
from .models import facilities_table, population_cells_table

random.seed(42)

SEOUL_DISTRICTS = [
    {"name": "강남구",  "lat": 37.4979, "lon": 127.0276, "pop": 540000, "area": 39.5, "elderly": 0.13, "child": 0.10},
    {"name": "강동구",  "lat": 37.5301, "lon": 127.1239, "pop": 469000, "area": 24.6, "elderly": 0.15, "child": 0.12},
    {"name": "강북구",  "lat": 37.6396, "lon": 127.0253, "pop": 317000, "area": 23.6, "elderly": 0.22, "child": 0.09},
    {"name": "강서구",  "lat": 37.5509, "lon": 126.8495, "pop": 603000, "area": 41.4, "elderly": 0.17, "child": 0.11},
    {"name": "관악구",  "lat": 37.4784, "lon": 126.9516, "pop": 507000, "area": 29.6, "elderly": 0.14, "child": 0.10},
    {"name": "광진구",  "lat": 37.5384, "lon": 127.0822, "pop": 362000, "area": 17.1, "elderly": 0.15, "child": 0.11},
    {"name": "구로구",  "lat": 37.4954, "lon": 126.8874, "pop": 421000, "area": 20.1, "elderly": 0.16, "child": 0.12},
    {"name": "금천구",  "lat": 37.4569, "lon": 126.8955, "pop": 241000, "area": 13.0, "elderly": 0.18, "child": 0.10},
    {"name": "노원구",  "lat": 37.6543, "lon": 127.0566, "pop": 556000, "area": 35.4, "elderly": 0.17, "child": 0.13},
    {"name": "도봉구",  "lat": 37.6688, "lon": 127.0472, "pop": 346000, "area": 20.7, "elderly": 0.20, "child": 0.11},
    {"name": "동대문구", "lat": 37.5744, "lon": 127.0402, "pop": 358000, "area": 14.2, "elderly": 0.19, "child": 0.10},
    {"name": "동작구",  "lat": 37.5124, "lon": 126.9393, "pop": 413000, "area": 16.4, "elderly": 0.17, "child": 0.11},
    {"name": "마포구",  "lat": 37.5636, "lon": 126.9024, "pop": 385000, "area": 23.9, "elderly": 0.13, "child": 0.10},
    {"name": "서대문구", "lat": 37.5791, "lon": 126.9368, "pop": 314000, "area": 17.6, "elderly": 0.18, "child": 0.11},
    {"name": "서초구",  "lat": 37.4836, "lon": 127.0327, "pop": 427000, "area": 47.0, "elderly": 0.12, "child": 0.11},
    {"name": "성동구",  "lat": 37.5634, "lon": 127.0369, "pop": 307000, "area": 16.9, "elderly": 0.15, "child": 0.11},
    {"name": "성북구",  "lat": 37.5894, "lon": 127.0167, "pop": 440000, "area": 24.6, "elderly": 0.18, "child": 0.11},
    {"name": "송파구",  "lat": 37.5145, "lon": 127.1059, "pop": 672000, "area": 33.9, "elderly": 0.13, "child": 0.13},
    {"name": "양천구",  "lat": 37.5170, "lon": 126.8666, "pop": 474000, "area": 17.4, "elderly": 0.14, "child": 0.14},
    {"name": "영등포구", "lat": 37.5264, "lon": 126.8963, "pop": 410000, "area": 24.5, "elderly": 0.16, "child": 0.10},
    {"name": "용산구",  "lat": 37.5311, "lon": 126.9810, "pop": 247000, "area": 21.9, "elderly": 0.17, "child": 0.10},
    {"name": "은평구",  "lat": 37.6026, "lon": 126.9291, "pop": 491000, "area": 29.7, "elderly": 0.19, "child": 0.12},
    {"name": "종로구",  "lat": 37.5720, "lon": 126.9794, "pop": 157000, "area": 23.9, "elderly": 0.22, "child": 0.07},
    {"name": "중구",    "lat": 37.5640, "lon": 126.9975, "pop": 135000, "area":  9.96, "elderly": 0.21, "child": 0.07},
    {"name": "중랑구",  "lat": 37.6063, "lon": 127.0927, "pop": 410000, "area": 18.5, "elderly": 0.19, "child": 0.11},
]

MAJOR_HOSPITALS = [
    {"name": "서울대학교병원",     "lat": 37.5796, "lon": 126.9991, "beds": 1780},
    {"name": "세브란스병원",        "lat": 37.5621, "lon": 126.9412, "beds": 2032},
    {"name": "삼성서울병원",        "lat": 37.4881, "lon": 127.0860, "beds": 1979},
    {"name": "서울아산병원",        "lat": 37.5273, "lon": 127.1086, "beds": 2705},
    {"name": "서울성모병원",        "lat": 37.5012, "lon": 127.0046, "beds": 1402},
    {"name": "강북삼성병원",        "lat": 37.5744, "lon": 126.9657, "beds":  852},
    {"name": "고려대안암병원",      "lat": 37.5876, "lon": 127.0285, "beds":  977},
    {"name": "한양대학교병원",      "lat": 37.5560, "lon": 127.0447, "beds":  811},
    {"name": "이화여대목동병원",    "lat": 37.5287, "lon": 126.8731, "beds":  846},
    {"name": "경희대학교병원",      "lat": 37.5975, "lon": 127.0521, "beds": 1043},
    {"name": "순천향대서울병원",    "lat": 37.5433, "lon": 126.9941, "beds":  698},
    {"name": "중앙대학교병원",      "lat": 37.5041, "lon": 126.9523, "beds":  867},
    {"name": "서울보라매병원",      "lat": 37.4935, "lon": 126.9266, "beds":  817},
    {"name": "국립중앙의료원",      "lat": 37.5649, "lon": 127.0068, "beds":  732},
    {"name": "강남세브란스병원",    "lat": 37.4920, "lon": 127.0410, "beds": 1028},
    {"name": "고려대구로병원",      "lat": 37.4930, "lon": 126.8993, "beds": 1004},
    {"name": "건국대학교병원",      "lat": 37.5397, "lon": 127.0814, "beds":  894},
    {"name": "강동경희대병원",      "lat": 37.5493, "lon": 127.1511, "beds": 1040},
    {"name": "서울적십자병원",      "lat": 37.5724, "lon": 126.9773, "beds":  410},
    {"name": "서울특별시어린이병원", "lat": 37.5178, "lon": 127.1208, "beds":  400},
]

CLINIC_SPECIALTIES = [
    "내과", "내과", "내과",
    "정형외과", "정형외과",
    "소아청소년과", "소아청소년과",
    "피부과",
    "안과",
    "이비인후과", "이비인후과",
    "가정의학과", "가정의학과",
    "외과",
    "산부인과",
    "신경과",
    "정신건강의학과",
    "비뇨의학과",
    "재활의학과",
]


def _rand_point(lat: float, lon: float, radius_m: float) -> tuple[float, float]:
    r = radius_m * math.sqrt(random.random())
    theta = random.random() * 2 * math.pi
    dlat = r * math.cos(theta) / 111_000
    dlon = r * math.sin(theta) / (111_000 * math.cos(math.radians(lat)))
    return lat + dlat, lon + dlon


async def seed_data() -> None:
    count = await database.fetch_val("SELECT COUNT(*) FROM facilities")
    if count and count > 0:
        return

    rows: list[dict] = []

    # ── 상급종합/종합병원 ──────────────────────────────────────
    for h in MAJOR_HOSPITALS:
        rows.append({
            "id": str(uuid.uuid4()),
            "name": h["name"],
            "type": "hospital",
            "category": "상급종합병원",
            "lat": h["lat"],
            "lon": h["lon"],
            "address": f"서울특별시 {h['name']} 소재지",
            "beds": h["beds"],
            "phone": f"02-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
        })

    # ── 구별 의원·약국·보건소 ──────────────────────────────────
    for d in SEOUL_DISTRICTS:
        dlat, dlon, pop = d["lat"], d["lon"], d["pop"]

        n_clinics    = max(6, min(40, int(pop / 5_000)))
        n_pharmacies = max(4, min(25, int(pop / 7_000)))

        for _ in range(n_clinics):
            lat, lon = _rand_point(dlat, dlon, 2_800)
            spec = random.choice(CLINIC_SPECIALTIES)
            rows.append({
                "id": str(uuid.uuid4()),
                "name": f"{spec}의원 {random.randint(1,99)}호",
                "type": "clinic",
                "category": spec,
                "lat": lat, "lon": lon,
                "address": f"서울특별시 {d['name']}",
                "beds": None,
                "phone": f"02-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
            })

        for _ in range(n_pharmacies):
            lat, lon = _rand_point(dlat, dlon, 2_500)
            rows.append({
                "id": str(uuid.uuid4()),
                "name": f"{d['name']} 약국 {random.randint(1,99)}",
                "type": "pharmacy",
                "category": "약국",
                "lat": lat, "lon": lon,
                "address": f"서울특별시 {d['name']}",
                "beds": None,
                "phone": f"02-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
            })

        # 보건소 1개/구
        lat, lon = _rand_point(dlat, dlon, 800)
        rows.append({
            "id": str(uuid.uuid4()),
            "name": f"{d['name']} 보건소",
            "type": "health_center",
            "category": "보건소",
            "lat": lat, "lon": lon,
            "address": f"서울특별시 {d['name']}",
            "beds": None,
            "phone": f"02-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
        })

        # 치과의원 2개/구
        for _ in range(2):
            lat, lon = _rand_point(dlat, dlon, 2_000)
            rows.append({
                "id": str(uuid.uuid4()),
                "name": f"{d['name']} 치과의원 {random.randint(1,50)}",
                "type": "dental",
                "category": "치과",
                "lat": lat, "lon": lon,
                "address": f"서울특별시 {d['name']}",
                "beds": None,
                "phone": f"02-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
            })

    # ── DB 저장 ───────────────────────────────────────────────
    BATCH = 100
    for i in range(0, len(rows), BATCH):
        await database.execute_many(query=facilities_table.insert(), values=rows[i:i + BATCH])

    # ── 인구 격자 생성 (500m 간격) ───────────────────────────
    pop_rows: list[dict] = []
    LAT_MIN, LAT_MAX = 37.41, 37.71
    LON_MIN, LON_MAX = 126.82, 127.19
    STEP_LAT = 500 / 111_000
    STEP_LON = 500 / (111_000 * math.cos(math.radians(37.55)))

    lat = LAT_MIN
    while lat < LAT_MAX:
        lon = LON_MIN
        while lon < LON_MAX:
            # 가장 가까운 자치구 탐색
            nd = min(SEOUL_DISTRICTS, key=lambda d: (lat - d["lat"]) ** 2 + (lon - d["lon"]) ** 2)
            dist_deg = math.sqrt((lat - nd["lat"]) ** 2 + (lon - nd["lon"]) ** 2)

            if dist_deg < 0.14:
                density = nd["pop"] / (nd["area"] * 1_000_000) * (500 * 500)
                pop = max(0, int(density * (0.4 + random.random() * 1.2)))
                if pop > 10:
                    pop_rows.append({
                        "lat": round(lat, 5),
                        "lon": round(lon, 5),
                        "population": pop,
                        "elderly_ratio": round(nd["elderly"] * (0.8 + random.random() * 0.4), 3),
                        "child_ratio":   round(nd["child"]   * (0.8 + random.random() * 0.4), 3),
                        "district": nd["name"],
                    })
            lon += STEP_LON
        lat += STEP_LAT

    for i in range(0, len(pop_rows), BATCH):
        await database.execute_many(query=population_cells_table.insert(), values=pop_rows[i:i + BATCH])

    print(f"[OK] 시드 완료: 시설 {len(rows)}개, 인구 격자 {len(pop_rows)}개")
