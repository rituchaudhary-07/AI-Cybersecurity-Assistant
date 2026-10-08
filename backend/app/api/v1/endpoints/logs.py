import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional
from pydantic import BaseModel
from app.services.log_analyzer import analyze_log_content
from app.api.v1.endpoints.auth import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter()

class LogTextRequest(BaseModel):
    log_text: str

@router.post("/scan/logs")
async def scan_logs_endpoint(
    file: Optional[UploadFile] = File(None),
    log_text: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user_optional)
):
    content = ""
    if file:
        try:
            file_bytes = await file.read()
            content = file_bytes.decode("utf-8", errors="ignore")
        except Exception as err:
            logger.error(f"Failed to read uploaded log file: {err}")
            raise HTTPException(status_code=400, detail="Could not read uploaded log file format.")
    elif log_text:
        content = log_text
    else:
        raise HTTPException(status_code=400, detail="Please upload a log file or provide log text content.")

    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Log content cannot be empty.")

    try:
        result = analyze_log_content(content)
        return result
    except Exception as e:
        logger.error(f"Log analysis engine error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Log analysis failed: {str(e)}")

@router.post("/scan/logs/raw")
async def scan_logs_raw_endpoint(
    request: LogTextRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    if not request.log_text or not request.log_text.strip():
        raise HTTPException(status_code=400, detail="Log text cannot be empty.")

    try:
        result = analyze_log_content(request.log_text)
        return result
    except Exception as e:
        logger.error(f"Log analysis engine error on raw input: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Log analysis failed: {str(e)}")
