import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.services.spam_detector import analyze_message
from app.api.v1.endpoints.auth import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter()

class SpamScanRequest(BaseModel):
    message: str = Field(..., description="The SMS, Email, or WhatsApp message text to analyze.")
    source_type: Optional[str] = Field("General", description="Message source (e.g. SMS, Email, WhatsApp, General).")

@router.post("/scan/spam-message")
async def scan_spam_message_endpoint(
    request: SpamScanRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Analyzes an SMS, email, or chat message for phishing phrases, fake offers,
    urgency, OTP/password requests, payment demands, and malicious embedded links.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Please provide a message text to analyze.")

    if len(request.message) > 50000:
        raise HTTPException(status_code=400, detail="Message exceeds maximum allowed length of 50,000 characters.")

    try:
        result = analyze_message(request.message, source_type=request.source_type or "General")
        return result
    except Exception as e:
        logger.error(f"Spam message analysis engine error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Spam analysis failed: {str(e)}")
