from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

async def custom_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"},
    )
