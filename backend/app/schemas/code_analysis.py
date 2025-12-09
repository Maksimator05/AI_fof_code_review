from pydantic import BaseModel
from typing import Optional


class CodeAnalysisRequest(BaseModel):
    code: str
    language: Optional[str] = "python"


class CodeAnalysisResponse(BaseModel):
    analysis: str
    status: str
    language: Optional[str] = "python"
    timestamp: str