"""Extend favorites and trip_history for catalog items and trip snapshots.

Revision ID: 20260522_0007
Revises: 20260522_0006
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260522_0007"
down_revision: Union[str, None] = "20260522_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("favorites", sa.Column("item_type", sa.String(32), nullable=True))
    op.add_column("favorites", sa.Column("item_key", sa.String(128), nullable=True))
    op.add_column("favorites", sa.Column("title", sa.String(255), nullable=True))
    op.add_column("favorites", sa.Column("subtitle", sa.String(255), nullable=True))
    op.add_column("favorites", sa.Column("country", sa.String(128), nullable=True))
    op.add_column("favorites", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("favorites", sa.Column("image_urls", sa.Text(), nullable=True))
    op.add_column(
        "favorites",
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.execute(
        """
        UPDATE favorites
        SET item_type = 'place',
            item_key = place_name,
            title = place_name
        WHERE title IS NULL
        """
    )

    op.alter_column("favorites", "item_type", nullable=False)
    op.alter_column("favorites", "item_key", nullable=False)
    op.alter_column("favorites", "title", nullable=False)
    op.create_index("ix_favorites_user_type_key", "favorites", ["user_id", "item_type", "item_key"], unique=True)

    op.add_column("trip_history", sa.Column("trip_id", sa.Integer(), nullable=True))
    op.add_column("trip_history", sa.Column("destination", sa.String(255), nullable=True))
    op.add_column("trip_history", sa.Column("origin", sa.String(255), nullable=True))
    op.add_column("trip_history", sa.Column("start_date", sa.Date(), nullable=True))
    op.add_column("trip_history", sa.Column("end_date", sa.Date(), nullable=True))
    op.add_column("trip_history", sa.Column("passengers", sa.Integer(), nullable=True))
    op.add_column("trip_history", sa.Column("hotel_title", sa.String(255), nullable=True))
    op.add_column("trip_history", sa.Column("room_title", sa.String(255), nullable=True))
    op.add_column("trip_history", sa.Column("flight_title", sa.String(512), nullable=True))
    op.add_column("trip_history", sa.Column("baggage_title", sa.String(255), nullable=True))
    op.add_column("trip_history", sa.Column("refund_title", sa.String(255), nullable=True))
    op.add_column("trip_history", sa.Column("total_cost", sa.Float(), nullable=True))
    op.add_column("trip_history", sa.Column("snapshot_json", sa.Text(), nullable=True))
    op.add_column(
        "trip_history",
        sa.Column("saved_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_foreign_key(
        "fk_trip_history_trip_id",
        "trip_history",
        "trips",
        ["trip_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_trip_history_trip_id", "trip_history", type_="foreignkey")
    op.drop_column("trip_history", "saved_at")
    op.drop_column("trip_history", "snapshot_json")
    op.drop_column("trip_history", "total_cost")
    op.drop_column("trip_history", "refund_title")
    op.drop_column("trip_history", "baggage_title")
    op.drop_column("trip_history", "flight_title")
    op.drop_column("trip_history", "room_title")
    op.drop_column("trip_history", "hotel_title")
    op.drop_column("trip_history", "passengers")
    op.drop_column("trip_history", "end_date")
    op.drop_column("trip_history", "start_date")
    op.drop_column("trip_history", "origin")
    op.drop_column("trip_history", "destination")
    op.drop_column("trip_history", "trip_id")

    op.drop_index("ix_favorites_user_type_key", table_name="favorites")
    op.drop_column("favorites", "created_at")
    op.drop_column("favorites", "image_urls")
    op.drop_column("favorites", "description")
    op.drop_column("favorites", "country")
    op.drop_column("favorites", "subtitle")
    op.drop_column("favorites", "title")
    op.drop_column("favorites", "item_key")
    op.drop_column("favorites", "item_type")
