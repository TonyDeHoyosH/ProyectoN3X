from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Required for cookie security
    COOKIE_SECURE: bool = False # Set True in Prod with HTTPS
    COOKIE_SAMESITE: str = "lax"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
