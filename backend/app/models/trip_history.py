from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TripHistory(Base):
    __tablename__ = "trip_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id"), nullable=True, index=True)
    trip_name: Mapped[str] = mapped_column(String(255))
    total_cost_label: Mapped[str] = mapped_column(String(64))
    destination: Mapped[str | None] = mapped_column(String(255), nullable=True)
    origin: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    passengers: Mapped[int | None] = mapped_column(Integer, nullable=True)
    hotel_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    room_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    flight_title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    baggage_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    refund_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    total_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    snapshot_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
