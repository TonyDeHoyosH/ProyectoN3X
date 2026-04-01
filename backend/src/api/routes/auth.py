from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.infrastructure.db import get_db, UserModel
from src.use_cases.auth_use_case import AuthUseCase
from src.middlewares.validation import UserLogin, UserRegister
from src.config import settings
from datetime import timedelta

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Validate password
    if not AuthUseCase.validate_password(user_data.password):
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters and hexadecimal only.")
        
    # Check if exists
    result = await db.execute(select(UserModel).where(UserModel.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create user
    hashed_password = AuthUseCase.hash_password(user_data.password)
    new_user = UserModel(email=user_data.email, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user_data: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == user_data.email))
    user = result.scalars().first()
    
    if not user or not AuthUseCase.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = AuthUseCase.create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(days=1)
    )
    
    # Set HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
        max_age=86400 # 1 day
    )
    return {"message": "Logged in successfully"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE
    )
    return {"message": "Logged out successfully"}
