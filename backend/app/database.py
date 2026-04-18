import databases
import pathlib
import sqlalchemy
from sqlalchemy import MetaData

# DB 파일을 스크립트 위치 기준 절대 경로로 고정 (cwd 변화에 무관)
_DB_PATH    = pathlib.Path(__file__).parent.parent / "medisim.db"
DATABASE_URL = f"sqlite+aiosqlite:///{_DB_PATH.as_posix()}"

database = databases.Database(DATABASE_URL)
metadata = MetaData()

engine = sqlalchemy.create_engine(
    DATABASE_URL.replace("+aiosqlite", ""),
    connect_args={"check_same_thread": False},
)


async def create_tables() -> None:
    from .models import facilities_table, population_cells_table  # noqa: F401
    metadata.create_all(engine)
    # 스키마 마이그레이션: hira_id 컬럼이 없으면 추가 (ALTER TABLE)
    import sqlite3
    con = sqlite3.connect(str(_DB_PATH))
    try:
        cols = {row[1] for row in con.execute("PRAGMA table_info(facilities)").fetchall()}
        if "hira_id" not in cols:
            con.execute("ALTER TABLE facilities ADD COLUMN hira_id TEXT")
            con.commit()
    finally:
        con.close()
