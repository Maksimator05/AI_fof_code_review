from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.app.db.database import User, Session as SessionModel, RefreshToken, LoginHistory, get_db
from backend.app.db.auth import (
    verify_password,
    verify_token,
    create_refresh_token,
    create_verification_token,
    create_reset_token
)
from datetime import datetime, timedelta
import secrets

security = HTTPBearer()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, username: str, password: str, ip_address: str = None, user_agent: str = None):
    user = get_user_by_username(db, username)

    if not user:
        log_login_attempt(db, None, False, ip_address, user_agent)
        return False

    if is_account_locked(user):
        log_login_attempt(db, user.id, False, ip_address, user_agent)
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account temporarily locked due to too many failed login attempts"
        )

    if not verify_password(password, user.hashed_password):
        increment_login_attempts(db, user)
        log_login_attempt(db, user.id, False, ip_address, user_agent)
        return False

    reset_login_attempts(db, user)
    user.last_login = datetime.utcnow()
    db.commit()
    log_login_attempt(db, user.id, True, ip_address, user_agent)
    return user


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token)
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
            detail="Invalid token type",
        )

    user = get_user_by_username(db, username=username)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


def create_user_session(db: Session, user_id: int, ip_address: str = None, user_agent: str = None):
    session_token = secrets.token_urlsafe(32)
    session = SessionModel(
        user_id=user_id,
        token=session_token,
        expires_at=datetime.utcnow() + timedelta(days=7),
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(session)
    db.commit()
    return session_token


def log_login_attempt(db: Session, user_id: int, success: bool, ip_address: str = None, user_agent: str = None):
    log = LoginHistory(
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent,
        success=success
    )
    db.add(log)
    db.commit()


def is_account_locked(user: User):
    if user.locked_until and user.locked_until > datetime.utcnow():
        return True
    return False


def reset_login_attempts(db: Session, user: User):
    user.login_attempts = 0
    user.locked_until = None
    db.commit()


def increment_login_attempts(db: Session, user: User):
    user.login_attempts += 1
    if user.login_attempts >= 5:  # Блокировка после 5 неудачных попыток
        user.locked_until = datetime.utcnow() + timedelta(minutes=30)
    db.commit()


def create_refresh_token_record(db: Session, user_id: int):
    refresh_token = create_refresh_token()
    token_record = RefreshToken(
        user_id=user_id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    db.add(token_record)
    db.commit()
    return refresh_token


def verify_refresh_token(db: Session, token: str):
    token_record = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    if not token_record or token_record.expires_at < datetime.utcnow():
        return None
    return token_record.user


def get_client_info(request: Request):
    return {
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent")
    }