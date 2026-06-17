import re

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, validates

from app.core.database import Base

PHONE_RE = re.compile(r"^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    last_name: Mapped[str] = mapped_column(String(100))
    first_name: Mapped[str] = mapped_column(String(100))
    middle_name: Mapped[str] = mapped_column(String(100))

    login: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    default_origin: Mapped[str] = mapped_column(String(255), default="Москва")

    @validates("phone")
    def validate_phone(self, key: str, value: str) -> str:
        if not PHONE_RE.match(value):
            raise ValueError("Номер телефона должен быть в формате +7(999)999-99-99")
        return value

    @property
    def full_name(self) -> str:
        return f"{self.last_name} {self.first_name} {self.middle_name}".strip()
