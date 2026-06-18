import json
import re
from datetime import date
from html import escape

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
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


def _calculation_items(snapshot: dict | None) -> list[dict]:
    if not isinstance(snapshot, dict):
        return []
    calculation = snapshot.get("calculation")
    if not isinstance(calculation, dict):
        return []
    items = calculation.get("items")
    if not isinstance(items, list):
        return []
    return [item for item in items if isinstance(item, dict)]


def _detail_calculation_items(snapshot: dict | None) -> list[dict]:
    detail: list[dict] = []
    for item in _calculation_items(snapshot):
        node_type = str(item.get("node_type") or "")
        if node_type.startswith("hotel_extra:") or node_type.startswith("city_transport:"):
            detail.append(item)
    return detail


def _format_calc_price(item: dict) -> str:
    result = item.get("result")
    if isinstance(result, (int, float)):
        rounded = int(round(float(result)))
        return f"~{rounded:,}".replace(",", " ") + " ₽"
    return "—"


def _detail_section_html(snapshot: dict | None) -> str:
    items = _detail_calculation_items(snapshot)
    if not items:
        return ""

    hotel_items = [item for item in items if str(item.get("node_type", "")).startswith("hotel_extra:")]
    city_items = [item for item in items if str(item.get("node_type", "")).startswith("city_transport:")]

    def render_group(title: str, group: list[dict]) -> str:
        if not group:
            return ""
        lines = []
        for item in group:
            label = escape(str(item.get("title") or "Позиция"))
            lines.append(
                f'<li><span class="calc-title">{label}</span><span class="calc-price">{_format_calc_price(item)}</span></li>'
            )
        return f"""
          <div class="detail-group">
            <h4>{escape(title)}</h4>
            <ul class="calc-list">
              {"".join(lines)}
            </ul>
          </div>
        """

    groups = render_group("Рядом с отелем", hotel_items) + render_group("Транспорт по городу", city_items)
    return f"""
      <div class="section">
        <h3>Детализация</h3>
        {groups}
      </div>
    """

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


def _label_value(label: str, value: str | None) -> str:
    return f"""
      <div class="row">
        <div class="label">{escape(label)}</div>
        <div class="value">{escape(value) if value else "—"}</div>
      </div>
    """


def _build_pdf_html(row: TripHistory) -> str:
    snapshot: dict | None = None
    if row.snapshot_json:
        try:
            snapshot = json.loads(row.snapshot_json)
        except json.JSONDecodeError:
            snapshot = None

    calc_html = ""
    calc_items = _calculation_items(snapshot)
    if calc_items:
        lines: list[str] = []
        for item in calc_items:
            title = escape(str(item.get("title") or "Позиция"))
            result_text = _format_calc_price(item)
            lines.append(
                f'<li><span class="calc-title">{title}</span><span class="calc-price">{result_text}</span></li>'
            )
        if lines:
            calc_html = f"""
              <div class="section">
                <h3>Состав стоимости</h3>
                <ul class="calc-list">
                  {"".join(lines)}
                </ul>
              </div>
            """

    detail_html = _detail_section_html(snapshot)

    total = (
        f"~{int(round(float(row.total_cost))):,}".replace(",", " ") + " ₽"
        if row.total_cost is not None
        else row.total_cost_label or "—"
    )
    start_label = row.start_date.strftime("%d.%m.%Y") if row.start_date else "—"
    end_label = row.end_date.strftime("%d.%m.%Y") if row.end_date else "—"
    trip_dates = f"{start_label} – {end_label}"

    return f"""
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <style>
    @page {{ size: A4; margin: 20mm 15mm; }}
    body {{
      margin: 0;
      font-family: Arial, sans-serif;
      color: #1d1d1d;
      font-size: 12px;
      line-height: 1.45;
    }}
    .header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #e5dfd6;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }}
    .brand {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .brand h1 {{
      margin: 0;
      font-size: 22px;
      font-weight: 700;
    }}
    .brand p {{
      margin: 1px 0 0;
      color: #746a5f;
      font-size: 11px;
      letter-spacing: 0.06em;
    }}
    .trip-title {{
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 8px;
    }}
    .section {{
      border: 1px solid #e6e1da;
      border-radius: 10px;
      padding: 10px 12px;
      margin-top: 10px;
    }}
    .section h3 {{
      margin: 0 0 8px;
      font-size: 13px;
    }}
    .section h4 {{
      margin: 8px 0 6px;
      font-size: 12px;
      color: #5a5046;
    }}
    .detail-group + .detail-group {{
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #ece8e2;
    }}
    .row {{
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px dashed #ece8e2;
    }}
    .row:last-child {{ border-bottom: none; }}
    .label {{ color: #776d62; font-weight: 700; }}
    .value {{ color: #1e1e1e; }}
    .calc-list {{
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 6px;
    }}
    .calc-list li {{
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 4px 0;
      border-bottom: 1px dashed #ece8e2;
    }}
    .calc-list li:last-child {{ border-bottom: none; }}
    .calc-title {{ color: #383028; }}
    .calc-price {{ font-weight: 700; color: #6b3f28; }}
    .total {{
      margin-top: 12px;
      text-align: right;
      font-size: 20px;
      font-weight: 800;
      color: #6b3f28;
    }}
    .muted {{
      color: #7f7468;
      font-size: 11px;
      margin-top: 16px;
      text-align: right;
    }}
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="favGradientPdf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#D98A5F"/>
            <stop offset="100%" stop-color="#B44A12"/>
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="29" stroke="url(#favGradientPdf)" stroke-width="2.8" fill="none"/>
        <path d="M20 10C13 18 11 29 13 41C15 50 20 56 23 59" stroke="#D27A4F" stroke-width="2" stroke-linecap="round"/>
        <path d="M44 10C51 18 53 29 51 41C49 50 44 56 41 59" stroke="#D27A4F" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 24H54" stroke="#D27A4F" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 38H52" stroke="#D27A4F" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <div>
        <h1>AI Traveler</h1>
        <p>SMART TRAVEL PLANNER</p>
      </div>
    </div>
    <div>{escape(row.saved_at.strftime("%d.%m.%Y %H:%M")) if row.saved_at else ""}</div>
  </div>

  <p class="trip-title">{escape(row.destination or row.trip_name or "Поездка")}</p>

  <div class="section">
    {_label_value("Откуда", row.origin)}
    {_label_value("Куда", row.destination)}
    {_label_value("Даты", trip_dates)}
    {_label_value("Пассажиры", str(row.passengers) if row.passengers else "—")}
    {_label_value("Отель", row.hotel_title)}
    {_label_value("Номер", row.room_title)}
    {_label_value("Рейс", row.flight_title)}
    {_label_value("Багаж", row.baggage_title)}
    {_label_value("Возврат", row.refund_title)}
  </div>

  {detail_html}

  {calc_html}

  <div class="total">Итого: {escape(total)}</div>
  <div class="muted">Сформировано AI Traveler</div>
</body>
</html>
    """


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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запись истории не найдена")
    return _serialize_history(row, include_snapshot=True)


@router.get("/{history_id}/pdf")
def download_history_pdf(
    history_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    row = db.get(TripHistory, history_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запись истории не найдена")

    try:
        from weasyprint import HTML
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PDF сервис временно недоступен на сервере",
        ) from exc

    pdf = HTML(string=_build_pdf_html(row)).write_pdf()
    base_name = row.destination or row.trip_name or f"trip-{row.id}"
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", base_name).strip("_") or f"trip-{row.id}"
    filename = f"{safe_name}.pdf"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("")
def save_trip_to_history(
    payload: SaveTripRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    trip = _get_trip_or_404(db, payload.trip_id)
    if trip.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Это не ваша поездка")

    summary = get_trip_summary(payload.trip_id, db)
    nodes = list(
        db.execute(select(TripNode).where(TripNode.trip_id == payload.trip_id)).scalars().all()
    )

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
        missing: list[str] = []
        if not hotel_title:
            missing.append("отель и номер")
        if not flight_title:
            missing.append("рейс")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Перед сохранением выберите: {', '.join(missing)}",
        )

    total = summary.get("total_estimated_cost", 0)
    currency = settings.TRAVELPAYOUTS_CURRENCY.upper()
    rounded = int(round(float(total)))
    total_label = (
        f"~{rounded:,}".replace(",", " ") + " ₽"
        if currency == "RUB"
        else f"~{rounded} {currency}"
    )
    row = TripHistory(
        user_id=user.id,
        trip_id=trip.id,
        trip_name=f"{destination} · {hotel_title}",
        total_cost_label=total_label,
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


@router.delete("/{history_id}")
def delete_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    row = db.get(TripHistory, history_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запись истории не найдена")
    db.delete(row)
    db.commit()
    return {"status": "ok"}
