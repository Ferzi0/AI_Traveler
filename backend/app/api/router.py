from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.favorites import router as favorites_router
from app.api.v1.flights import router as flights_router
from app.api.v1.history import router as history_router
from app.api.v1.stats import router as stats_router
from app.api.v1.trips import router as trips_router

api_router = APIRouter()


@api_router.get("/health", tags=["system"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(trips_router, prefix="/trips", tags=["trips"])
api_router.include_router(favorites_router, prefix="/favorites", tags=["favorites"])
api_router.include_router(history_router, prefix="/history", tags=["history"])
api_router.include_router(stats_router, prefix="/stats", tags=["stats"])
api_router.include_router(flights_router, prefix="/flights", tags=["flights"])
