from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserInDB(UserBase):
    id: int
    hashed_password: str
    created_at: datetime
