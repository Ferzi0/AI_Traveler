from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TripEdge(Base):
    __tablename__ = "trip_edges"
    __table_args__ = (
        UniqueConstraint("trip_id", "source_node_id", "target_node_id", name="uq_trip_edge"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), index=True)
    source_node_id: Mapped[int] = mapped_column(ForeignKey("trip_nodes.id"), index=True)
    target_node_id: Mapped[int] = mapped_column(ForeignKey("trip_nodes.id"), index=True)
