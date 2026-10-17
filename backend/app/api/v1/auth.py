import re
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User

router = APIRouter()

PHONE_RE = re.compile(r"^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$")


class RegisterRequest(BaseModel):
    email: EmailStr
    phone: str = Field(min_length=16, max_length=16)
    last_name: str = Field(min_length=1, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    middle_name: str = Field(min_length=1, max_length=100)
    login: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(min_length=8, max_length=128)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not PHONE_RE.match(value):
            raise ValueError("Номер телефона должен быть в формате +7(999)999-99-99")
        return value


class LoginRequest(BaseModel):
    login: str
    password: str

    @field_validator("login", "password")
    @classmethod
    def not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Заполните все поля")
        return value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UpdateProfileRequest(BaseModel):
    email: EmailStr | None = None
    phone: str | None = Field(default=None, min_length=16, max_length=16)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, min_length=1, max_length=100)
    default_origin: str | None = Field(default=None, min_length=1, max_length=255)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is not None and not PHONE_RE.match(value):
            raise ValueError("Номер телефона должен быть в формате +7(999)999-99-99")
        return value


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "last_name": user.last_name,
        "first_name": user.first_name,
        "middle_name": user.middle_name,
        "login": user.login,
        "full_name": user.full_name,
        "default_origin": user.default_origin,
    }


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
    )


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    normalized_email = payload.email.lower()

    existing = db.execute(
        select(User).where(
            (User.email == normalized_email) |
            (User.login == payload.login) |
            (User.phone == payload.phone)
        )
    ).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email, логином или телефоном уже существует",
        )

    user = User(
        email=normalized_email,
        phone=payload.phone,
        last_name=payload.last_name,
        first_name=payload.first_name,
        middle_name=payload.middle_name,
        login=payload.login,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    return {"message": "Успешная регистрация"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.execute(
        select(User).where(
            (User.email == payload.login.lower()) |
            (User.login == payload.login)
        )
    ).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise _unauthorized("Неверный логин или пароль")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.get("/me")
def me(user: Annotated[User, Depends(get_current_user)]) -> dict:
    return _serialize_user(user)


@router.patch("/me")
def update_me(
    payload: UpdateProfileRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> dict:
    updates = payload.model_dump(exclude_unset=True)

    if "email" in updates:
        normalized_email = updates["email"].lower()
        conflict = db.execute(
            select(User).where(User.email == normalized_email, User.id != user.id)
        ).scalar_one_or_none()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Пользователь с таким email уже существует",
            )
        updates["email"] = normalized_email

    if "phone" in updates:
        conflict = db.execute(
            select(User).where(User.phone == updates["phone"], User.id != user.id)
        ).scalar_one_or_none()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Пользователь с таким телефоном уже существует",
            )

    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return _serialize_user(user)
