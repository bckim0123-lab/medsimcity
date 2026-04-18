from fastapi import APIRouter, Query
from pydantic import BaseModel
from ..database import database
from ..models import facilities_table, population_cells_table
from ..services.gap_analysis import compute_gap
from ..services.scoring import compute_score

router = APIRouter()


# ── Request Models ────────────────────────────────────────────────────────────

class BBox(BaseModel):
    min_lat: float
    max_lat: float
    min_lon: float
    max_lon: float


class ProposedFacility(BaseModel):
    lat: float
    lon: float
    type: str
    name: str


class ScenarioRequest(BaseModel):
    bbox: BBox
    proposed_facilities: list[ProposedFacility]
    disease_type: str  = "all"
    region_type:  str  = "urban"


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _fetch_facilities(bbox: BBox, fac_type: str | None = None) -> list[dict]:
    q = facilities_table.select().where(
        (facilities_table.c.lat >= bbox.min_lat)
        & (facilities_table.c.lat <= bbox.max_lat)
        & (facilities_table.c.lon >= bbox.min_lon)
        & (facilities_table.c.lon <= bbox.max_lon)
    )
    if fac_type:
        q = q.where(facilities_table.c.type == fac_type)
    rows = await database.fetch_all(q)
    return [dict(r) for r in rows]


async def _fetch_pop_cells(bbox: BBox) -> list[dict]:
    q = population_cells_table.select().where(
        (population_cells_table.c.lat >= bbox.min_lat)
        & (population_cells_table.c.lat <= bbox.max_lat)
        & (population_cells_table.c.lon >= bbox.min_lon)
        & (population_cells_table.c.lon <= bbox.max_lon)
    )
    rows = await database.fetch_all(q)
    return [dict(r) for r in rows]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/gap")
async def gap_analysis(
    min_lat: float = Query(...),
    max_lat: float = Query(...),
    min_lon: float = Query(...),
    max_lon: float = Query(...),
    disease_type: str = Query("all"),
    facility_type: str = Query("all"),
):
    """
    지정 바운딩박스의 의료 공백(gap) 분석 결과를 GeoJSON으로 반환합니다.
    """
    bbox = BBox(min_lat=min_lat, max_lat=max_lat, min_lon=min_lon, max_lon=max_lon)
    fac_filter = None if facility_type == "all" else facility_type

    facilities = await _fetch_facilities(bbox, fac_filter)
    pop_cells  = await _fetch_pop_cells(bbox)

    # 뷰포트 크기에 따라 격자 해상도 조정
    lat_span = max_lat - min_lat
    grid_m = 200 if lat_span < 0.05 else 350 if lat_span < 0.12 else 500

    return compute_gap(facilities, pop_cells, bbox.model_dump(), disease_type, grid_m)


@router.get("/population")
async def population_grid(
    min_lat: float = Query(...),
    max_lat: float = Query(...),
    min_lon: float = Query(...),
    max_lon: float = Query(...),
):
    """바운딩박스 내 인구 격자 데이터를 반환합니다 (Deck.gl HexagonLayer용)."""
    bbox = BBox(min_lat=min_lat, max_lat=max_lat, min_lon=min_lon, max_lon=max_lon)
    return await _fetch_pop_cells(bbox)


@router.post("/scenario")
async def scenario_analysis(req: ScenarioRequest):
    """
    가상 시설 배치 시나리오의 정책 실효성 점수를 산출합니다.
    """
    existing  = await _fetch_facilities(req.bbox)
    pop_cells = await _fetch_pop_cells(req.bbox)

    proposed = [p.model_dump() for p in req.proposed_facilities]

    center_lat = (req.bbox.min_lat + req.bbox.max_lat) / 2

    result = compute_score(
        proposed     = proposed,
        existing     = existing,
        pop_cells    = pop_cells,
        disease_type = req.disease_type,
        region_type  = req.region_type,
        center_lat   = center_lat,
    )
    return result
