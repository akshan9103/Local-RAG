from datetime import timedelta
from typing import Any
from urllib import response
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from requests.exceptions import RequestException
from fastapi import Response
from app.core import security
from app.core.security import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(*, db: Session = Depends(get_db), user_in: UserCreate) -> Any:
    """
    Register a new user.
    """
    try:
        # Check if user with this email exists
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="A user with this email already exists.",
            )
        
        # Check if user with this username exists
        user = db.query(User).filter(User.username == user_in.username).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="A user with this username already exists.",
            )
        
        # Create new user
        user = User(
            email=user_in.email,
            username=user_in.username,
            hashed_password=security.get_password_hash(user_in.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except RequestException as e:
        raise HTTPException(
            status_code=503,
            detail="Network error or server is unreachable. Please try again later.",
        ) from e


@router.post("/token", response_model=Token)
def login_access_token(
    response: Response,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = security.create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires,
    )

    response.set_cookie(
        key="token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
        max_age=86400
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
    }

@router.post("/test-token", response_model=UserResponse)
def test_token(current_user: User = Depends(get_current_user)) -> Any:
    """
    Test access token by getting current user.
    """
    return current_user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Successfully logged out"}