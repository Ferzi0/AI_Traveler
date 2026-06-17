from __future__ import annotations

from typing import Any

from app.data.curated_hotels.dubai import DUBAI_HOTELS
from app.data.curated_hotels.istanbul import ISTANBUL_HOTELS
from app.data.curated_hotels.paris import PARIS_HOTELS
from app.data.curated_hotels.phuket import PHUKET_HOTELS
from app.data.curated_hotels.sochi import SOCHI_HOTELS

CURATED_DESTINATION_TITLES: frozenset[str] = frozenset(
    {"Пхукет", "Сочи", "Дубай", "Стамбул", "Париж"}
)

_HOTELS_BY_DESTINATION: dict[str, list[dict[str, Any]]] = {
    "Пхукет": PHUKET_HOTELS,
    "Сочи": SOCHI_HOTELS,
    "Дубай": DUBAI_HOTELS,
    "Стамбул": ISTANBUL_HOTELS,
    "Париж": PARIS_HOTELS,
}

_HOTEL_INDEX: dict[str, dict[str, Any]] = {}
for hotels in _HOTELS_BY_DESTINATION.values():
    for spec in hotels:
        _HOTEL_INDEX[spec["public_id"]] = spec


def is_curated_destination(title: str) -> bool:
    return title in CURATED_DESTINATION_TITLES


def get_hotels_for_destination(title: str) -> list[dict[str, Any]]:
    return list(_HOTELS_BY_DESTINATION.get(title, []))


def get_curated_hotel(public_id: str) -> dict[str, Any] | None:
    return _HOTEL_INDEX.get(public_id)


def is_curated_hotel(public_id: str) -> bool:
    return public_id in _HOTEL_INDEX


def all_curated_hotel_ids() -> tuple[str, ...]:
    return tuple(_HOTEL_INDEX.keys())


def get_room_spec(public_id: str, room_key: str) -> dict[str, Any] | None:
    hotel_spec = get_curated_hotel(public_id)
    if not hotel_spec:
        return None
    for room in hotel_spec["rooms"]:
        if room["room_key"] == room_key:
            return room
    return None


def _room_image_urls(public_id: str, room_key: str, image_count: int) -> list[str]:
    base = f"/images/rooms/{public_id}/{room_key}"
    return [f"{base}-{i}.jpg" for i in range(1, image_count + 1)]


def get_room_catalog_entry(public_id: str, room_key: str) -> dict[str, Any] | None:
    room = get_room_spec(public_id, room_key)
    if not room:
        return None
    count = room.get("image_count", 5)
    return {
        "area_sqm": room["area_sqm"],
        "bed_type": room["bed_type"],
        "view": room["view"],
        "amenities": room["amenities"],
        "description": room["description"],
        "image_urls": _room_image_urls(public_id, room_key, count),
    }


def export_image_manifest() -> dict[str, Any]:
    """Manifest for scripts/fetch-curated-hotel-images.ps1"""
    hotels: dict[str, Any] = {}
    for public_id, spec in _HOTEL_INDEX.items():
        hotels[public_id] = {
            "hotel_photos": 4,
            "rooms": {r["room_key"]: r.get("image_count", 5) for r in spec["rooms"]},
        }
    return {"hotels": hotels}
