"""Add catalog reviews for accommodations and detail catalog items.

Revision ID: 20260616_0008
Revises: 20260522_0007
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260616_0008"
down_revision: Union[str, None] = "20260522_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "catalog_reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("entity_type", sa.String(length=32), nullable=False),
        sa.Column("entity_id", sa.String(length=128), nullable=False),
        sa.Column("category", sa.String(length=64), server_default="", nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("body", sa.Text(), server_default="", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint(
            "user_id",
            "entity_type",
            "entity_id",
            "category",
            name="uq_catalog_reviews_user_entity",
        ),
    )
    op.create_index("ix_catalog_reviews_user_id", "catalog_reviews", ["user_id"])
    op.create_index("ix_catalog_reviews_entity_type", "catalog_reviews", ["entity_type"])
    op.create_index("ix_catalog_reviews_entity_id", "catalog_reviews", ["entity_id"])


def downgrade() -> None:
    op.drop_index("ix_catalog_reviews_entity_id", table_name="catalog_reviews")
    op.drop_index("ix_catalog_reviews_entity_type", table_name="catalog_reviews")
    op.drop_index("ix_catalog_reviews_user_id", table_name="catalog_reviews")
    op.drop_table("catalog_reviews")
