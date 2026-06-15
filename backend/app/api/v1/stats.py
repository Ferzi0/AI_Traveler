from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.trip_history import TripHistory
from app.models.user import User

router = APIRouter()


@router.get("")
def platform_stats(db: Session = Depends(get_db)) -> dict[str, int]:
    users_count = db.scalar(select(func.count()).select_from(User)) or 0
    trips_count = db.scalar(select(func.count()).select_from(TripHistory)) or 0
    return {
        "users_count": users_count,
        "trips_count": trips_count,
    }
