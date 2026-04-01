import httpx
from fastapi import HTTPException

async def search_repositories(query: str, sort: str = "stars", per_page: int = 10, page: int = 1) -> dict:
    url = "https://api.github.com/search/repositories"
    params = {
        "q": query,
        "sort": sort,
        "per_page": per_page,
        "page": page
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="GitHub API Error")
            
        return response.json()
