"""Каталог номеров: фото и описание для каждого accommodation + room_key."""

from __future__ import annotations

from app.data.curated_hotels import get_room_catalog_entry as curated_room_entry
from app.data.hotel_catalog import LEGACY_ACCOMMODATION_IDS

ROOM_KEYS = ("std", "family", "suite")

ACCOMMODATION_IDS = LEGACY_ACCOMMODATION_IDS


def _legacy_room_images(accommodation_id: str, room_key: str) -> list[str]:
    base = f"/images/rooms/{accommodation_id}/{room_key}"
    return [f"{base}-{i}.jpg" for i in range(1, 5)]


ROOM_CATALOG: dict[str, dict] = {
    "acc_phuket_laguna__std": {
        "area_sqm": 32,
        "bed_type": "King-size",
        "view": "На тропический сад",
        "amenities": ["Wi‑Fi", "Кондиционер", "Сейф", "Мини-бар"],
        "description": "Светлый номер с террасой и видом на лагуну.",
    },
    "acc_phuket_laguna__family": {
        "area_sqm": 48,
        "bed_type": "2 двуспальные кровати",
        "view": "На бассейн",
        "amenities": ["Wi‑Fi", "Кондиционер", "Диван", "Детская кроватка"],
        "description": "Просторный семейный номер рядом с пляжем.",
    },
    "acc_phuket_laguna__suite": {
        "area_sqm": 72,
        "bed_type": "King-size + гостиная",
        "view": "Панорама на море",
        "amenities": ["Wi‑Fi", "Джакузи", "Мини-бар", "Балкон", "Room service"],
        "description": "Люкс с отдельной гостиной и закатом над Андаманским морем.",
    },
    "acc_phuket_hostel__std": {
        "area_sqm": 14,
        "bed_type": "2 односпальные",
        "view": "Во двор",
        "amenities": ["Wi‑Fi", "Кондиционер", "Общая кухня", "Шкафчик"],
        "description": "Компактный номер для пары или соло-путешественника.",
    },
    "acc_phuket_hostel__family": {
        "area_sqm": 22,
        "bed_type": "4 односпальные",
        "view": "На улицу",
        "amenities": ["Wi‑Fi", "Кондиционер", "Общая кухня", "Стиральная"],
        "description": "Бюджетный семейный номер в шаге от пляжа.",
    },
    "acc_phuket_hostel__suite": {
        "area_sqm": 28,
        "bed_type": "Queen-size",
        "view": "На крышу / город",
        "amenities": ["Wi‑Fi", "Собственная ванная", "Мини-холодильник", "Балкон"],
        "description": "Приватный номер повышенного комфорта в хостеле.",
    },
    "acc_london_hotel__std": {
        "area_sqm": 26,
        "bed_type": "Двуспальная кровать",
        "view": "На внутренний двор",
        "amenities": ["Wi‑Fi", "Чайник", "Сейф", "Smart TV"],
        "description": "Классический лондонский номер в центре.",
    },
    "acc_london_hotel__family": {
        "area_sqm": 40,
        "bed_type": "Двуспальная + диван-кровать",
        "view": "На Темзу",
        "amenities": ["Wi‑Fi", "Чайник", "Детская кроватка", "Smart TV"],
        "description": "Семейный номер с видом на реку и мосты.",
    },
    "acc_london_hotel__suite": {
        "area_sqm": 58,
        "bed_type": "King-size + lounge",
        "view": "Панорама на Темзу",
        "amenities": ["Wi‑Fi", "Мини-бар", "Ванна", "Халаты", "Завтрак в номер"],
        "description": "Люкс с гостиной зоной и видом на Сити.",
    },
}

_DEFAULT_ROOM = {
    "area_sqm": 24,
    "bed_type": "Двуспальная кровать",
    "view": "На город",
    "amenities": ["Wi‑Fi", "Кондиционер"],
    "description": "Комфортный номер для отдыха.",
}


def room_catalog_id(accommodation_id: str, room_key: str) -> str:
    return f"{accommodation_id}__{room_key}"


def get_room_catalog_entry(accommodation_id: str, room_key: str) -> dict:
    curated = curated_room_entry(accommodation_id, room_key)
    if curated:
        return curated
    key = room_catalog_id(accommodation_id, room_key)
    meta = {**_DEFAULT_ROOM, **ROOM_CATALOG.get(key, {})}
    meta["image_urls"] = _legacy_room_images(accommodation_id, room_key)
    return meta
