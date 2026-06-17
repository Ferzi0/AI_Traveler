from __future__ import annotations

import re
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.catalog_review import CatalogReview

RATING_IN_DESCRIPTION_RE = re.compile(r"рейтинг\s+([\d.]+)", re.IGNORECASE)


@dataclass(frozen=True)
class EntityRef:
    entity_type: str
    entity_id: str
    category: str = ""


def entity_ref_key(entity_type: str, entity_id: str, category: str | None = None) -> str:
    return f"{entity_type}:{entity_id}:{category or ''}"


def catalog_rating_from_description(description: str) -> float | None:
    match = RATING_IN_DESCRIPTION_RE.search(description or "")
    if not match:
        return None
    try:
        value = float(match.group(1))
    except ValueError:
        return None
    return round(min(5.0, max(1.0, value)), 1)


def get_batch_review_stats(db: Session, refs: list[EntityRef]) -> dict[str, dict[str, float | int]]:
    if not refs:
        return {}

    entity_ids = {ref.entity_id for ref in refs}
    entity_types = {ref.entity_type for ref in refs}

    rows = db.execute(
        select(
            CatalogReview.entity_type,
            CatalogReview.entity_id,
            CatalogReview.category,
            func.avg(CatalogReview.rating).label("average_rating"),
            func.count(CatalogReview.id).label("review_count"),
        )
        .where(
            CatalogReview.entity_type.in_(entity_types),
            CatalogReview.entity_id.in_(entity_ids),
        )
        .group_by(CatalogReview.entity_type, CatalogReview.entity_id, CatalogReview.category)
    ).all()

    stats: dict[str, dict[str, float | int]] = {}
    for row in rows:
        key = entity_ref_key(row.entity_type, row.entity_id, row.category)
        stats[key] = {
            "average_rating": round(float(row.average_rating or 0), 1),
            "review_count": int(row.review_count or 0),
        }
    return stats


def _attach_stats(
    item: dict,
    entity_type: str,
    category: str | None,
    stats: dict[str, dict[str, float | int]],
    *,
    fallback_rating: float | None,
) -> dict:
    key = entity_ref_key(entity_type, item["id"], category)
    row = stats.get(key)
    review_count = int(row["review_count"]) if row else 0
    average_rating = float(row["average_rating"]) if row and review_count > 0 else None
    if average_rating is None and fallback_rating is not None:
        average_rating = round(fallback_rating, 1)
    item["average_rating"] = average_rating
    item["review_count"] = review_count
    return item


def attach_accommodation_review_stats(db: Session, items: list[dict]) -> list[dict]:
    refs = [EntityRef("accommodation", item["id"]) for item in items]
    stats = get_batch_review_stats(db, refs)
    for item in items:
        fallback = float(item.get("stars") or 0) or None
        _attach_stats(item, "accommodation", None, stats, fallback_rating=fallback)
    return items


def attach_catalog_item_review_stats(
    db: Session,
    items: list[dict],
    *,
    entity_type: str,
    category: str,
) -> list[dict]:
    refs = [EntityRef(entity_type, item["id"], category) for item in items]
    stats = get_batch_review_stats(db, refs)
    for item in items:
        fallback = catalog_rating_from_description(item.get("description", ""))
        _attach_stats(item, entity_type, category, stats, fallback_rating=fallback)
    return items


def attach_hotel_extras_review_stats(db: Session, payload: dict) -> dict:
    categories = payload.get("categories") or []
    for category_row in categories:
        category = category_row.get("category") or ""
        items = category_row.get("items") or []
        attach_catalog_item_review_stats(
            db,
            items,
            entity_type="hotel_extra",
            category=category,
        )
    return payload


def attach_city_transport_review_stats(db: Session, payload: dict) -> dict:
    categories = payload.get("categories") or []
    for category_row in categories:
        category = category_row.get("category") or ""
        items = category_row.get("items") or []
        attach_catalog_item_review_stats(
            db,
            items,
            entity_type="city_transport",
            category=category,
        )
    return payload
