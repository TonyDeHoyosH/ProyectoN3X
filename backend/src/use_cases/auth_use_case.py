import re
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
from src.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthUseCase:
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def validate_password(password: str) -> bool:
        if len(password) < 6:
            return False
        if not re.fullmatch(r"^[0-9a-fA-F]+$", password):
            return False
        return True

    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(hours=24))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> str | None:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload.get("sub")
        except JWTError:
            return None
