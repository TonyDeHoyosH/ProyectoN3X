from fastapi import Request, HTTPException, status
from src.use_cases.auth_use_case import AuthUseCase

async def get_current_user(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Strip 'Bearer ' if present
    if token.startswith("Bearer "):
        token = token[7:]
        
    email = AuthUseCase.verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return email
