from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260513_0005"
down_revision: Union[str, None] = "20260512_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

LEG_DETAILS: dict[str, dict[str, str]] = {
    "tr_phuket_air_1": {
        "airline": "Аэрофлот",
        "aircraft_model": "Boeing 777-300ER",
        "cabin_class": "economy",
        "source_url": "https://www.aeroflot.ru/",
        "price_includes": '["Ручная кладь 10 кг","Питание на борту","Выбор места за доплату"]',
    },
    "tr_phuket_air_2": {
        "airline": "Emirates",
        "aircraft_model": "Airbus A380",
        "cabin_class": "economy",
        "source_url": "https://www.emirates.com/",
        "price_includes": '["Ручная кладь 7 кг","Багаж 23 кг","Питание","Развлечения на борту"]',
    },
    "tr_phuket_air_3": {
        "airline": "Turkish Airlines",
        "aircraft_model": "Boeing 787-9",
        "cabin_class": "economy",
        "source_url": "https://www.turkishairlines.com/",
        "price_includes": '["Ручная кладь 8 кг","Багаж 20 кг","Питание","Wi‑Fi за доплату"]',
    },
    "tr_london_air_1": {
        "airline": "British Airways",
        "aircraft_model": "Airbus A320neo",
        "cabin_class": "economy",
        "source_url": "https://www.britishairways.com/",
        "price_includes": '["Ручная кладь 8 кг","Багаж 23 кг","Питание и напитки"]',
    },
}


def upgrade() -> None:
    for public_id, fields in LEG_DETAILS.items():
        op.execute(
            sa.text(
                """
                UPDATE constructor_transport_legs
                SET airline = :airline,
                    aircraft_model = :aircraft_model,
                    cabin_class = :cabin_class,
                    source_url = :source_url,
                    price_includes = :price_includes
                WHERE public_id = :public_id
                """
            ).bindparams(public_id=public_id, **fields)
        )

def downgrade() -> None:
    pass