import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.favorite import Favorite
from app.models.user import User

router = APIRouter()


class FavoriteCreateRequest(BaseModel):
    item_type: str = Field(pattern="^(city|hotel)$")
    item_key: str = Field(min_length=1, max_length=128)
    title: str = Field(min_length=1, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=128)
    description: str | None = None
    image_urls: list[str] = Field(default_factory=list)


def _serialize_favorite(row: Favorite) -> dict:
    images: list[str] = []
    if row.image_urls:
        try:
            parsed = json.loads(row.image_urls)
            if isinstance(parsed, list):
                images = [str(url) for url in parsed]
        except json.JSONDecodeError:
            images = []
    return {
        "id": row.id,
        "item_type": row.item_type,
        "item_key": row.item_key,
        "title": row.title,
        "subtitle": row.subtitle,
        "country": row.country,
        "description": row.description
        or _default_description(row.item_type, row.title, row.country),
        "image_urls": images,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def _default_description(item_type: str, title: str, country: str | None) -> str:
    if item_type == "city":
        parts = [f"Направление: {title}"]
        if country:
            parts.append(f"Страна: {country}")
        return ". ".join(parts) + "."
    return f"Отель {title}. Удобное размещение в выбранном направлении."


@router.get("")
def list_favorites(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    rows = db.execute(
        select(Favorite)
        .where(Favorite.user_id == user.id)
        .order_by(Favorite.created_at.desc())
    ).scalars()
    return {"items": [_serialize_favorite(row) for row in rows]}


@router.post("")
def add_favorite(
    payload: FavoriteCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    existing = db.execute(
        select(Favorite).where(
            Favorite.user_id == user.id,
            Favorite.item_type == payload.item_type,
            Favorite.item_key == payload.item_key,
        )
    ).scalar_one_or_none()
    if existing:
        return _serialize_favorite(existing)

    row = Favorite(
        user_id=user.id,
        place_name=payload.title,
        item_type=payload.item_type,
        item_key=payload.item_key,
        title=payload.title,
        subtitle=payload.subtitle,
        country=payload.country,
        description=payload.description
        or _default_description(payload.item_type, payload.title, payload.country),
        image_urls=json.dumps(payload.image_urls, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _serialize_favorite(row)


@router.delete("/{favorite_id}")
def remove_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    row = db.get(Favorite, favorite_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")
    db.delete(row)
    db.commit()
    return {"status": "ok"}
