from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session, sessionmaker

revision: str = "20260512_0004"
down_revision: Union[str, None] = "20260429_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "constructor_destinations",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("country", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "constructor_accommodations",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("public_id", sa.String(length=64), nullable=False),
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("base_price_per_night", sa.Float(), nullable=False),
        sa.Column("distance_km", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["destination_id"], ["constructor_destinations.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_id"),
    )
    op.create_index(
        "ix_constructor_accommodations_destination_id",
        "constructor_accommodations",
        ["destination_id"],
        unique=False,
    )

    op.create_table(
        "constructor_accommodation_rooms",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("accommodation_id", sa.Integer(), nullable=False),
        sa.Column("room_key", sa.String(length=32), nullable=False),
        sa.Column("room_name", sa.String(length=255), nullable=False),
        sa.Column("price_multiplier", sa.Float(), nullable=False),
        sa.Column("max_persons", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["accommodation_id"], ["constructor_accommodations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_constructor_accommodation_rooms_accommodation_id",
        "constructor_accommodation_rooms",
        ["accommodation_id"],
        unique=False,
    )

    op.create_table(
        "constructor_transport_legs",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("public_id", sa.String(length=64), nullable=False),
        sa.Column("destination_id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("duration_min", sa.Integer(), nullable=False),
        sa.Column("price_per_person", sa.Float(), nullable=False),
        sa.Column("airline", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("aircraft_model", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("cabin_class", sa.String(length=64), nullable=False, server_default="economy"),
        sa.Column("source_url", sa.String(length=512), nullable=False, server_default=""),
        sa.Column("price_includes", sa.Text(), nullable=False, server_default="[]"),
    )
    op.create_index(
        "ix_constructor_transport_legs_destination_id",
        "constructor_transport_legs",
        ["destination_id"],
        unique=False,
    )

    bind = op.get_bind()
    SessionLocal = sessionmaker(bind=bind, class_=Session)
    session = SessionLocal()
    try:
        from app.models.constructor_catalog import (
            ConstructorAccommodation,
            ConstructorAccommodationRoom,
            ConstructorDestination,
            ConstructorTransportLeg,
        )

        phuket = ConstructorDestination(slug="phuket", title="Пхукет", country="Таиланд")
        london = ConstructorDestination(slug="london", title="Лондон", country="Великобритания")
        istanbul = ConstructorDestination(slug="istanbul", title="Стамбул", country="Турция")
        session.add_all([phuket, london, istanbul])
        session.flush()

        room_templates = [
            ("std", "Стандарт", 1.0, 2),
            ("family", "Семейный", 1.35, 4),
            ("suite", "Люкс", 1.8, 4),
        ]

        accommodations_payload = [
            (phuket.id, "acc_phuket_laguna", "Laguna Skypark", "hotel", 8.9, 1520.0, 1.6),
            (phuket.id, "acc_phuket_hostel", "Blue Wave Hostel", "hostel", 8.1, 430.0, 2.4),
            (london.id, "acc_london_hotel", "London Riverside Hotel", "hotel", 9.1, 2140.0, 3.1),
        ]
        acc_entities: list[ConstructorAccommodation] = []
        for dest_id, pid, title, kind, rating, price, dist in accommodations_payload:
            acc = ConstructorAccommodation(
                public_id=pid,
                destination_id=dest_id,
                title=title,
                kind=kind,
                rating=rating,
                base_price_per_night=price,
                distance_km=dist,
            )
            session.add(acc)
            acc_entities.append(acc)
        session.flush()

        for acc in acc_entities:
            for key, name, mult, max_p in room_templates:
                session.add(
                    ConstructorAccommodationRoom(
                        accommodation_id=acc.id,
                        room_key=key,
                        room_name=name,
                        price_multiplier=mult,
                        max_persons=max_p,
                    )
                )

        legs_payload = [
            (phuket.id, "tr_phuket_air_1", "air", "Авиаперелет SU 274", 620, 780.0),
            (phuket.id, "tr_phuket_air_2", "air", "Авиаперелет EK 341", 710, 640.0),
            (phuket.id, "tr_phuket_air_3", "air", "Авиаперелет TK 412", 680, 710.0),
            (london.id, "tr_london_air_1", "air", "Авиаперелет BA 872", 350, 520.0),
        ]
        for dest_id, pid, kind, title, duration, price in legs_payload:
            session.add(
                ConstructorTransportLeg(
                    public_id=pid,
                    destination_id=dest_id,
                    kind=kind,
                    title=title,
                    duration_min=duration,
                    price_per_person=price,
                )
            )

        session.commit()
    finally:
        session.close()


def downgrade() -> None:
    op.drop_index(
        "ix_constructor_transport_legs_destination_id",
        table_name="constructor_transport_legs",
    )
    op.drop_table("constructor_transport_legs")

    op.drop_index(
        "ix_constructor_accommodation_rooms_accommodation_id",
        table_name="constructor_accommodation_rooms",
    )
    op.drop_table("constructor_accommodation_rooms")

    op.drop_index(
        "ix_constructor_accommodations_destination_id",
        table_name="constructor_accommodations",
    )
    op.drop_table("constructor_accommodations")

    op.drop_table("constructor_destinations")
