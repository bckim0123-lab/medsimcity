from fastapi import APIRouter, Query
from ..database import database
from ..models import facilities_table
import sqlalchemy

router = APIRouter()

FACILITY_LIMIT = 1500  # 뷰포트당 최대 렌더링 수


@router.get("/")
async def get_facilities(
    min_lat: float = Query(..., description="바운딩박스 최소 위도"),
    max_lat: float = Query(..., description="바운딩박스 최대 위도"),
    min_lon: float = Query(..., description="바운딩박스 최소 경도"),
    max_lon: float = Query(..., description="바운딩박스 최대 경도"),
    types: str = Query("all", description="시설 유형 필터 (all|hospital|clinic|pharmacy|health_center|dental)"),
):
    """지정 바운딩박스 내 의료시설을 반환합니다."""
    query = facilities_table.select().where(
        (facilities_table.c.lat >= min_lat)
        & (facilities_table.c.lat <= max_lat)
        & (facilities_table.c.lon >= min_lon)
        & (facilities_table.c.lon <= max_lon)
    )
    if types != "all":
        type_list = [t.strip() for t in types.split(",")]
        query = query.where(facilities_table.c.type.in_(type_list))

    query = query.limit(FACILITY_LIMIT)
    rows = await database.fetch_all(query)
    return [dict(r) for r in rows]


@router.get("/stats")
async def get_stats():
    """전체 시설 통계를 반환합니다."""
    total = await database.fetch_val("SELECT COUNT(*) FROM facilities")
    by_type = await database.fetch_all(
        "SELECT type, COUNT(*) as cnt FROM facilities GROUP BY type"
    )
    return {
        "total": total,
        "by_type": {r["type"]: r["cnt"] for r in by_type},
    }
