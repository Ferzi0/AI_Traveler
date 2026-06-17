from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260429_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
    "users",
    sa.Column("id", sa.Integer(), primary_key=True),

    sa.Column("email", sa.String(length=255), nullable=False),
    sa.Column("phone", sa.String(length=20), nullable=False),
    sa.Column("last_name", sa.String(length=100), nullable=False),
    sa.Column("first_name", sa.String(length=100), nullable=False),
    sa.Column("middle_name", sa.String(length=100), nullable=False),
    sa.Column("login", sa.String(length=100), nullable=False),
    sa.Column("hashed_password", sa.String(length=255), nullable=False),
)

    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_phone", "users", ["phone"], unique=True)
    op.create_index("ix_users_login", "users", ["login"], unique=True)

    op.create_table(
        "trips",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("destination", sa.String(length=255), nullable=False),
    )
    op.create_index("ix_trips_id", "trips", ["id"], unique=False)
    op.create_index("ix_trips_user_id", "trips", ["user_id"], unique=False)

    op.create_table(
        "favorites",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("place_name", sa.String(length=255), nullable=False),
    )
    op.create_index("ix_favorites_id", "favorites", ["id"], unique=False)
    op.create_index("ix_favorites_user_id", "favorites", ["user_id"], unique=False)

    op.create_table(
        "trip_history",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("trip_name", sa.String(length=255), nullable=False),
        sa.Column("total_cost_label", sa.String(length=64), nullable=False),
    )
    op.create_index("ix_trip_history_id", "trip_history", ["id"], unique=False)
    op.create_index("ix_trip_history_user_id", "trip_history", ["user_id"], unique=False)

    op.create_table(
        "route_points",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trip_id", sa.Integer(), sa.ForeignKey("trips.id"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
    )
    op.create_index("ix_route_points_id", "route_points", ["id"], unique=False)
    op.create_index("ix_route_points_trip_id", "route_points", ["trip_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_route_points_trip_id", table_name="route_points")
    op.drop_index("ix_route_points_id", table_name="route_points")
    op.drop_table("route_points")

    op.drop_index("ix_trip_history_user_id", table_name="trip_history")
    op.drop_index("ix_trip_history_id", table_name="trip_history")
    op.drop_table("trip_history")

    op.drop_index("ix_favorites_user_id", table_name="favorites")
    op.drop_index("ix_favorites_id", table_name="favorites")
    op.drop_table("favorites")

    op.drop_index("ix_trips_user_id", table_name="trips")
    op.drop_index("ix_trips_id", table_name="trips")
    op.drop_table("trips")

    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
