from pydantic import BaseModel, Field
from typing import Optional, List

# class CodeAnalysisRequest(BaseModel):
#     code: str
#     language: Optional[str] = "python"
#
# class CodeAnalysisResponse(BaseModel):
#     analysis: str
#     status: str
#     language: Optional[str] = "python"
#     timestamp: str

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
    messages: List[MessageResponse] = []

    class Config:
        orm_mode = True
        from_attributes = True

class ConversationListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    language: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    language: Optional[str] = None

class FileUploadResponse(BaseModel):
    conversation_id: int
    message: MessageResponse