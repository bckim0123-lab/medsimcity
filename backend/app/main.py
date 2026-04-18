import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import database, create_tables
from .seed import seed_data
from .routers import facilities, analysis, sync

# ALLOWED_ORIGINS 환경변수로 CORS 도메인 관리
# 예) ALLOWED_ORIGINS=https://medisim.vercel.app,https://custom.domain.com
_raw = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    await create_tables()
    await seed_data()
    yield
    await database.disconnect()


app = FastAPI(
    title="MediSim API",
    description="범용 지역 맞춤형 의료 정책 시뮬레이터 — HIRA 데이터 기반 입지 분석 엔진",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(facilities.router, prefix="/api/facilities", tags=["의료시설"])
app.include_router(analysis.router,   prefix="/api/analysis",  tags=["공간분석"])
app.include_router(sync.router,       prefix="/api/sync",       tags=["데이터동기화"])


@app.get("/", tags=["상태"])
async def root():
    return {"service": "MediSim API", "version": "1.0.0", "status": "running"}


@app.get("/health", tags=["상태"])
async def health():
    return {"status": "healthy"}
