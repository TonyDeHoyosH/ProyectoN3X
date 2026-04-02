import logging
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle uncaught global exceptions."""
    logger.error(f"Unhandled error for {request.method} {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )
