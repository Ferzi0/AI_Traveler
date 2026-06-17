from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260429_0003"
down_revision: Union[str, None] = "20260429_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("origin", sa.String(length=255), nullable=True))
    op.add_column("trips", sa.Column("start_date", sa.Date(), nullable=True))
    op.add_column("trips", sa.Column("end_date", sa.Date(), nullable=True))
    op.add_column(
        "trips", sa.Column("passengers", sa.Integer(), nullable=False, server_default="1")
    )
    op.add_column(
        "trips", sa.Column("round_trip", sa.Boolean(), nullable=False, server_default=sa.true())
    )


def downgrade() -> None:
    op.drop_column("trips", "round_trip")
    op.drop_column("trips", "passengers")
    op.drop_column("trips", "end_date")
    op.drop_column("trips", "start_date")
    op.drop_column("trips", "origin")
