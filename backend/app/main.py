from fastapi import FastAPI, Request 
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
)

class ProxyHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.headers.get("x-forwarded-proto") == "https":
            request.scope["scheme"] = "https"
        return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-traveler-1.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ProxyHeadersMiddleware)

@app.on_event("startup")
def on_startup() -> None:
    if settings.AUTO_CREATE_TABLES:
        # Импортируем модели перед create_all, чтобы SQLAlchemy увидел все таблицы.
        from app.models import (
            constructor_catalog,
            favorite,
            route_point,
            trip,
            trip_edge,
            trip_history,
            trip_node,
            user,
        )  # noqa: F401

        # Полезно для локальной разработки до перехода на миграции Alembic.
        Base.metadata.create_all(bind=engine)


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
