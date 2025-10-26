from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from sqlalchemy.orm import Session

from backend.app.schemas.user import (
    UserResponse, UserLogin, UserCreate, Token, TokenWithRefresh,
    PasswordResetRequest, PasswordResetConfirm, EmailVerificationRequest, MessageResponse
)
from backend.app.db.database import get_db, User, Session as SessionModel, RefreshToken
from .helpFunc import (
    get_current_user,
    get_user_by_username,
    get_user_by_email,
    get_user_by_id,
    authenticate_user,
    create_user_session,
    create_refresh_token_record,
    verify_refresh_token,
    get_client_info
)
from backend.app.db.auth import (
    get_password_hash,
    create_access_token,
    create_refresh_token_data,
    create_verification_token,
    create_reset_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    RESET_TOKEN_EXPIRE_HOURS,
    timedelta
)

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user_data.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    db_user = get_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(user_data.password)
    verification_token = create_verification_token()

    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        verification_token=verification_token
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Здесь должна быть логика отправки email с verification_token
    print(f"Verification token for {user.email}: {verification_token}")

    return user


@router.post("/login", response_model=TokenWithRefresh)
def login(user_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    client_info = get_client_info(request)

    user = authenticate_user(
        db,
        user_data.username,
        user_data.password,
        client_info["ip_address"],
        client_info["user_agent"]
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    refresh_token = create_refresh_token_record(db, user.id)
    create_user_session(db, user.id, client_info["ip_address"], client_info["user_agent"])

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token
    }


@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    user = verify_refresh_token(db, refresh_token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    # Удаляем сессии пользователя
    db.query(SessionModel).filter(SessionModel.user_id == current_user.id).delete()

    # Удаляем refresh tokens
    db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).delete()

    db.commit()

    return {"message": "Successfully logged out"}


@router.post("/password-reset-request", response_model=MessageResponse)
def password_reset_request(data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if user:
        reset_token = create_reset_token()
        user.reset_password_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)
        db.commit()

        # Здесь должна быть логика отправки email с reset_token
        print(f"Password reset token for {user.email}: {reset_token}")

    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/password-reset-confirm", response_model=MessageResponse)
def password_reset_confirm(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.reset_password_token == data.token,
        User.reset_token_expires > datetime.utcnow()
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    user.hashed_password = get_password_hash(data.new_password)
    user.reset_password_token = None
    user.reset_token_expires = None
    user.login_attempts = 0
    user.locked_until = None
    db.commit()

    return {"message": "Password successfully reset"}


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(data: EmailVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == data.token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )

    user.email_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Email successfully verified"}


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    new_token = create_verification_token()
    current_user.verification_token = new_token
    db.commit()

    # Здесь должна быть логика отправки email с новым токеном
    print(f"New verification token for {current_user.email}: {new_token}")

    return {"message": "Verification email sent"}


@router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/")
def read_root():
    return {"message": "Auth API is running"}