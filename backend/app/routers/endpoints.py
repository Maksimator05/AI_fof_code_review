from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session
from pydantic import EmailStr

from backend.app.schemas.user import UserRegister, UserLogin, UserResponse, Token
from backend.app.schemas.code_analysis import CodeAnalysisRequest, CodeAnalysisResponse
from backend.app.models import User, UserSettings
from backend.app.db.database import get_db
from backend.app.auth import (
    get_password_hash,
    verify_password,
    create_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS
)
from backend.app.clients.ml_client import ml_client


router = APIRouter()

security = HTTPBearer()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: EmailStr):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security),
                     db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token. JWTEr: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    token_type: str = payload.get("type")

    if token_type != "access" or user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or Username",
        )

    user = get_user_by_id(db, int(user_id))
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    hashed_password = get_password_hash(user_data.password)

    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    user_settings = UserSettings(
        user_id=user.id
    )
    db.add(user_settings)
    db.commit()

    return user


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_username(db, user_data.username)

    if (not user) | (not verify_password(user_data.password, user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account temporarily locked due to too many failed login attempts"
        )

    user.last_login = datetime.utcnow()
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": user.id, "type": "access"},
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_token(
        data={"sub": user.id, "type": "refresh"},
        expires_delta=refresh_token_expires
    )

    response = JSONResponse(
        content={
            "access_token": access_token,
            "token_type": "bearer"
        }
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        # secure=True,
        secure=False,
        samesite="strict",
        max_age=7*24*60*60
    )

    return response


@router.post("/refresh", response_model=Token)
def refresh_access_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found in cookie",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        payload = decode_token(refresh_token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
    except JWTError as e:
        response = JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": f"Refresh token not decoded. ERR: {str(e)}"}
        )
        response.delete_cookie(
            key="refresh_token",
            secure=True,
            httponly=True
        )
        return response

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    if token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": int(user_id), "type": "access"},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout():
    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Successful logged out"}
    )
    response.delete_cookie(
        key="refresh_token",
        secure=True,
        httponly=True
    )

    return response


@router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# /message
# /load_file
# /answer
@router.post(
    path="/analyze-code",
    response_model=CodeAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Анализ кода с помощью ML",
    description="Отправляет код на анализ в ML-сервис и возвращает результаты"
)
async def send_code_for_analyze(request: CodeAnalysisRequest, current_user: User = Depends(get_current_user)):
    # использование переменной пока пусть так, надо допилить сообщения и переменная будет использоваться
    #TODO внести еще нужно изменения в сообщения и в беседу пользователя

    ml_response = await ml_client.analyze_code(request.code)

    return CodeAnalysisResponse(
        analysis=ml_response["analysis"],
        status=ml_response["status"],
        language=request.language,
        timestamp=datetime.utcnow().isoformat()
    )


@router.get("/health-api", status_code=status.HTTP_200_OK)
def get_api_health():
    return JSONResponse(content={"message": "API is running"})


@router.get("/health-ml", status_code=status.HTTP_200_OK)
async def get_ml_health():
    try:
        await ml_client.check_health()
        response = JSONResponse(
            content={
                "status": "available",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except HTTPException as e:
        response = JSONResponse(
            content={
                "status": "unavailable",
                "timestamp": datetime.utcnow().isoformat(),
                "detail": str(e)
            }
        )
    return response