from datetime import date
import hashlib
import json
import math
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.data.hotel_catalog import accommodation_cover_image, accommodation_image_urls
from app.data.room_catalog import get_room_catalog_entry
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.constructor_catalog import (
    ConstructorAccommodation,
    ConstructorDestination,
    ConstructorTransportLeg,
)
from app.models.trip import Trip
from app.models.trip_edge import TripEdge
from app.models.trip_node import TripNode
from app.models.user import User

router = APIRouter()


class CreateTripRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    destination: str = ""


class CreateNodeRequest(BaseModel):
    node_type: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    estimated_cost: float | None = None
    position_x: int = 0
    position_y: int = 0


class CreateEdgeRequest(BaseModel):
    source_node_id: int
    target_node_id: int


class UpdateTripParamsRequest(BaseModel):
    origin: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    passengers: int = Field(default=1, ge=1, le=12)
    round_trip: bool = True

    @model_validator(mode="after")
    def validate_dates(self) -> "UpdateTripParamsRequest":
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError("Дата возвращения не может быть раньше даты вылета")
        return self


class DestinationSelectRequest(BaseModel):
    destination_title: str = Field(min_length=1, max_length=255)


class AccommodationSearchRequest(BaseModel):
    price_from: float | None = None
    price_to: float | None = None
    kinds: list[str] = Field(default_factory=list)
    sort_by: str = "rating"
    stars_min: int | None = Field(default=None, ge=1, le=5)
    stars_max: int | None = Field(default=None, ge=1, le=5)
    breakfast_included: bool | None = None
    has_pool: bool | None = None


class TransportSearchRequest(BaseModel):
    price_from: float | None = None
    price_to: float | None = None
    kinds: list[str] = Field(default_factory=list)
    sort_by: str = "price"


class SelectOptionRequest(BaseModel):
    item_id: str = Field(min_length=1)


class AccommodationRoomsRequest(BaseModel):
    accommodation_id: str = Field(min_length=1)
    room_price_from: float | None = None
    room_price_to: float | None = None
    sort_by: str = "price"


class AccommodationRoomSelectRequest(BaseModel):
    accommodation_id: str = Field(min_length=1)
    room_id: str = Field(min_length=1)


class TransportSelectRequest(BaseModel):
    itinerary_id: str = Field(min_length=1)


class HotelExtraSelectRequest(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    item_id: str = Field(min_length=1, max_length=100)


class TransportExtraSelectRequest(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    item_id: str = Field(min_length=1, max_length=100)


class CityTransportSelectRequest(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    item_id: str = Field(min_length=1, max_length=100)


class DayPlanSelectRequest(BaseModel):
    day_key: str = Field(min_length=1, max_length=50)
    slot: str = Field(min_length=1, max_length=20)
    item_id: str = Field(min_length=1, max_length=100)


HOTEL_EXTRA_CATALOG: dict[str, dict[str, list[dict]]] = {
    "acc_phuket_laguna": {
        "restaurants": [
            {
                "id": "laguna_rest_1",
                "title": "Andaman Grill",
                "description": "Рейтинг 4.6 · $$ · 0.4 км",
                "estimated_cost": 28.0,
            },
            {
                "id": "laguna_rest_2",
                "title": "Sunset Thai Kitchen",
                "description": "Рейтинг 4.4 · $$ · 0.9 км",
                "estimated_cost": 22.0,
            },
            {
                "id": "laguna_rest_3",
                "title": "Lagoon Street Food",
                "description": "Рейтинг 4.3 · $ · 1.1 км",
                "estimated_cost": 12.0,
            },
        ],
        "attractions": [
            {
                "id": "laguna_attr_1",
                "title": "Big Buddha Phuket",
                "description": "Рейтинг 4.7 · 15 км · вход: бесплатно · 8:00-19:30",
                "estimated_cost": 0.0,
            },
            {
                "id": "laguna_attr_2",
                "title": "Phuket Aquarium",
                "description": "Рейтинг 4.5 · 13 км · вход: $16 · 9:00-18:00",
                "estimated_cost": 16.0,
            },
        ],
        "events": [
            {
                "id": "laguna_event_1",
                "title": "Вечерний рынок Old Town",
                "description": "Пт · 19:00 · вход: бесплатно",
                "estimated_cost": 0.0,
            },
            {
                "id": "laguna_event_2",
                "title": "Шоу Siam Fantasy",
                "description": "Сб · 20:30 · билет: $35",
                "estimated_cost": 35.0,
            },
        ],
        "walking_routes": [
            {
                "id": "laguna_walk_1",
                "title": "Laguna Beach Loop",
                "description": "4.2 км · 55 мин",
                "estimated_cost": 0.0,
            },
            {
                "id": "laguna_walk_2",
                "title": "Canal Sunset Route",
                "description": "6.8 км · 1 ч 30 мин",
                "estimated_cost": 0.0,
            },
        ],
    },
    "acc_phuket_hostel": {
        "restaurants": [
            {
                "id": "hostel_rest_1",
                "title": "Blue Noodle House",
                "description": "Рейтинг 4.2 · $ · 0.2 км",
                "estimated_cost": 9.0,
            },
            {
                "id": "hostel_rest_2",
                "title": "Mango Vegan Point",
                "description": "Рейтинг 4.5 · $ · 0.6 км",
                "estimated_cost": 11.0,
            },
        ],
        "attractions": [
            {
                "id": "hostel_attr_1",
                "title": "Old Phuket Town",
                "description": "Рейтинг 4.6 · 1.5 км · вход: бесплатно · 24/7",
                "estimated_cost": 0.0,
            }
        ],
        "events": [
            {
                "id": "hostel_event_1",
                "title": "Live music at Marina Bar",
                "description": "Чт · 21:00 · вход: $8",
                "estimated_cost": 8.0,
            }
        ],
        "walking_routes": [
            {
                "id": "hostel_walk_1",
                "title": "Town Murals Walk",
                "description": "3.1 км · 40 мин",
                "estimated_cost": 0.0,
            }
        ],
    },
    "acc_london_hotel": {
        "restaurants": [
            {
                "id": "london_rest_1",
                "title": "Riverside Brasserie",
                "description": "Рейтинг 4.5 · $$$ · 0.3 км",
                "estimated_cost": 45.0,
            }
        ],
        "attractions": [
            {
                "id": "london_attr_1",
                "title": "Tower of London",
                "description": "Рейтинг 4.7 · 3.2 км · вход: $40 · 9:00-17:30",
                "estimated_cost": 40.0,
            }
        ],
        "events": [
            {
                "id": "london_event_1",
                "title": "West End Musical",
                "description": "Ср · 19:30 · билет: $65",
                "estimated_cost": 65.0,
            }
        ],
        "walking_routes": [
            {
                "id": "london_walk_1",
                "title": "Thames Highlights",
                "description": "7.5 км · 2 ч",
                "estimated_cost": 0.0,
            }
        ],
    },
}

EXTRA_CATEGORY_LABELS = {
    "restaurants": "Рестораны рядом",
    "attractions": "Достопримечательности",
    "events": "Мероприятия",
    "walking_routes": "Пешие маршруты",
}

TRANSPORT_EXTRA_CATEGORY_LABELS = {
    "baggage": "Багаж",
    "refund_policy": "Условия возврата",
}

CITY_TRANSPORT_CATALOG: dict[str, dict[str, list[dict]]] = {
    "Пхукет": {
        "public_transport": [
            {
                "id": "phuket_bus_1",
                "title": "Smart Bus + Songthaew",
                "description": "Маршрут из аэропорта и по пляжам · от $2",
                "estimated_cost": 12.0,
            }
        ],
        "taxi": [
            {
                "id": "phuket_taxi_1",
                "title": "Grab / Bolt",
                "description": "Средний чек по городу $7-15",
                "estimated_cost": 25.0,
            }
        ],
        "rent": [
            {
                "id": "phuket_rent_1",
                "title": "Аренда байка",
                "description": "Сервисы local rent · от $9/день",
                "estimated_cost": 27.0,
            }
        ],
        "ferry": [
            {
                "id": "phuket_ferry_1",
                "title": "Паром на Пхи-Пхи",
                "description": "Туда-обратно · от $18",
                "estimated_cost": 18.0,
            }
        ],
    },
    "Лондон": {
        "public_transport": [
            {
                "id": "london_public_1",
                "title": "Oyster / Contactless",
                "description": "Метро + автобус · daily cap",
                "estimated_cost": 22.0,
            }
        ],
        "taxi": [
            {
                "id": "london_taxi_1",
                "title": "Uber / Black Cab",
                "description": "Поездки по центру · $15-35",
                "estimated_cost": 40.0,
            }
        ],
        "rent": [
            {
                "id": "london_rent_1",
                "title": "Santander Cycles",
                "description": "Велопрокат · £1.65/30 мин",
                "estimated_cost": 12.0,
            }
        ],
    },
    "Стамбул": {
        "public_transport": [
            {
                "id": "istanbul_public_1",
                "title": "Istanbulkart",
                "description": "Метро + трамвай + автобус",
                "estimated_cost": 14.0,
            }
        ],
        "taxi": [
            {
                "id": "istanbul_taxi_1",
                "title": "BiTaksi / Uber",
                "description": "Поездки по городу · $6-18",
                "estimated_cost": 24.0,
            }
        ],
        "ferry": [
            {
                "id": "istanbul_ferry_1",
                "title": "Паром через Босфор",
                "description": "Шехир Хатлары · от $2",
                "estimated_cost": 8.0,
            }
        ],
    },
}

CITY_TRANSPORT_LABELS_BY_CITY: dict[str, dict[str, str]] = {
    "Пхукет": {
        "public_transport": "Автобусы и сонгтео",
        "taxi": "Такси",
        "rent": "Аренда байка",
        "ferry": "Паром",
    },
    "Лондон": {
        "public_transport": "Метро и автобус",
        "taxi": "Такси",
        "rent": "Аренда велосипеда",
    },
    "Стамбул": {
        "public_transport": "Метро, трамвай и автобус",
        "taxi": "Такси",
        "ferry": "Паром",
    },
}

CITY_TRANSPORT_LABELS_DEFAULT = {
    "public_transport": "Общественный транспорт",
    "taxi": "Такси",
    "rent": "Аренда транспорта",
    "ferry": "Паром",
}

DAY_PLAN_SLOTS = [
    ("morning", "Утро"),
    ("day", "День"),
    ("evening", "Вечер"),
]

DAY_PLAN_CATALOG_BY_DESTINATION: dict[str, dict[str, list[dict]]] = {
    "Пхукет": {
        "morning": [
            {
                "id": "phuket_morning_1",
                "title": "Пляж и кофе у моря",
                "description": "2.5 ч · спокойный старт дня",
                "estimated_cost": 8.0,
            },
            {
                "id": "phuket_morning_2",
                "title": "Смотровая Karon Viewpoint",
                "description": "2 ч · трансфер + прогулка",
                "estimated_cost": 12.0,
            },
        ],
        "day": [
            {
                "id": "phuket_day_1",
                "title": "Экскурсия на Пхи-Пхи",
                "description": "6 ч · катер + снорклинг",
                "estimated_cost": 45.0,
            },
            {
                "id": "phuket_day_2",
                "title": "Old Town + street food",
                "description": "4 ч · пеший маршрут",
                "estimated_cost": 20.0,
            },
        ],
        "evening": [
            {
                "id": "phuket_evening_1",
                "title": "Закат на Promthep Cape",
                "description": "2 ч · фотостоп",
                "estimated_cost": 6.0,
            },
            {
                "id": "phuket_evening_2",
                "title": "Ночной рынок Chillva",
                "description": "3 ч · еда и шопинг",
                "estimated_cost": 18.0,
            },
        ],
    },
    "Лондон": {
        "morning": [
            {
                "id": "london_morning_1",
                "title": "Hyde Park + завтрак",
                "description": "2 ч · прогулка",
                "estimated_cost": 15.0,
            }
        ],
        "day": [
            {
                "id": "london_day_1",
                "title": "British Museum",
                "description": "3.5 ч · культура",
                "estimated_cost": 0.0,
            },
            {
                "id": "london_day_2",
                "title": "Thames cruise",
                "description": "2 ч · речная прогулка",
                "estimated_cost": 28.0,
            },
        ],
        "evening": [
            {
                "id": "london_evening_1",
                "title": "West End шоу",
                "description": "2.5 ч · театр",
                "estimated_cost": 65.0,
            }
        ],
    },
    "Стамбул": {
        "morning": [
            {
                "id": "istanbul_morning_1",
                "title": "Султанахмет прогулка",
                "description": "2.5 ч · Айя-София и площадь",
                "estimated_cost": 10.0,
            }
        ],
        "day": [
            {
                "id": "istanbul_day_1",
                "title": "Круиз по Босфору",
                "description": "3 ч · дневной рейс",
                "estimated_cost": 22.0,
            }
        ],
        "evening": [
            {
                "id": "istanbul_evening_1",
                "title": "Галатская башня и ужин",
                "description": "3 ч · панорама города",
                "estimated_cost": 30.0,
            }
        ],
    },
}


def _serialize_destination(row: ConstructorDestination) -> dict[str, str]:
    return {
        "id": row.slug,
        "title": row.title,
        "country": row.country,
        "image_url": DESTINATION_IMAGE_URLS.get(row.title, ""),
    }


DESTINATION_COORDS: dict[str, tuple[float, float]] = {
    "Пхукет": (7.8804, 98.3923),
    "Лондон": (51.5074, -0.1278),
    "Стамбул": (41.0082, 28.9784),
}

# Обложка отеля (первое фото галереи) — для обратной совместимости.
ACCOMMODATION_IMAGE_URLS: dict[str, str] = {
    public_id: accommodation_cover_image(public_id) for public_id in (
        "acc_phuket_laguna",
        "acc_phuket_hostel",
        "acc_london_hotel",
    )
}

DEFAULT_ACCOMMODATION_IMAGE = "/images/hotels/default.jpg"

DESTINATION_IMAGE_URLS: dict[str, str] = {
    "Пхукет": "/images/destinations/phuket.jpg",
    "Лондон": "/images/destinations/london.jpg",
    "Стамбул": "/images/destinations/istanbul.jpg",
}


def _accommodation_image_url(public_id: str) -> str:
    return accommodation_cover_image(public_id)


def _accommodation_meta(acc: ConstructorAccommodation) -> dict[str, float | int | bool]:
    digest = int(hashlib.md5(acc.public_id.encode(), usedforsecurity=False).hexdigest()[:8], 16)
    stars = min(5, max(1, round(acc.rating / 2)))
    return {
        "stars": stars,
        "breakfast_included": digest % 3 != 0,
        "has_pool": acc.kind == "hotel" and digest % 5 != 0,
    }


def _accommodation_coords(acc: ConstructorAccommodation, destination_title: str) -> tuple[float, float]:
    base_lat, base_lng = DESTINATION_COORDS.get(destination_title, (0.0, 0.0))
    digest = int(hashlib.md5(acc.public_id.encode(), usedforsecurity=False).hexdigest()[:8], 16)
    angle = (digest % 360) * (math.pi / 180)
    offset = acc.distance_km * 0.008
    return (
        round(base_lat + offset * math.cos(angle), 5),
        round(base_lng + offset * math.sin(angle), 5),
    )


def _serialize_accommodation(
    acc: ConstructorAccommodation, destination_title: str
) -> dict:
    meta = _accommodation_meta(acc)
    lat, lng = _accommodation_coords(acc, destination_title)
    return {
        "id": acc.public_id,
        "destination": destination_title,
        "title": acc.title,
        "kind": acc.kind,
        "rating": acc.rating,
        "price": acc.base_price_per_night,
        "distance_km": acc.distance_km,
        "stars": meta["stars"],
        "breakfast_included": meta["breakfast_included"],
        "has_pool": meta["has_pool"],
        "latitude": lat,
        "longitude": lng,
        "image_url": _accommodation_image_url(acc.public_id),
        "image_urls": accommodation_image_urls(acc.public_id),
    }


def _parse_price_includes(raw: str) -> list[str]:
    try:
        data = json.loads(raw or "[]")
        if isinstance(data, list):
            return [str(item) for item in data]
    except json.JSONDecodeError:
        pass
    return []


def _serialize_transport_leg(
    leg: ConstructorTransportLeg, destination_title: str
) -> dict:
    return {
        "id": leg.public_id,
        "destination": destination_title,
        "kind": leg.kind,
        "title": leg.title,
        "duration_min": leg.duration_min,
        "price": leg.price_per_person,
        "airline": leg.airline,
        "aircraft_model": leg.aircraft_model,
        "cabin_class": leg.cabin_class,
        "source_url": leg.source_url,
        "price_includes": _parse_price_includes(leg.price_includes),
    }


def _build_itinerary_details(
    outbound: dict, inbound: dict | None, total_price: float, total_duration: int, trip: Trip
) -> dict:
    leg_rows: list[dict] = [
        {**outbound, "direction": "outbound", "direction_label": "Туда"},
    ]
    if inbound:
        leg_rows.append({**inbound, "direction": "inbound", "direction_label": "Обратно"})

    includes: list[str] = []
    seen: set[str] = set()
    for leg in leg_rows:
        for item in leg.get("price_includes", []):
            if item not in seen:
                seen.add(item)
                includes.append(item)

    sources: list[dict[str, str]] = []
    for leg in leg_rows:
        url = leg.get("source_url") or ""
        if url and not any(s["url"] == url for s in sources):
            sources.append({"airline": leg.get("airline") or "", "url": url})

    passengers = max(1, trip.passengers)
    return {
        "total_duration_min": total_duration,
        "price_per_passenger": round(total_price / passengers, 2),
        "passengers": passengers,
        "legs": leg_rows,
        "price_includes": includes,
        "sources": sources,
        "cabin_class": outbound.get("cabin_class") or "economy",
        "data_source_note": (
            "На этапе разработки используется каталог-заглушка; "
            "ссылки ведут на условные сайты авиакомпаний."
        ),
    }


def _serialize_hotel_extras(accommodation_id: str) -> dict:
    payload = HOTEL_EXTRA_CATALOG.get(accommodation_id, {})
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


def _find_hotel_extra(accommodation_id: str, category: str, item_id: str) -> dict | None:
    payload = HOTEL_EXTRA_CATALOG.get(accommodation_id, {})
    for item in payload.get(category, []):
        if item["id"] == item_id:
            return item
    return None


def _reset_hotel_extra_category(db: Session, trip_id: int, category: str) -> None:
    node_type = f"hotel_extra:{category}"
    _reset_choice_branch(db, trip_id, node_type)


def _serialize_transport_extras(itinerary: dict) -> dict:
    details = itinerary.get("details", {})
    includes = details.get("price_includes", [])
    baggage_options = [
        {
            "id": "bag_carry_on",
            "title": "Только ручная кладь",
            "description": "До 8-10 кг, без багажа",
            "estimated_cost": 0.0,
        },
        {
            "id": "bag_20",
            "title": "Багаж 20 кг",
            "description": "1 место багажа до 20 кг",
            "estimated_cost": 25.0,
        },
        {
            "id": "bag_23_plus",
            "title": "Багаж 23 кг + приоритет",
            "description": "23 кг, приоритетная посадка",
            "estimated_cost": 48.0,
        },
    ]
    if any("23 кг" in str(item) for item in includes):
        baggage_options[1]["estimated_cost"] = 0.0
        baggage_options[1]["description"] = "Входит в тариф"
    refund_options = [
        {
            "id": "refund_none",
            "title": "Невозвратный тариф",
            "description": "Изменения с доплатой, возврат не предусмотрен",
            "estimated_cost": 0.0,
        },
        {
            "id": "refund_flexible",
            "title": "Гибкий возврат",
            "description": "Возврат со штрафом до вылета",
            "estimated_cost": 35.0,
        },
        {
            "id": "refund_full",
            "title": "Полный возврат",
            "description": "Полный возврат до вылета",
            "estimated_cost": 60.0,
        },
    ]
    return {
        "categories": [
            {
                "category": "baggage",
                "title": TRANSPORT_EXTRA_CATEGORY_LABELS["baggage"],
                "items": baggage_options,
            },
            {
                "category": "refund_policy",
                "title": TRANSPORT_EXTRA_CATEGORY_LABELS["refund_policy"],
                "items": refund_options,
            },
        ]
    }


def _find_transport_extra(extras_payload: dict, category: str, item_id: str) -> dict | None:
    for category_payload in extras_payload.get("categories", []):
        if category_payload.get("category") != category:
            continue
        for item in category_payload.get("items", []):
            if item.get("id") == item_id:
                return item
    return None


def _reset_transport_extra_category(db: Session, trip_id: int, category: str) -> None:
    node_type = f"transport_extra:{category}"
    _reset_choice_branch(db, trip_id, node_type)


def _serialize_city_transport(destination_title: str) -> dict:
    city_payload = CITY_TRANSPORT_CATALOG.get(destination_title, {})
    labels = CITY_TRANSPORT_LABELS_BY_CITY.get(destination_title, {})
    categories = []
    for category, items in city_payload.items():
        categories.append(
            {
                "category": category,
                "title": labels.get(
                    category,
                    CITY_TRANSPORT_LABELS_DEFAULT.get(category, category),
                ),
                "items": items,
            }
        )
    return {"categories": categories}


def _find_city_transport_item(destination_title: str, category: str, item_id: str) -> dict | None:
    city_payload = CITY_TRANSPORT_CATALOG.get(destination_title, {})
    for item in city_payload.get(category, []):
        if item["id"] == item_id:
            return item
    return None


def _reset_city_transport_category(db: Session, trip_id: int, category: str) -> None:
    node_type = f"city_transport:{category}"
    _reset_choice_branch(db, trip_id, node_type)


def _serialize_day_plan(trip: Trip) -> dict:
    catalog = DAY_PLAN_CATALOG_BY_DESTINATION.get(trip.destination, {})
    if not catalog:
        return {"days": []}

    days_count = _get_nights(trip)
    base_date = trip.start_date or date.today()
    days = []
    for idx in range(days_count):
        day_date = base_date.fromordinal(base_date.toordinal() + idx)
        day_key = f"day_{idx + 1}"
        slots = []
        for slot_key, slot_title in DAY_PLAN_SLOTS:
            slots.append(
                {
                    "slot": slot_key,
                    "title": slot_title,
                    "items": catalog.get(slot_key, []),
                }
            )
        days.append(
            {
                "day_key": day_key,
                "date": day_date.isoformat(),
                "title": f"День {idx + 1}",
                "theme": "Активный обзор города" if idx == 0 else "Комбинированная программа",
                "slots": slots,
            }
        )
    return {"days": days}


def _find_day_plan_item(trip: Trip, day_key: str, slot: str, item_id: str) -> dict | None:
    payload = _serialize_day_plan(trip)
    for day in payload.get("days", []):
        if day.get("day_key") != day_key:
            continue
        for slot_payload in day.get("slots", []):
            if slot_payload.get("slot") != slot:
                continue
            for item in slot_payload.get("items", []):
                if item.get("id") == item_id:
                    return item
    return None


def _reset_day_plan_slot(db: Session, trip_id: int, day_key: str, slot: str) -> None:
    node_type = f"day_plan:{day_key}:{slot}"
    _reset_choice_branch(db, trip_id, node_type)


def _is_per_person_node_type(node_type: str) -> bool:
    return node_type.startswith(
        ("hotel_extra:", "transport_extra:", "city_transport:", "day_plan:")
    )


def _billing_for_node(
    node: TripNode, passengers: int
) -> tuple[float, float, bool]:
    """unit_cost, line_total, is_per_person (catalog stores per-person for the last flag)."""
    raw = round(node.estimated_cost or 0.0, 2)
    if _is_per_person_node_type(node.node_type):
        unit = raw
        return unit, round(unit * passengers, 2), True
    return raw, raw, False


def _destination_by_title(db: Session, title: str) -> ConstructorDestination | None:
    normalized = title.strip()
    if not normalized:
        return None
    needle = normalized.casefold()
    return db.execute(
        select(ConstructorDestination).where(
            func.lower(ConstructorDestination.title) == needle
        )
    ).scalar_one_or_none()


def _accommodations_for_trip(db: Session, trip: Trip) -> list[ConstructorAccommodation]:
    stmt = (
        select(ConstructorAccommodation)
        .join(ConstructorDestination)
        .where(ConstructorDestination.title == trip.destination)
    )
    return list(db.execute(stmt).scalars().all())


def _get_accommodation_for_trip(
    db: Session,
    trip: Trip,
    public_id: str,
    *,
    load_rooms: bool = False,
) -> ConstructorAccommodation | None:
    stmt = (
        select(ConstructorAccommodation)
        .join(ConstructorDestination)
        .where(
            ConstructorAccommodation.public_id == public_id,
            ConstructorDestination.title == trip.destination,
        )
    )
    if load_rooms:
        stmt = stmt.options(selectinload(ConstructorAccommodation.rooms))
    return db.execute(stmt).scalar_one_or_none()


def _transport_legs_for_trip(db: Session, trip: Trip) -> list[ConstructorTransportLeg]:
    stmt = (
        select(ConstructorTransportLeg)
        .join(ConstructorDestination)
        .where(ConstructorDestination.title == trip.destination)
    )
    return list(db.execute(stmt).scalars().all())


def _get_trip_or_404(db: Session, trip_id: int) -> Trip:
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


def _serialize_trip(trip: Trip) -> dict:
    return {
        "id": trip.id,
        "user_id": trip.user_id,
        "title": trip.title,
        "destination": trip.destination,
        "origin": trip.origin,
        "start_date": trip.start_date.isoformat() if trip.start_date else None,
        "end_date": trip.end_date.isoformat() if trip.end_date else None,
        "passengers": trip.passengers,
        "round_trip": trip.round_trip,
    }


def _ensure_destination_node(db: Session, trip: Trip) -> TripNode:
    node = db.execute(
        select(TripNode).where(
            TripNode.trip_id == trip.id,
            TripNode.node_type == "destination",
        )
    ).scalar_one_or_none()
    if node:
        node.title = trip.destination
        return node

    node = TripNode(
        trip_id=trip.id,
        node_type="destination",
        title=trip.destination,
        position_x=0,
        position_y=0,
    )
    db.add(node)
    db.flush()
    return node


def _reset_choice_branch(db: Session, trip_id: int, node_type: str) -> None:
    nodes = db.execute(
        select(TripNode.id).where(TripNode.trip_id == trip_id, TripNode.node_type == node_type)
    ).scalars()
    node_ids = list(nodes)
    if node_ids:
        db.execute(
            delete(TripEdge).where(
                TripEdge.trip_id == trip_id,
                (TripEdge.source_node_id.in_(node_ids) | TripEdge.target_node_id.in_(node_ids)),
            )
        )
        db.execute(delete(TripNode).where(TripNode.id.in_(node_ids)))


def _reset_tree_selections(db: Session, trip_id: int) -> None:
    nodes = db.execute(
        select(TripNode.id).where(
            TripNode.trip_id == trip_id,
            TripNode.node_type != "destination",
        )
    ).scalars()
    node_ids = list(nodes)
    if node_ids:
        db.execute(
            delete(TripEdge).where(
                TripEdge.trip_id == trip_id,
                (TripEdge.source_node_id.in_(node_ids) | TripEdge.target_node_id.in_(node_ids)),
            )
        )
        db.execute(delete(TripNode).where(TripNode.id.in_(node_ids)))


def _reset_detail_selections(db: Session, trip_id: int) -> None:
    nodes = db.execute(
        select(TripNode.id).where(
            TripNode.trip_id == trip_id,
            or_(
                TripNode.node_type.like("hotel_extra:%"),
                TripNode.node_type.like("city_transport:%"),
                TripNode.node_type.like("day_plan:%"),
            ),
        )
    ).scalars()
    node_ids = list(nodes)
    if node_ids:
        db.execute(
            delete(TripEdge).where(
                TripEdge.trip_id == trip_id,
                (TripEdge.source_node_id.in_(node_ids) | TripEdge.target_node_id.in_(node_ids)),
            )
        )
        db.execute(delete(TripNode).where(TripNode.id.in_(node_ids)))


def _get_node_by_type(db: Session, trip_id: int, node_type: str) -> TripNode | None:
    return db.execute(
        select(TripNode).where(TripNode.trip_id == trip_id, TripNode.node_type == node_type)
    ).scalar_one_or_none()


def _get_nights(trip: Trip) -> int:
    if not trip.start_date or not trip.end_date:
        return 1
    delta = (trip.end_date - trip.start_date).days
    return max(1, delta)


def _build_room_options(trip: Trip, accommodation: ConstructorAccommodation) -> list[dict]:
    nights = _get_nights(trip)
    passengers = max(1, trip.passengers)
    base = accommodation.base_price_per_night
    options: list[dict] = []
    for room in accommodation.rooms:
        if passengers > room.max_persons:
            continue
        total_price = round(base * room.price_multiplier * nights, 2)
        catalog = get_room_catalog_entry(accommodation.public_id, room.room_key)
        options.append(
            {
                "room_id": f"{accommodation.public_id}__{room.room_key}",
                "accommodation_id": accommodation.public_id,
                "room_key": room.room_key,
                "room_name": room.room_name,
                "nights": nights,
                "persons": passengers,
                "max_persons": room.max_persons,
                "price_total": total_price,
                "price_per_night": round(total_price / nights, 2),
                "image_urls": catalog["image_urls"],
                "area_sqm": catalog["area_sqm"],
                "bed_type": catalog["bed_type"],
                "view": catalog["view"],
                "amenities": catalog["amenities"],
                "description": catalog["description"],
            }
        )
    return options


def _build_transport_itineraries(
    trip: Trip, legs: list[ConstructorTransportLeg], destination_title: str
) -> list[dict]:
    flights = [_serialize_transport_leg(leg, destination_title) for leg in legs]
    itineraries: list[dict] = []
    for outbound in flights:
        if trip.round_trip:
            for inbound in flights:
                itinerary_id = f"it_{outbound['id']}__{inbound['id']}"
                total_price = round((outbound["price"] + inbound["price"]) * trip.passengers, 2)
                total_duration = outbound["duration_min"] + inbound["duration_min"]
                itineraries.append(
                    {
                        "itinerary_id": itinerary_id,
                        "kind": outbound["kind"],
                        "outbound": outbound,
                        "inbound": inbound,
                        "total_duration_min": total_duration,
                        "total_price": total_price,
                        "details": _build_itinerary_details(
                            outbound, inbound, total_price, total_duration, trip
                        ),
                    }
                )
        else:
            itinerary_id = f"it_{outbound['id']}__oneway"
            total_price = round(outbound["price"] * trip.passengers, 2)
            total_duration = outbound["duration_min"]
            itineraries.append(
                {
                    "itinerary_id": itinerary_id,
                    "kind": outbound["kind"],
                    "outbound": outbound,
                    "inbound": None,
                    "total_duration_min": total_duration,
                    "total_price": total_price,
                    "details": _build_itinerary_details(
                        outbound, None, total_price, total_duration, trip
                    ),
                }
            )
    return itineraries


def _find_itinerary_by_id(db: Session, trip: Trip, itinerary_id: str) -> dict | None:
    legs = _transport_legs_for_trip(db, trip)
    for itinerary in _build_transport_itineraries(trip, legs, trip.destination):
        if itinerary["itinerary_id"] == itinerary_id:
            return itinerary
    return None


@router.get("")
def list_trips(db: Session = Depends(get_db)) -> dict[str, list[dict]]:
    trips = db.execute(select(Trip)).scalars().all()
    return {"items": [_serialize_trip(trip) for trip in trips]}


@router.post("")
def create_trip(
    payload: CreateTripRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> dict[str, int]:
    trip = Trip(
        user_id=user.id,
        title=payload.title,
        destination=payload.destination,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return {"id": trip.id}


# Статические пути (например /destination/search) должны быть выше /{trip_id},
# иначе часть клиентов/прокси может получать не тот маршрут или обрыв соединения.
@router.get("/destination/search")
def search_destinations(
    query: str = "", db: Session = Depends(get_db)
) -> dict[str, list[dict]]:
    normalized_query = query.strip().lower()
    stmt = select(ConstructorDestination)
    if normalized_query:
        pattern = f"%{normalized_query}%"
        stmt = stmt.where(
            or_(
                func.lower(ConstructorDestination.title).like(pattern),
                func.lower(ConstructorDestination.country).like(pattern),
            )
        )
    rows = db.execute(stmt).scalars().all()
    return {"items": [_serialize_destination(r) for r in rows]}


@router.get("/{trip_id}")
def get_trip(trip_id: int, db: Session = Depends(get_db)) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    return _serialize_trip(trip)


@router.patch("/{trip_id}/params")
def update_trip_params(
    trip_id: int, payload: UpdateTripParamsRequest, db: Session = Depends(get_db)
) -> dict:
    trip = _get_trip_or_404(db, trip_id)

    trip.origin = payload.origin
    trip.start_date = payload.start_date
    trip.end_date = payload.end_date
    trip.passengers = payload.passengers
    trip.round_trip = payload.round_trip

    db.commit()
    db.refresh(trip)
    return _serialize_trip(trip)


@router.post("/{trip_id}/destination/select")
def select_destination(
    trip_id: int, payload: DestinationSelectRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    trip = _get_trip_or_404(db, trip_id)
    dest = _destination_by_title(db, payload.destination_title)
    if not dest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination not found in catalog",
        )
    trip.destination = dest.title

    destination_node = _ensure_destination_node(db, trip)
    _reset_choice_branch(db, trip_id, "accommodation")
    _reset_choice_branch(db, trip_id, "transport")
    _reset_detail_selections(db, trip_id)

    db.commit()

    return {
        "status": "ok",
        "destination": trip.destination,
        "destination_node_id": str(destination_node.id),
    }


@router.get("/{trip_id}/tree")
def get_trip_tree(trip_id: int, db: Session = Depends(get_db)) -> dict[str, list[dict]]:
    _get_trip_or_404(db, trip_id)

    nodes = db.execute(select(TripNode).where(TripNode.trip_id == trip_id)).scalars().all()
    edges = db.execute(select(TripEdge).where(TripEdge.trip_id == trip_id)).scalars().all()

    return {
        "nodes": [
            {
                "id": node.id,
                "trip_id": node.trip_id,
                "node_type": node.node_type,
                "title": node.title,
                "description": node.description,
                "estimated_cost": node.estimated_cost,
                "position_x": node.position_x,
                "position_y": node.position_y,
            }
            for node in nodes
        ],
        "edges": [
            {
                "id": edge.id,
                "trip_id": edge.trip_id,
                "source_node_id": edge.source_node_id,
                "target_node_id": edge.target_node_id,
            }
            for edge in edges
        ],
    }


@router.post("/{trip_id}/selections/reset")
def reset_trip_selections(trip_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    trip = _get_trip_or_404(db, trip_id)
    if not trip.destination:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )
    _reset_tree_selections(db, trip_id)
    db.commit()
    return {"status": "ok"}


@router.post("/{trip_id}/detail/reset")
def reset_trip_detail_selections(trip_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    _get_trip_or_404(db, trip_id)
    _reset_detail_selections(db, trip_id)
    db.commit()
    return {"status": "ok"}


@router.post("/{trip_id}/nodes")
def create_trip_node(
    trip_id: int, payload: CreateNodeRequest, db: Session = Depends(get_db)
) -> dict[str, int]:
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    node = TripNode(
        trip_id=trip_id,
        node_type=payload.node_type,
        title=payload.title,
        description=payload.description,
        estimated_cost=payload.estimated_cost,
        position_x=payload.position_x,
        position_y=payload.position_y,
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return {"id": node.id}


@router.post("/{trip_id}/edges")
def create_trip_edge(
    trip_id: int, payload: CreateEdgeRequest, db: Session = Depends(get_db)
) -> dict[str, int]:
    _get_trip_or_404(db, trip_id)

    source_node = db.get(TripNode, payload.source_node_id)
    target_node = db.get(TripNode, payload.target_node_id)
    if not source_node or source_node.trip_id != trip_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source node not found")
    if not target_node or target_node.trip_id != trip_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target node not found")

    edge = TripEdge(
        trip_id=trip_id,
        source_node_id=payload.source_node_id,
        target_node_id=payload.target_node_id,
    )
    db.add(edge)
    db.commit()
    db.refresh(edge)
    return {"id": edge.id}


@router.post("/{trip_id}/accommodations/search")
def search_accommodations(
    trip_id: int, payload: AccommodationSearchRequest, db: Session = Depends(get_db)
) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    if not trip.destination:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )

    acc_rows = _accommodations_for_trip(db, trip)
    items = [_serialize_accommodation(a, trip.destination) for a in acc_rows]
    if payload.price_from is not None:
        items = [item for item in items if item["price"] >= payload.price_from]
    if payload.price_to is not None:
        items = [item for item in items if item["price"] <= payload.price_to]
    if payload.kinds:
        allowed = {kind.lower() for kind in payload.kinds}
        items = [item for item in items if item["kind"].lower() in allowed]

    if payload.stars_min is not None:
        items = [item for item in items if item["stars"] >= payload.stars_min]
    if payload.stars_max is not None:
        items = [item for item in items if item["stars"] <= payload.stars_max]
    if payload.breakfast_included is True:
        items = [item for item in items if item["breakfast_included"]]
    if payload.has_pool is True:
        items = [item for item in items if item["has_pool"]]

    if payload.sort_by in ("-price", "price_desc"):
        items.sort(key=lambda item: item["price"], reverse=True)
    elif payload.sort_by == "price":
        items.sort(key=lambda item: item["price"])
    else:
        items.sort(key=lambda item: item["rating"], reverse=True)

    return {
        "items": items,
        "nights": _get_nights(trip),
        "passengers": trip.passengers,
        "map_center": {
            "latitude": DESTINATION_COORDS.get(trip.destination, (0.0, 0.0))[0],
            "longitude": DESTINATION_COORDS.get(trip.destination, (0.0, 0.0))[1],
        },
    }


@router.post("/{trip_id}/accommodations/rooms")
def get_accommodation_rooms(
    trip_id: int, payload: AccommodationRoomsRequest, db: Session = Depends(get_db)
) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    accommodation = _get_accommodation_for_trip(
        db, trip, payload.accommodation_id, load_rooms=True
    )
    if not accommodation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accommodation not found")

    rooms = _build_room_options(trip, accommodation)
    if payload.room_price_from is not None:
        rooms = [room for room in rooms if room["price_total"] >= payload.room_price_from]
    if payload.room_price_to is not None:
        rooms = [room for room in rooms if room["price_total"] <= payload.room_price_to]

    if payload.sort_by in ("-price", "price_desc"):
        rooms.sort(key=lambda room: room["price_total"], reverse=True)
    else:
        rooms.sort(key=lambda room: room["price_total"])

    return {"items": rooms, "nights": _get_nights(trip), "passengers": trip.passengers}


@router.post("/{trip_id}/accommodations/select")
def select_accommodation(
    trip_id: int, payload: SelectOptionRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    trip = _get_trip_or_404(db, trip_id)
    destination_node = _get_node_by_type(db, trip_id, "destination")
    if not destination_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )

    selected = _get_accommodation_for_trip(db, trip, payload.item_id)
    if not selected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accommodation not found")

    _reset_choice_branch(db, trip_id, "accommodation")
    node = TripNode(
        trip_id=trip_id,
        node_type="accommodation",
        title=selected.title,
        description=f"Тип: {selected.kind}, рейтинг: {selected.rating}",
        estimated_cost=selected.base_price_per_night,
        position_x=-240,
        position_y=200,
    )
    db.add(node)
    db.flush()
    db.add(
        TripEdge(
            trip_id=trip_id,
            source_node_id=destination_node.id,
            target_node_id=node.id,
        )
    )
    db.commit()
    return {"status": "ok", "node_id": str(node.id)}


@router.post("/{trip_id}/accommodations/select-room")
def select_accommodation_room(
    trip_id: int, payload: AccommodationRoomSelectRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    trip = _get_trip_or_404(db, trip_id)
    destination_node = _get_node_by_type(db, trip_id, "destination")
    if not destination_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )

    accommodation = _get_accommodation_for_trip(
        db, trip, payload.accommodation_id, load_rooms=True
    )
    if not accommodation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accommodation not found")

    room = next(
        (
            item
            for item in _build_room_options(trip, accommodation)
            if item["room_id"] == payload.room_id
        ),
        None,
    )
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    _reset_choice_branch(db, trip_id, "accommodation")
    node = TripNode(
        trip_id=trip_id,
        node_type="accommodation",
        title=f"{accommodation.title} - {room['room_name']}",
        description=(
            f"Проживание: {room['nights']} ночей, {room['persons']} чел., "
            f"цена за ночь: {room['price_per_night']}"
        ),
        estimated_cost=room["price_total"],
        position_x=-240,
        position_y=200,
    )
    db.add(node)
    db.flush()
    db.add(
        TripEdge(
            trip_id=trip_id,
            source_node_id=destination_node.id,
            target_node_id=node.id,
        )
    )
    db.commit()
    return {"status": "ok", "node_id": str(node.id)}


@router.get("/{trip_id}/accommodations/{accommodation_id}/extras")
def get_hotel_extras(
    trip_id: int, accommodation_id: str, db: Session = Depends(get_db)
) -> dict:
    _get_trip_or_404(db, trip_id)
    return _serialize_hotel_extras(accommodation_id)


@router.post("/{trip_id}/accommodations/{accommodation_id}/extras/select")
def select_hotel_extra(
    trip_id: int,
    accommodation_id: str,
    payload: HotelExtraSelectRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    _get_trip_or_404(db, trip_id)
    accommodation_node = _get_node_by_type(db, trip_id, "accommodation")
    if not accommodation_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select accommodation room first",
        )

    selected = _find_hotel_extra(accommodation_id, payload.category, payload.item_id)
    if not selected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extra option not found")

    _reset_hotel_extra_category(db, trip_id, payload.category)
    node = TripNode(
        trip_id=trip_id,
        node_type=f"hotel_extra:{payload.category}",
        title=selected["title"],
        description=selected.get("description"),
        estimated_cost=selected.get("estimated_cost"),
        position_x=-420,
        position_y=360,
    )
    db.add(node)
    db.flush()
    db.add(
        TripEdge(
            trip_id=trip_id,
            source_node_id=accommodation_node.id,
            target_node_id=node.id,
        )
    )
    db.commit()
    return {"status": "ok", "node_id": str(node.id)}


@router.post("/{trip_id}/transport/search")
def search_transport(
    trip_id: int, payload: TransportSearchRequest, db: Session = Depends(get_db)
) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    if not trip.destination:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )

    legs = _transport_legs_for_trip(db, trip)
    items = _build_transport_itineraries(trip, legs, trip.destination)
    if payload.price_from is not None:
        items = [item for item in items if item["total_price"] >= payload.price_from]
    if payload.price_to is not None:
        items = [item for item in items if item["total_price"] <= payload.price_to]
    if payload.kinds:
        allowed = {kind.lower() for kind in payload.kinds}
        items = [item for item in items if item["kind"] in allowed]

    if payload.sort_by == "duration":
        items.sort(key=lambda item: item["total_duration_min"])
    elif payload.sort_by == "-duration":
        items.sort(key=lambda item: item["total_duration_min"], reverse=True)
    elif payload.sort_by in ("-price", "price_desc"):
        items.sort(key=lambda item: item["total_price"], reverse=True)
    else:
        items.sort(key=lambda item: item["total_price"])

    return {"items": items, "passengers": trip.passengers, "round_trip": trip.round_trip}


@router.get("/{trip_id}/transport/itineraries/{itinerary_id}")
def get_transport_itinerary(
    trip_id: int, itinerary_id: str, db: Session = Depends(get_db)
) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    selected = _find_itinerary_by_id(db, trip, itinerary_id)
    if not selected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    return selected


@router.post("/{trip_id}/transport/select")
def select_transport(
    trip_id: int, payload: TransportSelectRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    trip = _get_trip_or_404(db, trip_id)
    destination_node = _get_node_by_type(db, trip_id, "destination")
    if not destination_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )

    selected = _find_itinerary_by_id(db, trip, payload.itinerary_id)
    if not selected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport not found")

    _reset_choice_branch(db, trip_id, "transport")
    inbound_title = selected["inbound"]["title"] if selected["inbound"] else "нет"
    node = TripNode(
        trip_id=trip_id,
        node_type="transport",
        title=f"Рейс: {selected['outbound']['title']}",
        description=(
            f"Туда: {selected['outbound']['title']}; Обратно: {inbound_title}; "
            f"в пути: {selected['total_duration_min']} мин"
        ),
        estimated_cost=selected["total_price"],
        position_x=240,
        position_y=200,
    )
    db.add(node)
    db.flush()
    db.add(
        TripEdge(
            trip_id=trip_id,
            source_node_id=destination_node.id,
            target_node_id=node.id,
        )
    )
    db.commit()
    return {"status": "ok", "node_id": str(node.id)}


@router.get("/{trip_id}/transport/{itinerary_id}/extras")
def get_transport_extras(
    trip_id: int, itinerary_id: str, db: Session = Depends(get_db)
) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    itinerary = _find_itinerary_by_id(db, trip, itinerary_id)
    if not itinerary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    return _serialize_transport_extras(itinerary)


@router.post("/{trip_id}/transport/{itinerary_id}/extras/select")
def select_transport_extra(
    trip_id: int,
    itinerary_id: str,
    payload: TransportExtraSelectRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    trip = _get_trip_or_404(db, trip_id)
    transport_node = _get_node_by_type(db, trip_id, "transport")
    if not transport_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select transport itinerary first",
        )
    itinerary = _find_itinerary_by_id(db, trip, itinerary_id)
    if not itinerary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    extras_payload = _serialize_transport_extras(itinerary)
    selected = _find_transport_extra(extras_payload, payload.category, payload.item_id)
    if not selected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extra option not found")

    _reset_transport_extra_category(db, trip_id, payload.category)
    node = TripNode(
        trip_id=trip_id,
        node_type=f"transport_extra:{payload.category}",
        title=selected["title"],
        description=selected.get("description"),
        estimated_cost=selected.get("estimated_cost"),
        position_x=420,
        position_y=360,
    )
    db.add(node)
    db.flush()
    db.add(
        TripEdge(
            trip_id=trip_id,
            source_node_id=transport_node.id,
            target_node_id=node.id,
        )
    )
    db.commit()
    return {"status": "ok", "node_id": str(node.id)}


@router.get("/{trip_id}/city-transport/options")
def get_city_transport_options(trip_id: int, db: Session = Depends(get_db)) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    if not trip.destination:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )
    return _serialize_city_transport(trip.destination)


@router.post("/{trip_id}/city-transport/select")
def select_city_transport(
    trip_id: int, payload: CityTransportSelectRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    trip = _get_trip_or_404(db, trip_id)
    destination_node = _get_node_by_type(db, trip_id, "destination")
    if not destination_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )
    selected = _find_city_transport_item(trip.destination, payload.category, payload.item_id)
    if not selected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City transport option not found")

    _reset_city_transport_category(db, trip_id, payload.category)
    node = TripNode(
        trip_id=trip_id,
        node_type=f"city_transport:{payload.category}",
        title=selected["title"],
        description=selected.get("description"),
        estimated_cost=selected.get("estimated_cost"),
        position_x=0,
        position_y=420,
    )
    db.add(node)
    db.flush()
    db.add(
        TripEdge(
            trip_id=trip_id,
            source_node_id=destination_node.id,
            target_node_id=node.id,
        )
    )
    db.commit()
    return {"status": "ok", "node_id": str(node.id)}


@router.get("/{trip_id}/day-plan/options")
def get_day_plan_options(trip_id: int, db: Session = Depends(get_db)) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    if not trip.destination:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )
    return _serialize_day_plan(trip)


@router.post("/{trip_id}/day-plan/select")
def select_day_plan_item(
    trip_id: int, payload: DayPlanSelectRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    trip = _get_trip_or_404(db, trip_id)
    destination_node = _get_node_by_type(db, trip_id, "destination")
    if not destination_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select destination first",
        )

    selected = _find_day_plan_item(trip, payload.day_key, payload.slot, payload.item_id)
    if not selected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day plan item not found")

    _reset_day_plan_slot(db, trip_id, payload.day_key, payload.slot)
    node = TripNode(
        trip_id=trip_id,
        node_type=f"day_plan:{payload.day_key}:{payload.slot}",
        title=selected["title"],
        description=f"{payload.day_key} · {payload.slot} · {selected.get('description', '')}",
        estimated_cost=selected.get("estimated_cost"),
        position_x=0,
        position_y=520,
    )
    db.add(node)
    db.flush()
    db.add(
        TripEdge(
            trip_id=trip_id,
            source_node_id=destination_node.id,
            target_node_id=node.id,
        )
    )
    db.commit()
    return {"status": "ok", "node_id": str(node.id)}


@router.get("/{trip_id}/summary")
def get_trip_summary(trip_id: int, db: Session = Depends(get_db)) -> dict:
    trip = _get_trip_or_404(db, trip_id)
    selected_nodes = db.execute(
        select(TripNode).where(
            TripNode.trip_id == trip_id,
            or_(
                TripNode.node_type.in_(["accommodation", "transport"]),
                TripNode.node_type.like("hotel_extra:%"),
                TripNode.node_type.like("transport_extra:%"),
                TripNode.node_type.like("city_transport:%"),
                TripNode.node_type.like("day_plan:%"),
            ),
        )
    ).scalars()
    items = list(selected_nodes)
    nights = _get_nights(trip)
    passengers = max(1, trip.passengers)

    breakdown = []
    line_totals: list[float] = []
    for node in items:
        unit_cost, line_total, is_per_person = _billing_for_node(node, passengers)
        line_totals.append(line_total)
        breakdown.append(
            {
                "node_type": node.node_type,
                "title": node.title,
                "description": node.description,
                "cost": line_total,
                "per_person": unit_cost if is_per_person else None,
                "is_per_person": is_per_person,
            }
        )
    total = round(sum(line_totals), 2)

    calculations: list[dict] = []
    for node in items:
        unit_cost, line_total, is_per_person = _billing_for_node(node, passengers)
        base = {
            "node_type": node.node_type,
            "title": node.title,
            "result": line_total,
            "is_per_person": is_per_person,
            "passengers": passengers if is_per_person else None,
            "per_person": unit_cost if is_per_person else None,
        }
        if node.node_type == "accommodation":
            nightly_price = round(line_total / nights, 2)
            calculations.append(
                {
                    **base,
                    "formula": "price_per_night * nights",
                    "values": {
                        "price_per_night": nightly_price,
                        "nights": nights,
                    },
                }
            )
        elif node.node_type == "transport":
            legs = 2 if trip.round_trip else 1
            price_per_person_total = round(line_total / passengers, 2)
            price_per_leg_per_person = round(price_per_person_total / legs, 2)
            calculations.append(
                {
                    **base,
                    "formula": "price_per_leg_per_person * legs * passengers",
                    "values": {
                        "price_per_leg_per_person": price_per_leg_per_person,
                        "legs": legs,
                        "passengers": passengers,
                    },
                    "per_person": price_per_person_total,
                }
            )
        elif is_per_person:
            calculations.append(
                {
                    **base,
                    "formula": "per_person * passengers",
                    "values": {
                        "per_person": unit_cost,
                        "passengers": passengers,
                    },
                }
            )

    total_formula = " + ".join(
        [f"{item['node_type']}: {item['result']}" for item in calculations]
    ) or "0"
    return {
        "trip_id": trip.id,
        "currency": "USD",
        "total_estimated_cost": total,
        "breakdown": breakdown,
        "calculation": {
            "items": calculations,
            "total_formula": total_formula,
        },
        "params": {
            "origin": trip.origin,
            "destination": trip.destination,
            "start_date": trip.start_date.isoformat() if trip.start_date else None,
            "end_date": trip.end_date.isoformat() if trip.end_date else None,
            "passengers": trip.passengers,
            "round_trip": trip.round_trip,
        },
    }
