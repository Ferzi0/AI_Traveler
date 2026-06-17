from __future__ import annotations

from typing import Any


def room(
    room_key: str,
    room_name: str,
    *,
    price_multiplier: float = 1.0,
    max_persons: int = 2,
    area_sqm: int = 28,
    bed_type: str = "King-size",
    view: str = "На город",
    amenities: list[str] | None = None,
    description: str = "",
    image_count: int = 5,
) -> dict[str, Any]:
    return {
        "room_key": room_key,
        "room_name": room_name,
        "price_multiplier": price_multiplier,
        "max_persons": max_persons,
        "area_sqm": area_sqm,
        "bed_type": bed_type,
        "view": view,
        "amenities": amenities or ["Wi‑Fi", "Кондиционер", "Сейф"],
        "description": description,
        "image_count": image_count,
    }


def hotel(
    public_id: str,
    title: str,
    *,
    rating: float,
    base_price_per_night: float,
    latitude: float,
    longitude: float,
    rooms: list[dict[str, Any]],
    kind: str = "hotel",
    distance_km: float = 1.5,
    stars: int = 4,
    breakfast_included: bool = True,
    has_pool: bool = True,
) -> dict[str, Any]:
    return {
        "public_id": public_id,
        "title": title,
        "kind": kind,
        "rating": rating,
        "base_price_per_night": base_price_per_night,
        "distance_km": distance_km,
        "latitude": latitude,
        "longitude": longitude,
        "stars": stars,
        "breakfast_included": breakfast_included,
        "has_pool": has_pool,
        "rooms": rooms,
    }
