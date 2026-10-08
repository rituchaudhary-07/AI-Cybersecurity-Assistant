from fastapi import APIRouter, Depends, Response, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.pdf_generator import generate_pdf_report, analyze_structured_findings_ai
from app.api.v1.endpoints.auth import get_current_user_optional

router = APIRouter()

class AIAdviceRequest(BaseModel):
    findings: Optional[list] = []
    anomalies: Optional[list] = []
    target: Optional[str] = None
    score: Optional[int] = 100

@router.post("/reports/ai-advice")
async def analyze_findings_ai_endpoint(
    request: AIAdviceRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Synthesizes real scanner findings into prioritized P1-P4 AI Security Recommendations.
    """
    structured_data = {
        "findings": request.findings or [],
        "anomalies": request.anomalies or [],
        "target": request.target or "System Target",
        "score": request.score or 100
    }
    return analyze_structured_findings_ai(structured_data)

@router.get("/reports/recommendations")
async def get_recommendations_endpoint(current_user: dict = Depends(get_current_user_optional)):
    """Returns general baseline AI security recommendations."""
    default_data = {
        "target": "Platform Base",
        "findings": [
            {
                "title": "Missing HSTS Header",
                "severity": "High",
                "category": "HTTP_SECURITY_HEADER",
                "description": "HTTP Strict-Transport-Security header missing.",
                "evidence": "Response headers did not contain Strict-Transport-Security.",
                "recommendation": "Configure Strict-Transport-Security: max-age=31536000; includeSubDomains"
            }
        ],
        "anomalies": []
    }
    return analyze_structured_findings_ai(default_data)

@router.get("/reports/pdf")
async def download_pdf_report_endpoint(current_user: dict = Depends(get_current_user_optional)):
    """Generates and streams downloadable PDF Security Report."""
    user_info = current_user or {"username": "Security Auditor"}
    pdf_bytes = generate_pdf_report(health_score=92, user_info=user_info, scans_summary=[])
    
    headers = {
        'Content-Disposition': 'attachment; filename="AI_Cybersecurity_Audit_Report.pdf"'
    }
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
