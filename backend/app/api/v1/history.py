import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.v1.trips import _get_trip_or_404, get_trip_summary
from app.core.database import get_db
from app.models.trip import Trip
from app.models.trip_history import TripHistory
from app.models.trip_node import TripNode
from app.models.user import User

router = APIRouter()


class SaveTripRequest(BaseModel):
    trip_id: int = Field(ge=1)


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


def _node_title_by_type(nodes: list[TripNode], node_type: str) -> str | None:
    for node in nodes:
        if node.node_type == node_type:
            return node.title
    return None


def _extra_title(nodes: list[TripNode], prefix: str) -> str | None:
    for node in nodes:
        if node.node_type.startswith(prefix):
            return node.title
    return None


def _serialize_history(row: TripHistory, include_snapshot: bool = False) -> dict:
    snapshot = None
    if include_snapshot and row.snapshot_json:
        try:
            snapshot = json.loads(row.snapshot_json)
        except json.JSONDecodeError:
            snapshot = None
    date_label = ""
    if row.start_date:
        date_label = row.start_date.strftime("%d.%m.%Y")
        if row.end_date and row.end_date != row.start_date:
            date_label += f" – {row.end_date.strftime('%d.%m.%Y')}"

    return {
        "id": row.id,
        "trip_id": row.trip_id,
        "trip_name": row.trip_name,
        "destination": row.destination,
        "origin": row.origin,
        "hotel": row.hotel_title,
        "room": row.room_title,
        "flight": row.flight_title,
        "baggage": row.baggage_title,
        "refund": row.refund_title,
        "date": date_label,
        "passengers": row.passengers,
        "total": row.total_cost,
        "total_label": row.total_cost_label,
        "saved_at": row.saved_at.isoformat() if row.saved_at else None,
        "snapshot": snapshot,
    }


@router.get("")
def list_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    rows = db.execute(
        select(TripHistory)
        .where(TripHistory.user_id == user.id)
        .order_by(TripHistory.saved_at.desc())
    ).scalars()
    return {"items": [_serialize_history(row) for row in rows]}


@router.get("/{history_id}")
def get_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    row = db.get(TripHistory, history_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History item not found")
    return _serialize_history(row, include_snapshot=True)


@router.post("")
def save_trip_to_history(
    payload: SaveTripRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    trip = _get_trip_or_404(db, payload.trip_id)
    if trip.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your trip")

    summary = get_trip_summary(payload.trip_id, db)
    nodes = db.execute(
        select(TripNode).where(TripNode.trip_id == payload.trip_id)
    ).scalars()

    params = summary.get("params") or {}
    destination = params.get("destination") or trip.destination or "Поездка"
    acc_title = _node_title_by_type(nodes, "accommodation")
    hotel_title = acc_title
    room_title = None
    if acc_title and " - " in acc_title:
        hotel_title, room_title = acc_title.split(" - ", 1)
    flight_title = _node_title_by_type(nodes, "transport")
    baggage_title = _extra_title(nodes, "transport_extra:baggage")
    refund_title = _extra_title(nodes, "transport_extra:refund_policy")

    if not hotel_title or not flight_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Select hotel room and flight before saving",
        )

    total = summary.get("total_estimated_cost", 0)
    row = TripHistory(
        user_id=user.id,
        trip_id=trip.id,
        trip_name=f"{destination} · {hotel_title}",
        total_cost_label=f"${total}",
        destination=destination,
        origin=params.get("origin") or trip.origin,
        start_date=_parse_date(params.get("start_date")),
        end_date=_parse_date(params.get("end_date")),
        passengers=params.get("passengers") or trip.passengers,
        hotel_title=hotel_title,
        room_title=room_title,
        flight_title=flight_title,
        baggage_title=baggage_title,
        refund_title=refund_title,
        total_cost=float(total),
        snapshot_json=json.dumps(summary, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _serialize_history(row, include_snapshot=True)
