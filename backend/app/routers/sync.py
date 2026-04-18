"""
HIRA 데이터 동기화 엔드포인트.

운영 환경에서는 이 엔드포인트를 Cron(주 1회 등)으로 호출하거나
보안을 위해 내부 네트워크 전용으로 제한하세요.
"""
import asyncio
import os
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File
from pydantic import BaseModel

from ..services.hira_sync import sync_from_hira_api, import_from_csv

router = APIRouter()

# 현재 진행 중인 동기화 상태 (메모리 내 단순 상태 추적)
_sync_status: dict[str, Any] = {"running": False, "last_result": None, "error": None}


class HiraSyncRequest(BaseModel):
    service_key: str
    sido: str = ""           # 빈 문자열이면 전국
    limit: int | None = None # 테스트용 건수 제한


async def _run_sync(service_key: str, sido: str, limit: int | None) -> None:
    """BackgroundTask로 실행되는 실제 동기화 함수."""
    _sync_status["running"] = True
    _sync_status["error"] = None
    try:
        result = await sync_from_hira_api(service_key=service_key, sido=sido, limit=limit)
        _sync_status["last_result"] = result
        print(f"[HIRA Sync BG] 완료: {result}")
    except Exception as e:
        _sync_status["error"] = str(e)
        print(f"[HIRA Sync BG] 오류: {e}")
    finally:
        _sync_status["running"] = False


@router.post("/hira-api")
async def sync_hira_api(req: HiraSyncRequest, background_tasks: BackgroundTasks):
    """
    공공데이터포털 HIRA OpenAPI에서 요양기관 데이터를 백그라운드로 동기화합니다.
    - 즉시 202 응답 반환 → 클라이언트 연결이 끊겨도 서버에서 계속 처리
    - GET /api/sync/status 로 진행 상황 확인 가능
    """
    if _sync_status["running"]:
        raise HTTPException(status_code=409, detail="이미 동기화가 진행 중입니다.")
    background_tasks.add_task(_run_sync, req.service_key, req.sido, req.limit)
    return {"status": "started", "message": f"백그라운드 동기화 시작 (sido={req.sido or '전국'})"}


@router.get("/status")
async def sync_status():
    """현재 동기화 진행 상태를 반환합니다."""
    return _sync_status


@router.post("/hira-csv")
async def sync_hira_csv(file: UploadFile = File(...)):
    """
    HIRA 사이트에서 수동 다운로드한 CSV 파일을 업로드하여 DB에 적재합니다.

    사용법:
      curl -X POST http://localhost:8000/api/sync/hira-csv \\
           -F "file=@전국의료기관현황.csv"
    """
    import tempfile, shutil, pathlib

    suffix = pathlib.Path(file.filename or "data.csv").suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = await import_from_csv(tmp_path)
        return {"status": "ok", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)
