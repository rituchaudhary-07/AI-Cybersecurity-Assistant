from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.chatbot import generate_security_chat_response

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@router.post("/message")
async def chat_message(request: ChatRequest) -> Dict[str, Any]:
    """Generates RAG-enhanced LLM cybersecurity advice response."""
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")
    
    formatted_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    result = await generate_security_chat_response(formatted_messages)
    
    if isinstance(result, dict):
        response_text = result.get("response", "")
        citations = result.get("citations", [])
    else:
        response_text = str(result)
        citations = []
    
    return {
        "reply": {
            "role": "assistant",
            "content": response_text
        },
        "citations": citations,
        "rag_active": True
    }
