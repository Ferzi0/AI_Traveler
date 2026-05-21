from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TripNode(Base):
    __tablename__ = "trip_nodes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), index=True)
    node_type: Mapped[str] = mapped_column(String(50), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    estimated_cost: Mapped[float | None] = mapped_column(Float(), nullable=True)
    position_x: Mapped[int] = mapped_column(Integer(), default=0)
    position_y: Mapped[int] = mapped_column(Integer(), default=0)
