from fastapi import APIRouter
from app.api.v1.endpoints import auth, password, chat, url, logs, vulnerability, reports, qr, spam

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(password.router, tags=["Password Strength Analyzer"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Cybersecurity Chatbot (RAG)"])
api_router.include_router(url.router, tags=["URL Phishing Scanner"])
api_router.include_router(logs.router, tags=["Log File Analyzer"])
api_router.include_router(vulnerability.router, tags=["Web Vulnerability Scanner"])
api_router.include_router(reports.router, tags=["AI Reports & Recommendations"])
api_router.include_router(qr.router, tags=["QR Code Safety Checker"])
api_router.include_router(spam.router, tags=["Spam/Scam Message Detector"])
