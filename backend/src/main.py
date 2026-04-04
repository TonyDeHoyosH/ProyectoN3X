from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from src.config import settings
from src.infrastructure.db import init_db

app = FastAPI(
    title="GitHub Scout API",
    description="API for searching and saving GitHub repositories",
    version="1.0.0"
)

# Configurar TrustedHostMiddleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*"]
)

# Configurar CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        await init_db()
        print("INFO: Database initialized")
    except Exception as e:
        print(f"INFO: Database initialized with errors: {e}")

@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Check if the API is running."""
    return {"status": "ok"}
