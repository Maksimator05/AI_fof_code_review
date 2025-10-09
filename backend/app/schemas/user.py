from pydantic import BaseModel

class UserInfo(BaseModel):
    id: int
    nickname: str
    email: str
