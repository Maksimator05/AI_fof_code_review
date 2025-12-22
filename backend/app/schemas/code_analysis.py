# backend/app/schemas/code_analysis.py

from pydantic import BaseModel, Field
from typing import Optional, List

class CodeAnalysisRequest(BaseModel):
    code: str
    language: Optional[str] = "python"

class CodeAnalysisResponse(BaseModel):
    analysis: str
    status: str
    language: Optional[str] = "python"
    timestamp: str

# --- НОВЫЕ СХЕМЫ ДЛЯ ЧАТА ---
class MessageCreateRequest(BaseModel):
    conversation_id: Optional[int] = None  # если None — создаётся новая беседа
    body: str = Field(..., min_length=1)   # текст сообщения (может содержать код или вопрос)
    language: Optional[str] = "python"

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    body: str
    role: str  # "user" или "assistant"
    content: Optional[str] = None  # ответ от ML
    created_at: str

    class Config:
        orm_mode = True

class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: str
    messages: List[MessageResponse]

    class Config:
        orm_mode = True

class FileUploadResponse(BaseModel):
    conversation_id: int
    message: MessageResponse