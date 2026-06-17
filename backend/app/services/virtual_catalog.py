"""Виртуальный каталог отелей, доп. услуг и транспорта для любого направления."""

from __future__ import annotations

import hashlib
import math
from dataclasses import dataclass

from app.data.destination_images import destination_cover_url
from app.data.hotel_catalog import accommodation_cover_image, accommodation_image_urls
from app.data.tourist_destinations import destination_slug, find_tourist_destination

EXTRA_CATEGORY_LABELS = {
    "restaurants": "Рестораны рядом",
    "attractions": "Достопримечательности",
    "events": "Мероприятия",
    "walking_routes": "Пешие маршруты",
}

CITY_TRANSPORT_LABELS_DEFAULT = {
    "public_transport": "Общественный транспорт",
    "taxi": "Такси",
    "rent": "Аренда транспорта",
    "ferry": "Паром",
}

KNOWN_COORDS: dict[str, tuple[float, float]] = {
    "Пхукет": (7.8804, 98.3923),
    "Бангкок": (13.7563, 100.5018),
    "Лондон": (51.5074, -0.1278),
    "Стамбул": (41.0082, 28.9784),
    "Париж": (48.8566, 2.3522),
    "Рим": (41.9028, 12.4964),
    "Барселона": (41.3874, 2.1686),
    "Дубай": (25.2048, 55.2708),
    "Токио": (35.6762, 139.6503),
    "Нью-Йорк": (40.7128, -74.0060),
    "Сидней": (-33.8688, 151.2093),
    "Санкт-Петербург": (59.9311, 30.3609),
    "Сочи": (43.6028, 39.7342),
    "Ташкент": (41.2995, 69.2401),
    "Анталья": (36.8969, 30.7133),
    "Прага": (50.0755, 14.4378),
    "Вена": (48.2082, 16.3738),
    "Амстердам": (52.3676, 4.9041),
    "Сингапур": (1.3521, 103.8198),
    "Бали": (-8.3405, 115.0920),
}

COUNTRY_CENTROIDS: dict[str, tuple[float, float]] = {
    "Таиланд": (13.7563, 100.5018),
    "Турция": (39.0, 35.0),
    "Великобритания": (51.5, -0.12),
    "Франция": (48.85, 2.35),
    "Италия": (41.9, 12.5),
    "Испания": (40.4, -3.7),
    "Германия": (52.52, 13.405),
    "ОАЭ": (25.2, 55.27),
    "Япония": (35.68, 139.65),
    "США": (38.9, -77.0),
    "Россия": (55.75, 37.62),
    "Греция": (37.98, 23.72),
    "Египет": (30.04, 31.24),
    "Индия": (28.61, 77.21),
    "Китай": (39.9, 116.4),
    "Австралия": (-33.87, 151.21),
}


@dataclass(frozen=True)
class CatalogRoom:
    room_key: str
    room_name: str
    price_multiplier: float
    max_persons: int


@dataclass(frozen=True)
class CatalogAccommodation:
    public_id: str
    title: str
    kind: str
    rating: float
    base_price_per_night: float
    distance_km: float
    rooms: tuple[CatalogRoom, ...]
    virtual: bool = False

    @classmethod
    def from_db(cls, acc) -> CatalogAccommodation:
        return cls(
            public_id=acc.public_id,
            title=acc.title,
            kind=acc.kind,
            rating=acc.rating,
            base_price_per_night=acc.base_price_per_night,
            distance_km=acc.distance_km,
            rooms=tuple(
                CatalogRoom(
                    room_key=room.room_key,
                    room_name=room.room_name,
                    price_multiplier=room.price_multiplier,
                    max_persons=room.max_persons,
                )
                for room in acc.rooms
            ),
            virtual=False,
        )


def _digest(title: str, salt: str = "") -> int:
    raw = f"{title}:{salt}".encode()
    return int(hashlib.md5(raw, usedforsecurity=False).hexdigest()[:8], 16)


def destination_coords(title: str, country: str) -> tuple[float, float]:
    if title in KNOWN_COORDS:
        return KNOWN_COORDS[title]
    base = COUNTRY_CENTROIDS.get(country, (20.0, 0.0))
    h = _digest(title, "coords")
    lat = base[0] + ((h % 1000) - 500) / 800.0
    lng = base[1] + (((h // 1000) % 1000) - 500) / 800.0
    return (round(lat, 4), round(lng, 4))


def virtual_accommodations(destination_title: str) -> list[CatalogAccommodation]:
    meta = find_tourist_destination(destination_title)
    country = meta["country"] if meta else ""
    slug = destination_slug(destination_title)
    room_templates = (
        CatalogRoom("std", "Стандарт", 1.0, 2),
        CatalogRoom("family", "Семейный", 1.35, 4),
        CatalogRoom("suite", "Люкс", 1.8, 4),
    )
    specs = (
        ("hotel", f"{destination_title} City Hotel", 8.4, 4200.0, 1.8),
        ("hostel", f"{destination_title} Stay Hostel", 7.9, 1800.0, 2.6),
    )
    items: list[CatalogAccommodation] = []
    for idx, (kind, name, rating_base, price_base, dist) in enumerate(specs):
        h = _digest(destination_title, kind)
        rating = round(min(9.6, rating_base + (h % 7) * 0.1), 1)
        price = round(price_base + (h % 900), 0)
        public_id = f"acc_v_{slug}_{kind}"
        items.append(
            CatalogAccommodation(
                public_id=public_id,
                title=name,
                kind=kind,
                rating=rating,
                base_price_per_night=price,
                distance_km=dist,
                rooms=room_templates,
                virtual=True,
            )
        )
    return items


def accommodation_coords(acc: CatalogAccommodation, destination_title: str, country: str) -> tuple[float, float]:
    base_lat, base_lng = destination_coords(destination_title, country)
    digest = _digest(acc.public_id, "acc")
    angle = (digest % 360) * (math.pi / 180)
    offset = acc.distance_km * 0.008
    return (
        round(base_lat + offset * math.cos(angle), 5),
        round(base_lng + offset * math.sin(angle), 5),
    )


def serialize_accommodation(acc: CatalogAccommodation, destination_title: str, country: str) -> dict:
    digest = _digest(acc.public_id, "meta")
    stars = min(5, max(1, round(acc.rating / 2)))
    if acc.virtual:
        cover = destination_cover_url(destination_title)
        image_urls = [cover]
    else:
        image_urls = accommodation_image_urls(acc.public_id)
        cover = accommodation_cover_image(acc.public_id)
    lat, lng = accommodation_coords(acc, destination_title, country)
    return {
        "id": acc.public_id,
        "destination": destination_title,
        "title": acc.title,
        "kind": acc.kind,
        "rating": acc.rating,
        "price": acc.base_price_per_night,
        "distance_km": acc.distance_km,
        "stars": stars,
        "breakfast_included": digest % 3 != 0,
        "has_pool": acc.kind == "hotel" and digest % 5 != 0,
        "latitude": lat,
        "longitude": lng,
        "image_url": cover,
        "image_urls": image_urls,
    }


def hotel_extras_catalog(accommodation_id: str, destination_title: str) -> dict[str, list[dict]]:
    slug = destination_slug(destination_title)
    short = destination_title
    return {
        "restaurants": [
            {
                "id": f"{slug}_rest_1",
                "title": f"Central Kitchen · {short}",
                "description": "Рейтинг 4.5 · ₽₽ · 0.6 км",
                "estimated_cost": 1800.0,
            },
            {
                "id": f"{slug}_rest_2",
                "title": f"Old Town Bistro",
                "description": "Рейтинг 4.3 · ₽₽ · 1.2 км",
                "estimated_cost": 1500.0,
            },
        ],
        "attractions": [
            {
                "id": f"{slug}_attr_1",
                "title": f"Главные достопримечательности {short}",
                "description": "Рейтинг 4.7 · обзорная экскурсия",
                "estimated_cost": 1200.0,
            },
            {
                "id": f"{slug}_attr_2",
                "title": f"Музей и старый город",
                "description": "Рейтинг 4.4 · билет от 800 ₽",
                "estimated_cost": 800.0,
            },
        ],
        "events": [
            {
                "id": f"{slug}_event_1",
                "title": f"Вечерняя программа в {short}",
                "description": "Пт–Сб · 19:30 · от 2000 ₽",
                "estimated_cost": 2000.0,
            },
        ],
        "walking_routes": [
            {
                "id": f"{slug}_walk_1",
                "title": f"Пеший маршрут по центру",
                "description": "5.5 км · 1 ч 20 мин",
                "estimated_cost": 0.0,
            },
        ],
    }


def serialize_hotel_extras(accommodation_id: str, destination_title: str) -> dict:
    payload = hotel_extras_catalog(accommodation_id, destination_title)
    categories = []
    for category, items in payload.items():
        categories.append(
            {
                "category": category,
                "title": EXTRA_CATEGORY_LABELS.get(category, category),
                "items": items,
            }
        )
    return {"categories": categories}


def find_hotel_extra(accommodation_id: str, destination_title: str, category: str, item_id: str) -> dict | None:
    payload = hotel_extras_catalog(accommodation_id, destination_title)
    for item in payload.get(category, []):
        if item["id"] == item_id:
            return item
    return None


def city_transport_catalog(destination_title: str) -> dict[str, list[dict]]:
    slug = destination_slug(destination_title)
    coastal = destination_title in {
        "Пхукет", "Бангкок", "Паттайя", "Краби", "Бали", "Барселона", "Майами",
        "Сидней", "Сочи", "Анталья", "Стамбул", "Дубай", "Хургада", "Шарм-эль-Шейх",
        "Мальдивы", "Сейшелы", "Маврикий", "Канкун", "Рио-де-Жанейро", "Гонолулу",
    }
    catalog: dict[str, list[dict]] = {
        "public_transport": [
            {
                "id": f"{slug}_public_1",
                "title": "Проездной на общественный транспорт",
                "description": f"Метро, автобусы и трамваи · {destination_title}",
                "estimated_cost": 900.0,
            }
        ],
        "taxi": [
            {
                "id": f"{slug}_taxi_1",
                "title": "Такси / каршеринг",
                "description": "Поездки по городу · ориентир 400–1200 ₽",
                "estimated_cost": 2200.0,
            }
        ],
        "rent": [
            {
                "id": f"{slug}_rent_1",
                "title": "Аренда авто или байка",
                "description": "От 1500 ₽/день · местные сервисы",
                "estimated_cost": 4500.0,
            }
        ],
    }
    if coastal:
        catalog["ferry"] = [
            {
                "id": f"{slug}_ferry_1",
                "title": "Водный транспорт",
                "description": "Паром или катер · от 1200 ₽",
                "estimated_cost": 1200.0,
            }
        ]
    return catalog


def serialize_city_transport(destination_title: str) -> dict:
    payload = city_transport_catalog(destination_title)
    categories = []
    for category, items in payload.items():
        categories.append(
            {
                "category": category,
                "title": CITY_TRANSPORT_LABELS_DEFAULT.get(category, category),
                "items": items,
            }
        )
    return {"categories": categories}


def find_city_transport_item(destination_title: str, category: str, item_id: str) -> dict | None:
    payload = city_transport_catalog(destination_title)
    for item in payload.get(category, []):
        if item["id"] == item_id:
            return item
    return None
