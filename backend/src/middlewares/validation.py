from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SearchQuery(BaseModel):
    query: str
    sort: str = "stars"
    per_page: int = Field(default=20, ge=1, le=100)
    page: int = Field(default=1, ge=1)

class SaveRepositoryRequest(BaseModel):
    github_id: int
    name: str
    full_name: str
    owner: str
    url: str
    stars: int
    language: Optional[str] = None
