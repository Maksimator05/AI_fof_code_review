from datetime import datetime, timedelta
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Request,
    File,
    UploadFile
)
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session
from pydantic import EmailStr
import os

from backend.app.schemas.user import UserRegister, UserLogin, UserResponse, Token
from backend.app.schemas.code_analysis import (
    CodeAnalysisRequest,
    CodeAnalysisResponse,
    MessageCreateRequest,
    MessageResponse,
    FileUploadResponse
)
from backend.app.models import User, UserSettings, Conversation, Message
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

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
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

    username: str = payload.get("sub")
    token_type: str = payload.get("type")

    if token_type != "access" or username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or Username",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_username(db, username)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def create_conversation_title(body: str, max_length: int = 30) -> str:
    """Создаёт краткий заголовок беседы из первых слов сообщения"""
    words = body.strip().split()
    if not words:
        return "Новая беседа"
    title = " ".join(words[:5])
    return (title[:max_length] + "...") if len(title) > max_length else title


# === AUTH & USER ENDPOINTS ===

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

    user_settings = UserSettings(user_id=user.id)
    db.add(user_settings)
    db.commit()

    return user


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_username(db, user_data.username)

    if (not user) or (not verify_password(user_data.password, user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="User is inactive"
        )

    user.last_login = datetime.utcnow()
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": user.username, "type": "access"},
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_token(
        data={"user_id": user.id, "type": "refresh"},
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
        secure=False,
        samesite="strict",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return response


@router.post("/refresh", response_model=Token)
def refresh_access_token(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found in cookie",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("user_id")
        token_type = payload.get("type")
    except JWTError as e:
        response = JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": f"Refresh token not decoded. ERR: {str(e)}"}
        )
        response.delete_cookie(key="refresh_token", httponly=True)
        return response

    if (user_id is None) or (token_type != "refresh"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(db, int(user_id))

    if (not user) or (not user.is_active):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User incorrect or locked",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": user.username, "type": "access"},
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
        secure=False,  # согласовано с login
        httponly=True
    )
    return response


@router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# === CODE ANALYSIS & CHAT ENDPOINTS ===

@router.post(
    path="/analyze-code",
    response_model=CodeAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Анализ кода с помощью ML",
    description="Отправляет код на анализ в ML-сервис и возвращает результаты"
)
async def send_code_for_analyze(
    request: CodeAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    ml_response = await ml_client.analyze_code(request.code)

    return CodeAnalysisResponse(
        analysis=ml_response["analysis"],
        status=ml_response["status"],
        language=request.language,
        timestamp=datetime.utcnow().isoformat()
    )


@router.post("/message", response_model=MessageResponse)
async def send_message(
    request: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Найти или создать беседу
    conversation = None
    if request.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    else:
        title = create_conversation_title(request.body)
        conversation = Conversation(
            user_id=current_user.id,
            title=title,
            language=request.language or "python"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Сообщение от пользователя
    user_message = Message(
        conversation_id=conversation.id,
        body=request.body,
        role="user"
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Отправка в ML
    try:
        ml_response = await ml_client.analyze_code(request.body)
        ml_content = ml_response.get("analysis", "No analysis returned")
        ml_status = ml_response.get("status", "error")
    except Exception as e:
        ml_content = f"Ошибка ML-сервиса: {str(e)}"
        ml_status = "error"

    # Ответ от ассистента
    assistant_message = Message(
        conversation_id=conversation.id,
        body=request.body,
        role="assistant",
        content=ml_content,
        is_error=(ml_status != "success")
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return MessageResponse(
        id=assistant_message.id,
        conversation_id=conversation.id,
        body=assistant_message.body,
        role=assistant_message.role,
        content=assistant_message.content,
        created_at=assistant_message.created_at.isoformat()
    )


@router.post("/load_file", response_model=FileUploadResponse)
async def load_code_file(
    file: UploadFile = File(...),
    conversation_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Проверка расширения
    allowed_ext = {'.py', '.js', '.ts', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.html', '.css', '.json', '.xml'}
    _, ext = os.path.splitext(file.filename or "")
    if ext.lower() not in allowed_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a code file."
        )

    # Чтение файла
    content = await file.read()
    try:
        code = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be valid UTF-8 text"
        )

    # Выбор или создание беседы
    conversation = None
    if conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        title = f"Анализ: {file.filename}"
        conversation = Conversation(user_id=current_user.id, title=title, language="auto")
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Сообщение от пользователя
    user_message = Message(
        conversation_id=conversation.id,
        body=f"Загружен файл: {file.filename}",
        role="user"
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Анализ
    try:
        ml_response = await ml_client.analyze_code(code)
        ml_content = ml_response.get("analysis", "No analysis returned")
        ml_status = ml_response.get("status", "error")
    except Exception as e:
        ml_content = f"Ошибка ML-сервиса: {str(e)}"
        ml_status = "error"

    # Ответ
    assistant_message = Message(
        conversation_id=conversation.id,
        body=code[:200] + "..." if len(code) > 200 else code,
        role="assistant",
        content=ml_content,
        is_error=(ml_status != "success")
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return FileUploadResponse(
        conversation_id=conversation.id,
        message=MessageResponse(
            id=assistant_message.id,
            conversation_id=conversation.id,
            body=assistant_message.body,
            role=assistant_message.role,
            content=assistant_message.content,
            created_at=assistant_message.created_at.isoformat()
        )
    )


@router.post("/answer", response_model=MessageResponse)
async def send_followup_answer(
    request: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not request.conversation_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="conversation_id is required for /answer"
        )

    conversation = db.query(Conversation).filter(
        Conversation.id == request.conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Сообщение от пользователя
    user_message = Message(
        conversation_id=conversation.id,
        body=request.body,
        role="user"
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Анализ
    try:
        ml_response = await ml_client.analyze_code(request.body)
        ml_content = ml_response.get("analysis", "No analysis returned")
        ml_status = ml_response.get("status", "error")
    except Exception as e:
        ml_content = f"Ошибка ML-сервиса: {str(e)}"
        ml_status = "error"

    # Ответ
    assistant_message = Message(
        conversation_id=conversation.id,
        body=request.body,
        role="assistant",
        content=ml_content,
        is_error=(ml_status != "success")
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return MessageResponse(
        id=assistant_message.id,
        conversation_id=conversation.id,
        body=assistant_message.body,
        role=assistant_message.role,
        content=assistant_message.content,
        created_at=assistant_message.created_at.isoformat()
    )


# === HEALTH CHECKS ===

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