import sqlalchemy
from .database import metadata

# ── 의료 시설 테이블 ──────────────────────────────────────────────────────────
facilities_table = sqlalchemy.Table(
    "facilities",
    metadata,
    sqlalchemy.Column("id",       sqlalchemy.String,  primary_key=True),
    sqlalchemy.Column("name",     sqlalchemy.String,  nullable=False),
    # hospital | clinic | pharmacy | health_center | dental | oriental
    sqlalchemy.Column("type",     sqlalchemy.String,  nullable=False),
    # 내과, 외과, 약국 등 세부 진료과목
    sqlalchemy.Column("category", sqlalchemy.String,  nullable=False),
    sqlalchemy.Column("lat",      sqlalchemy.Float,   nullable=False),
    sqlalchemy.Column("lon",      sqlalchemy.Float,   nullable=False),
    sqlalchemy.Column("address",  sqlalchemy.String),
    sqlalchemy.Column("beds",     sqlalchemy.Integer, nullable=True),
    sqlalchemy.Column("phone",    sqlalchemy.String,  nullable=True),
    # HIRA 원본 식별자 (실 API 연동 시 중복 방지)
    sqlalchemy.Column("hira_id",  sqlalchemy.String,  nullable=True, unique=True),
    # 공간 쿼리용 복합 인덱스
    sqlalchemy.Index("ix_facilities_lat_lon", "lat", "lon"),
    sqlalchemy.Index("ix_facilities_type",    "type"),
)

# ── 인구 격자 테이블 ──────────────────────────────────────────────────────────
population_cells_table = sqlalchemy.Table(
    "population_cells",
    metadata,
    sqlalchemy.Column("id",            sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("lat",           sqlalchemy.Float,   nullable=False),
    sqlalchemy.Column("lon",           sqlalchemy.Float,   nullable=False),
    sqlalchemy.Column("population",    sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("elderly_ratio", sqlalchemy.Float,   nullable=False),
    sqlalchemy.Column("child_ratio",   sqlalchemy.Float,   nullable=False),
    sqlalchemy.Column("district",      sqlalchemy.String,  nullable=False),
    # 공간 인덱스
    sqlalchemy.Index("ix_pop_lat_lon", "lat", "lon"),
)
