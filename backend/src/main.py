from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.api.routes import auth, repositories
from src.middlewares.error_handler import custom_exception_handler

app = FastAPI(title="GitHub Scout API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler
app.add_exception_handler(Exception, custom_exception_handler)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(repositories.router, prefix="/api/repos", tags=["repositories"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
