"""Поиск рейсов по поездке через Travelpayouts / Aviasales."""

from __future__ import annotations

import hashlib
import time
from datetime import date
from typing import Any

from app.core.config import settings
from app.data.iata_catalog import (
    destination_title_to_iata,
    enrich_place_names,
    origin_city_to_iata,
    origin_iata_label,
    resolve_destination,
)
from app.models.trip import Trip
from app.services.travelpayouts import fetch_prices_for_route, build_aviasales_search_url

ITINERARY_CACHE_TTL_SEC = 3600
_trip_itinerary_cache: dict[int, tuple[float, dict[str, dict[str, Any]]]] = {}


def _itinerary_id_from_row(row: dict[str, Any]) -> str:
    key = "|".join(
        str(row.get(field, ""))
        for field in (
            "origin",
            "destination",
            "departure_at",
            "return_at",
            "airline",
            "flight_number",
            "price",
            "origin_airport",
            "destination_airport",
        )
    )
    digest = hashlib.sha256(key.encode()).hexdigest()[:16]
    return f"av_{digest}"


def _format_leg_title(
    from_label: str,
    to_label: str,
    when: str | None,
    airline: str | None,
    flight_number: Any,
) -> str:
    parts = [f"{from_label} → {to_label}"]
    if when:
        parts.append(when[:10] if len(when) >= 10 else when)
    if airline:
        tail = airline
        if flight_number is not None:
            tail = f"{airline} {flight_number}"
        parts.append(tail)
    return ", ".join(parts)


def _row_to_itinerary(row: dict[str, Any], trip: Trip) -> dict[str, Any]:
    origin_iata = str(row.get("origin", "")).upper()
    dest_iata = str(row.get("destination", "")).upper()
    names = enrich_place_names(dict(row))
    origin_label = names.get("origin_label") or origin_iata
    dest_label = names.get("city") or dest_iata

    price_per_person = int(round(float(row.get("price", 0))))
    passengers = max(1, trip.passengers)
    total_price = round(price_per_person * passengers, 2)

    duration_to = int(row.get("duration_to") or 0)
    duration_back = int(row.get("duration_back") or 0)
    total_duration = int(row.get("duration") or 0)
    if total_duration <= 0:
        total_duration = duration_to + duration_back

    itinerary_id = _itinerary_id_from_row(row)
    aviasales_url = build_aviasales_search_url(row.get("link"))
    airline = row.get("airline") or ""
    flight_number = row.get("flight_number")
    transfers = row.get("transfers")
    return_transfers = row.get("return_transfers")

    outbound = {
        "id": f"{itinerary_id}_out",
        "destination": trip.destination,
        "kind": "flight",
        "title": _format_leg_title(
            origin_label,
            dest_label,
            row.get("departure_at"),
            airline,
            flight_number,
        ),
        "duration_min": duration_to or total_duration,
        "price": float(price_per_person),
        "airline": airline,
        "aircraft_model": "",
        "origin_airport": row.get("origin_airport") or origin_iata,
        "destination_airport": row.get("destination_airport") or dest_iata,
        "cabin_class": "economy",
        "source_url": aviasales_url or "",
        "price_includes": [],
        "departure_at": row.get("departure_at"),
        "transfers": transfers,
    }

    inbound = None
    if trip.round_trip and row.get("return_at"):
        inbound = {
            "id": f"{itinerary_id}_in",
            "destination": trip.destination,
            "kind": "flight",
            "title": _format_leg_title(
                dest_label,
                origin_label,
                row.get("return_at"),
                airline,
                flight_number,
            ),
            "duration_min": duration_back or 0,
            "price": 0.0,
            "airline": airline,
            "aircraft_model": "",
            "origin_airport": row.get("destination_airport") or dest_iata,
            "destination_airport": row.get("origin_airport") or origin_iata,
            "cabin_class": "economy",
            "source_url": aviasales_url or "",
            "price_includes": [],
            "departure_at": row.get("return_at"),
            "transfers": return_transfers,
        }

    legs = [{**outbound, "direction": "outbound", "direction_label": "Туда"}]
    if inbound:
        legs.append({**inbound, "direction": "inbound", "direction_label": "Обратно"})

    sources: list[dict[str, str]] = []
    if aviasales_url:
        sources.append({"airline": airline or "Aviasales", "url": aviasales_url})

    details = {
        "total_duration_min": total_duration,
        "price_per_passenger": float(price_per_person),
        "passengers": passengers,
        "legs": legs,
        "price_includes": [],
        "sources": sources,
        "cabin_class": "economy",
        "data_source_note": (
            "Данные рейса и цена из кэша Aviasales (Travelpayouts). "
            "Для покупки перейдите на Aviasales — там актуальная выдача."
        ),
        "aviasales_url": aviasales_url,
        "expires_at": row.get("expires_at"),
        "origin_iata": origin_iata,
        "destination_iata": dest_iata,
        "origin_label": origin_label,
        "destination_label": dest_label,
    }

    return {
        "itinerary_id": itinerary_id,
        "kind": "flight",
        "outbound": {"title": outbound["title"]},
        "inbound": {"title": inbound["title"]} if inbound else None,
        "total_duration_min": total_duration,
        "total_price": total_price,
        "details": details,
    }


def _cache_itineraries(trip_id: int, items: list[dict[str, Any]]) -> None:
    mapping = {item["itinerary_id"]: item for item in items}
    _trip_itinerary_cache[trip_id] = (time.time() + ITINERARY_CACHE_TTL_SEC, mapping)


def get_cached_itinerary(trip_id: int, itinerary_id: str) -> dict[str, Any] | None:
    entry = _trip_itinerary_cache.get(trip_id)
    if not entry:
        return None
    expires_at, mapping = entry
    if time.time() >= expires_at:
        _trip_itinerary_cache.pop(trip_id, None)
        return None
    return mapping.get(itinerary_id)


def _trip_origin_iata(trip: Trip) -> str:
    origin = (trip.origin or "Москва").strip()
    if len(origin) <= 3 and origin.isalpha():
        return origin.upper()
    return origin_city_to_iata(origin)


def _trip_destination_iata(trip: Trip) -> str:
    return destination_title_to_iata(trip.destination)


def _date_iso(value: date | None) -> str | None:
    return value.isoformat() if value else None


def search_trip_flights(trip: Trip) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    token = settings.TRAVELPAYOUTS_API_TOKEN.strip()
    if not token:
        raise RuntimeError("TRAVELPAYOUTS_API_TOKEN is not configured")
    if not trip.destination:
        raise RuntimeError("Select destination first")
    if not trip.start_date:
        raise RuntimeError("Set trip start date first")
    if trip.round_trip and not trip.end_date:
        raise RuntimeError("Set trip return date for round trip")
    if trip.round_trip and trip.start_date and trip.end_date:
        trip_days = (trip.end_date - trip.start_date).days
        if trip_days < 1:
            raise ValueError("Дата возврата должна быть позже даты вылета")
        if trip_days > 30:
            raise ValueError(
                "Слишком длинная поездка для поиска рейсов (больше 30 дней). "
                "Сократите даты или измените обратный вылет."
            )

    origin_iata = _trip_origin_iata(trip)
    destination_iata = _trip_destination_iata(trip)
    departure_at = _date_iso(trip.start_date)
    return_at = _date_iso(trip.end_date) if trip.round_trip else None

    rows = fetch_prices_for_route(
        origin_iata=origin_iata,
        destination_iata=destination_iata,
        departure_at=departure_at,
        return_at=return_at,
        one_way=not trip.round_trip,
    )

    items = [_row_to_itinerary(row, trip) for row in rows]
    _cache_itineraries(trip.id, items)

    dest_meta = resolve_destination(destination_iata)
    meta = {
        "origin_iata": origin_iata,
        "destination_iata": destination_iata,
        "origin_label": origin_iata_label(origin_iata),
        "destination_label": dest_meta["city"],
        "departure_at": departure_at,
        "return_at": return_at,
        "source": "aviasales",
        "currency": settings.TRAVELPAYOUTS_CURRENCY,
        "count": len(items),
    }
    return items, meta


def find_trip_itinerary(trip: Trip, itinerary_id: str) -> dict[str, Any] | None:
    cached = get_cached_itinerary(trip.id, itinerary_id)
    if cached:
        return cached
    items, _ = search_trip_flights(trip)
    for item in items:
        if item["itinerary_id"] == itinerary_id:
            return item
    return None
