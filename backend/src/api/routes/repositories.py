from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.infrastructure.db import get_db, SavedRepositoryModel
from src.infrastructure.github_client import GitHubClient
from src.middlewares.auth import get_current_user
from src.middlewares.validation import SearchQuery, SaveRepositoryRequest
from src.use_cases.search_repos_use_case import SearchReposUseCase

router = APIRouter(prefix="/api/repos", tags=["repositories"])

@router.post("/search")
async def search_repos(
    query: SearchQuery, 
    user_id: int = Depends(get_current_user)
) -> dict:
    github_client = GitHubClient()
    use_case = SearchReposUseCase(github_client)
    
    try:
        total, repos_dict, error = await use_case.execute(
            query=query.query,
            sort=query.sort,
            per_page=query.per_page,
            page=query.page
        )
        if error:
            raise HTTPException(status_code=502, detail=error)
            
        return {
            "total": total,
            "page": query.page,
            "per_page": query.per_page,
            "repositories": repos_dict
        }
    finally:
        await github_client.close()

@router.get("/saved")
async def get_saved_repos(
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    stmt = select(SavedRepositoryModel).where(
        SavedRepositoryModel.user_id == user_id
    ).order_by(SavedRepositoryModel.saved_at.desc())
    
    result = await db.execute(stmt)
    records = result.scalars().all()
    
    repositories = [
        {
            "id": record.id,
            "github_id": record.github_id,
            "name": record.name,
            "full_name": record.full_name,
            "owner": record.owner,
            "url": record.url,
            "stars": record.stars,
            "language": record.language,
            "saved_at": record.saved_at
        }
        for record in records
    ]
    
    return {
        "total": len(repositories),
        "repositories": repositories
    }

@router.post("/save")
async def save_repo(
    request: SaveRepositoryRequest,
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    stmt = select(SavedRepositoryModel).where(
        SavedRepositoryModel.user_id == user_id,
        SavedRepositoryModel.github_id == request.github_id
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Repository already saved")
        
    new_repo = SavedRepositoryModel(
        user_id=user_id,
        github_id=request.github_id,
        name=request.name,
        full_name=request.full_name,
        owner=request.owner,
        url=request.url,
        stars=request.stars,
        language=request.language
    )
    db.add(new_repo)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Database error saving repository.")
        
    return {"id": new_repo.id, "message": "Repository saved successfully"}

@router.delete("/saved/{repo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_repo(
    repo_id: int,
    user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> None:
    stmt = select(SavedRepositoryModel).where(SavedRepositoryModel.id == repo_id)
    result = await db.execute(stmt)
    repo = result.scalar_one_or_none()
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    if repo.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized to delete this repository")
        
    await db.delete(repo)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Database error deleting repository.")
