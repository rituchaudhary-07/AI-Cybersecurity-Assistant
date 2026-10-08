from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.url_scanner import analyze_url
from app.api.v1.endpoints.auth import get_current_user_optional

router = APIRouter()

class UrlScanRequest(BaseModel):
    url: str

@router.post("/scan/url")
async def scan_url_endpoint(request: UrlScanRequest, current_user: dict = Depends(get_current_user_optional)):
    if not request.url or not request.url.strip():
        raise HTTPException(status_code=400, detail="Please provide a valid URL to analyze.")
    
    result = analyze_url(request.url)
    return result
