from fastapi import APIRouter, HTTPException, Query, status

from app.data.iata_catalog import enrich_place_names, origin_city_to_iata, origin_iata_label
from app.services.travelpayouts import get_popular_destinations

router = APIRouter()


@router.get("/popular")
def popular_destinations(
    origin: str = Query(default="MOW", min_length=2, max_length=128, description="IATA города вылета"),
    limit: int = Query(default=6, ge=1, le=30),
) -> dict:
    origin_iata = origin.strip().upper()
    if len(origin_iata) > 3:
        origin_iata = origin_city_to_iata(origin)

    try:
        payload = get_popular_destinations(origin_iata=origin_iata, limit=limit)
        payload["origin_label"] = origin_iata_label(payload["origin"])
        return payload
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
