from fastapi import APIRouter, Depends
from src.use_cases.search_repos_use_case import SearchReposUseCase
from src.middlewares.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class SearchParams(BaseModel):
    query: str
    sort: str = "stars"
    per_page: int = 10
    page: int = 1

@router.post("/search")
async def search_repos(params: SearchParams, current_user: str = Depends(get_current_user)):
    results = await SearchReposUseCase.execute(
        query=params.query,
        sort=params.sort,
        per_page=params.per_page,
        page=params.page
    )
    return results
