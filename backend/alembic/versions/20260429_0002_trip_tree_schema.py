"""Trip tree schema

Revision ID: 20260429_0002
Revises: 20260429_0001
Create Date: 2026-04-29 20:12:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260429_0002"
down_revision: Union[str, None] = "20260429_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "trip_nodes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trip_id", sa.Integer(), sa.ForeignKey("trips.id"), nullable=False),
        sa.Column("node_type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("estimated_cost", sa.Float(), nullable=True),
        sa.Column("position_x", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("position_y", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_trip_nodes_id", "trip_nodes", ["id"], unique=False)
    op.create_index("ix_trip_nodes_trip_id", "trip_nodes", ["trip_id"], unique=False)
    op.create_index("ix_trip_nodes_node_type", "trip_nodes", ["node_type"], unique=False)

    op.create_table(
        "trip_edges",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trip_id", sa.Integer(), sa.ForeignKey("trips.id"), nullable=False),
        sa.Column("source_node_id", sa.Integer(), sa.ForeignKey("trip_nodes.id"), nullable=False),
        sa.Column("target_node_id", sa.Integer(), sa.ForeignKey("trip_nodes.id"), nullable=False),
        sa.UniqueConstraint(
            "trip_id", "source_node_id", "target_node_id", name="uq_trip_edge"
        ),
    )
    op.create_index("ix_trip_edges_id", "trip_edges", ["id"], unique=False)
    op.create_index("ix_trip_edges_trip_id", "trip_edges", ["trip_id"], unique=False)
    op.create_index(
        "ix_trip_edges_source_node_id", "trip_edges", ["source_node_id"], unique=False
    )
    op.create_index(
        "ix_trip_edges_target_node_id", "trip_edges", ["target_node_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_trip_edges_target_node_id", table_name="trip_edges")
    op.drop_index("ix_trip_edges_source_node_id", table_name="trip_edges")
    op.drop_index("ix_trip_edges_trip_id", table_name="trip_edges")
    op.drop_index("ix_trip_edges_id", table_name="trip_edges")
    op.drop_table("trip_edges")

    op.drop_index("ix_trip_nodes_node_type", table_name="trip_nodes")
    op.drop_index("ix_trip_nodes_trip_id", table_name="trip_nodes")
    op.drop_index("ix_trip_nodes_id", table_name="trip_nodes")
    op.drop_table("trip_nodes")
