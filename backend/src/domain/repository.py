from pydantic import BaseModel

class Repository(BaseModel):
    id: int
    name: str
    owner: str
    stars: int
    language: str | None
    url: str
    description: str | None
