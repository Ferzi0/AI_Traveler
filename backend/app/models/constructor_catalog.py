"""Справочники конструктора поездок (направления, жильё, номера, транспорт)."""

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ConstructorDestination(Base):
    __tablename__ = "constructor_destinations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    country: Mapped[str] = mapped_column(String(255))

    accommodations: Mapped[list["ConstructorAccommodation"]] = relationship(
        back_populates="destination",
        cascade="all, delete-orphan",
    )
    transport_legs: Mapped[list["ConstructorTransportLeg"]] = relationship(
        back_populates="destination",
        cascade="all, delete-orphan",
    )


class ConstructorAccommodation(Base):
    __tablename__ = "constructor_accommodations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    public_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("constructor_destinations.id"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255))
    kind: Mapped[str] = mapped_column(String(32))
    rating: Mapped[float] = mapped_column(Float())
    base_price_per_night: Mapped[float] = mapped_column(Float())
    distance_km: Mapped[float] = mapped_column(Float())

    destination: Mapped["ConstructorDestination"] = relationship(
        back_populates="accommodations",
    )
    rooms: Mapped[list["ConstructorAccommodationRoom"]] = relationship(
        back_populates="accommodation",
        cascade="all, delete-orphan",
        order_by="ConstructorAccommodationRoom.room_key",
    )


class ConstructorAccommodationRoom(Base):
    __tablename__ = "constructor_accommodation_rooms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    accommodation_id: Mapped[int] = mapped_column(
        ForeignKey("constructor_accommodations.id"),
        index=True,
    )
    room_key: Mapped[str] = mapped_column(String(32))
    room_name: Mapped[str] = mapped_column(String(255))
    price_multiplier: Mapped[float] = mapped_column(Float())
    max_persons: Mapped[int] = mapped_column(Integer())

    accommodation: Mapped["ConstructorAccommodation"] = relationship(
        back_populates="rooms",
    )


class ConstructorTransportLeg(Base):
    __tablename__ = "constructor_transport_legs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    public_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("constructor_destinations.id"),
        index=True,
    )
    kind: Mapped[str] = mapped_column(String(32))
    title: Mapped[str] = mapped_column(String(255))
    duration_min: Mapped[int] = mapped_column(Integer())
    price_per_person: Mapped[float] = mapped_column(Float())
    airline: Mapped[str] = mapped_column(String(128), default="")
    aircraft_model: Mapped[str] = mapped_column(String(128), default="")
    cabin_class: Mapped[str] = mapped_column(String(64), default="economy")
    source_url: Mapped[str] = mapped_column(String(512), default="")
    # JSON-массив строк: что входит в тариф
    price_includes: Mapped[str] = mapped_column(Text(), default="[]")

    destination: Mapped["ConstructorDestination"] = relationship(
        back_populates="transport_legs",
    )
