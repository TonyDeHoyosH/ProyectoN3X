from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.infrastructure.db import get_db
from src.middlewares.validation import RegisterRequest, LoginRequest
from src.use_cases.auth_use_case import AuthUseCase

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)) -> dict:
    user, error = await AuthUseCase.register(db, request.email, request.password)
    if error or not user:
        raise HTTPException(status_code=400, detail=error)
    return {
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at
    }

@router.post("/login")
async def login(request: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)) -> dict:
    token, error = await AuthUseCase.login(db, request.email, request.password)
    if error or not token:
        raise HTTPException(status_code=401, detail=error)
        
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=86400
    )
    return {"message": "Login successful"}

@router.post("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE
    )
    return {"message": "Logout successful"}
