from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.catalog_review import CatalogReview
from app.models.user import User
from app.services.review_stats import EntityRef, entity_ref_key, get_batch_review_stats

router = APIRouter()
optional_bearer = HTTPBearer(auto_error=False)

ENTITY_TYPES = {"accommodation", "hotel_extra", "city_transport"}


class ReviewCreateRequest(BaseModel):
    entity_type: str = Field(pattern="^(accommodation|hotel_extra|city_transport)$")
    entity_id: str = Field(min_length=1, max_length=128)
    category: str = Field(default="", max_length=64)
    rating: int = Field(ge=1, le=5)
    body: str = Field(default="", max_length=2000)


class ReviewBatchItem(BaseModel):
    entity_type: str = Field(pattern="^(accommodation|hotel_extra|city_transport)$")
    entity_id: str = Field(min_length=1, max_length=128)
    category: str = Field(default="", max_length=64)


class ReviewBatchRequest(BaseModel):
    items: list[ReviewBatchItem]


def _author_label(user: User) -> str:
    first = (user.first_name or "").strip()
    last_initial = (user.last_name or "").strip()[:1]
    if first and last_initial:
        return f"{first} {last_initial}."
    return user.login


def _serialize_review(row: CatalogReview, user: User | None = None) -> dict:
    author = _author_label(user) if user else "Путешественник"
    return {
        "id": row.id,
        "entity_type": row.entity_type,
        "entity_id": row.entity_id,
        "category": row.category or "",
        "rating": row.rating,
        "body": row.body,
        "author": author,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        "is_mine": False,
    }


def _summary_from_rows(rows: list[CatalogReview]) -> dict:
    if not rows:
        return {"average_rating": None, "review_count": 0}
    total = sum(row.rating for row in rows)
    return {
        "average_rating": round(total / len(rows), 1),
        "review_count": len(rows),
    }


def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(optional_bearer)] = None,
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        token_payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = token_payload.get("sub")
        if not user_id:
            return None
    except JWTError:
        return None
    return db.get(User, int(user_id))


@router.get("/{entity_type}/{entity_id}")
def list_reviews(
    entity_type: str,
    entity_id: str,
    category: str = Query(default=""),
    db: Session = Depends(get_db),
    user: Annotated[User | None, Depends(get_current_user_optional)] = None,
) -> dict:
    if entity_type not in ENTITY_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported entity type")

    rows = db.execute(
        select(CatalogReview)
        .where(
            CatalogReview.entity_type == entity_type,
            CatalogReview.entity_id == entity_id,
            CatalogReview.category == category,
        )
        .order_by(CatalogReview.created_at.desc())
    ).scalars().all()

    user_ids = {row.user_id for row in rows}
    users_by_id: dict[int, User] = {}
    if user_ids:
        users = db.execute(select(User).where(User.id.in_(user_ids))).scalars().all()
        users_by_id = {item.id: item for item in users}

    items = []
    user_review = None
    for row in rows:
        author_user = users_by_id.get(row.user_id)
        payload = _serialize_review(row, author_user)
        if user and row.user_id == user.id:
            payload["is_mine"] = True
            user_review = payload
        items.append(payload)

    summary = _summary_from_rows(rows)
    return {
        **summary,
        "items": items,
        "user_review": user_review,
    }


@router.post("")
def upsert_review(
    payload: ReviewCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    category = payload.category or ""
    existing = db.execute(
        select(CatalogReview).where(
            CatalogReview.user_id == user.id,
            CatalogReview.entity_type == payload.entity_type,
            CatalogReview.entity_id == payload.entity_id,
            CatalogReview.category == category,
        )
    ).scalar_one_or_none()

    if existing:
        existing.rating = payload.rating
        existing.body = payload.body.strip()
        row = existing
    else:
        row = CatalogReview(
            user_id=user.id,
            entity_type=payload.entity_type,
            entity_id=payload.entity_id,
            category=category,
            rating=payload.rating,
            body=payload.body.strip(),
        )
        db.add(row)

    db.commit()
    db.refresh(row)

    result = _serialize_review(row, user)
    result["is_mine"] = True
    return result


@router.post("/summary/batch")
def batch_review_summary(payload: ReviewBatchRequest, db: Session = Depends(get_db)) -> dict:
    refs = [
        EntityRef(item.entity_type, item.entity_id, item.category or "")
        for item in payload.items
    ]
    stats = get_batch_review_stats(db, refs)
    summaries: dict[str, dict[str, float | int]] = {}
    for ref in refs:
        key = entity_ref_key(ref.entity_type, ref.entity_id, ref.category)
        summaries[key] = stats.get(key, {"average_rating": 0.0, "review_count": 0})
    return {"summaries": summaries}
