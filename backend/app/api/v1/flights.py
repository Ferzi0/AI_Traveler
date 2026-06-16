from fastapi import APIRouter, HTTPException, Query, status

from app.core.config import settings
from app.data.iata_catalog import (
    destination_title_to_iata,
    enrich_place_names,
    origin_city_to_iata,
    origin_iata_label,
)
from app.services.travelpayouts import (
    fetch_price_calendar,
    fetch_special_offers,
    get_popular_destinations,
)

router = APIRouter()


def _resolve_origin_iata(origin: str) -> str:
    value = origin.strip()
    if len(value) <= 3:
        return value.upper()
    return origin_city_to_iata(value)


def _resolve_destination_iata(destination: str) -> str:
    value = destination.strip()
    if len(value) <= 3:
        return value.upper()
    return destination_title_to_iata(value)


@router.get("/popular")
def popular_destinations(
    origin: str = Query(default="MOW", min_length=2, max_length=128, description="IATA города вылета"),
    limit: int = Query(default=6, ge=1, le=30),
) -> dict:
    origin_iata = _resolve_origin_iata(origin)

    try:
        payload = get_popular_destinations(origin_iata=origin_iata, limit=limit)
        payload["origin_label"] = origin_iata_label(payload["origin"])
        return payload
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.get("/calendar")
def price_calendar(
    origin: str = Query(..., min_length=2, max_length=128),
    destination: str = Query(..., min_length=2, max_length=128),
    depart_month: str = Query(..., pattern=r"^\d{4}-\d{2}$"),
    return_month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    trip_length: int | None = Query(default=None, ge=1, le=90),
) -> dict:
    origin_iata = _resolve_origin_iata(origin)
    destination_iata = _resolve_destination_iata(destination)

    try:
        items = fetch_price_calendar(
            origin_iata=origin_iata,
            destination_iata=destination_iata,
            depart_month=depart_month,
            return_month=return_month,
            trip_length=trip_length,
        )
        return {
            "origin": origin_iata,
            "destination": destination_iata,
            "origin_label": origin_iata_label(origin_iata),
            "destination_label": enrich_place_names(
                {"destination": destination_iata}
            ).get("city", destination_iata),
            "depart_month": depart_month,
            "return_month": return_month,
            "trip_length": trip_length,
            "currency": settings.TRAVELPAYOUTS_CURRENCY,
            "items": items,
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.get("/special-offers")
def special_offers(
    origin: str = Query(default="MOW", min_length=2, max_length=128),
    destination: str | None = Query(default=None, min_length=2, max_length=128),
    limit: int = Query(default=6, ge=1, le=30),
) -> dict:
    origin_iata = _resolve_origin_iata(origin)
    destination_iata = _resolve_destination_iata(destination) if destination else None

    try:
        items = fetch_special_offers(
            origin_iata=origin_iata,
            destination_iata=destination_iata,
            limit=limit,
        )
        return {
            "origin": origin_iata,
            "destination": destination_iata,
            "origin_label": origin_iata_label(origin_iata),
            "currency": settings.TRAVELPAYOUTS_CURRENCY,
            "items": items,
        }
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
