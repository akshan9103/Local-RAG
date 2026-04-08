from fastapi import Request, status
from fastapi.responses import JSONResponse

class InvalidCredentialsException(Exception):
    """Custom exception for handling invalid or expired tokens."""
    pass

async def invalid_credentials_exception_handler(request: Request, exc: InvalidCredentialsException):
    """Handler that clears the cookie when InvalidCredentialsException is raised."""
    response = JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Could not validate credentials"},
        headers={"WWW-Authenticate": "Bearer"},
    )
    response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="lax")
    return response