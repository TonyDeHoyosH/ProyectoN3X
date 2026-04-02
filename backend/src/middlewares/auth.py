from fastapi import Request, HTTPException, status
from src.use_cases.auth_use_case import AuthUseCase

async def get_current_user(request: Request) -> int:
    """Dependency to extract and verify JWT token from cookies."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
        )
    
    user_id = AuthUseCase.verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )
    
    return user_id
