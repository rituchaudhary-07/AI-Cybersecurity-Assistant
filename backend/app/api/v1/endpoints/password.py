from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.services.password_analyzer import evaluate_password_strength

router = APIRouter()

class PasswordCheckRequest(BaseModel):
    password: str

@router.post("/analyze-password")
async def analyze_password(request: PasswordCheckRequest) -> Dict[str, Any]:
    """Evaluates password strength using entropy math, regex rules, and ML scoring."""
    result = evaluate_password_strength(request.password)
    return result
