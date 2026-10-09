from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.services.url_scanner import analyze_url
from app.api.v1.endpoints.auth import get_current_user_optional

router = APIRouter()

class UrlScanRequest(BaseModel):
    url: str = Field(..., max_length=4096, description="Target URL to scan for phishing threats")

@router.post("/scan/url")
async def scan_url_endpoint(request: UrlScanRequest, current_user: dict = Depends(get_current_user_optional)):
    cleaned_url = request.url.strip() if request.url else ""
    if not cleaned_url:
        raise HTTPException(status_code=400, detail="Please provide a valid, non-empty URL to analyze.")
    
    if len(cleaned_url) > 4096:
        raise HTTPException(status_code=400, detail="URL exceeds maximum allowed length of 4096 characters.")

    try:
        result = analyze_url(cleaned_url)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or malformed URL structure provided.")



