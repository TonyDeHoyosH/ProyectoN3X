import re
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.config import settings
from src.domain.user import User
from src.infrastructure.db import UserModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthUseCase:

    @staticmethod
    def validate_password(password: str) -> bool:
        if len(password) < 6:
            return False
        return bool(re.fullmatch(r"[0-9a-fA-F]+", password))

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    @staticmethod
    def create_access_token(user_id: int) -> str:
        expire = datetime.now(timezone.utc) + timedelta(days=1)
        to_encode = {"sub": str(user_id), "exp": expire}
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> int | None:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return int(user_id)
        except JWTError:
            return None

    @staticmethod
    async def register(db: AsyncSession, email: str, password: str) -> tuple[User | None, str]:
        user = User(email=email, password=password)
        if not user.validate():
            return None, "Invalid email format."
        if not AuthUseCase.validate_password(password):
            return None, "Password must be at least 6 chars and hexadecimal."

        stmt = select(UserModel).where(UserModel.email == email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            return None, "Email already registered."

        hashed = AuthUseCase.hash_password(password)
        db_user = UserModel(email=email, hashed_password=hashed)
        db.add(db_user)
        try:
            await db.commit()
            await db.refresh(db_user)
        except Exception:
            await db.rollback()
            return None, "Database error during registration."

        return User(id=db_user.id, email=db_user.email, password="", created_at=db_user.created_at), ""

    @staticmethod
    async def login(db: AsyncSession, email: str, password: str) -> tuple[str | None, str]:
        stmt = select(UserModel).where(UserModel.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user or not AuthUseCase.verify_password(password, user.hashed_password):
            return None, "Invalid email or password."
            
        token = AuthUseCase.create_access_token(user_id=user.id)
        return token, ""
