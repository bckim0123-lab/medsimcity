import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import database, create_tables
from .seed import seed_data
from .routers import facilities, analysis, sync

# CORS 허용 오리진 목록
# 환경변수로 추가 도메인을 쉼표 구분으로 지정 가능
_BUILTIN = [
    "https://medsimcity.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
_extra = os.environ.get("ALLOWED_ORIGINS", "")
_extra_list = [o.strip() for o in _extra.split(",") if o.strip()]
ALLOWED_ORIGINS = list(dict.fromkeys(_BUILTIN + _extra_list))


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
    redirect_slashes=False,
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
