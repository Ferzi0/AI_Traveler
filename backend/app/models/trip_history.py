from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TripHistory(Base):
    __tablename__ = "trip_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    trip_name: Mapped[str] = mapped_column(String(255))
    total_cost_label: Mapped[str] = mapped_column(String(64))
