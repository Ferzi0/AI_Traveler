from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.validation_errors import format_validation_errors


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"detail": format_validation_errors(exc.errors())},
    )


@app.middleware("http")
async def proxy_headers_middleware(request, call_next):
    if request.headers.get("x-forwarded-proto") == "https":
        request.scope["scheme"] = "https"
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup() -> None:
    if settings.AUTO_CREATE_TABLES:
        from app.models import (
            catalog_review,
            constructor_catalog,
            favorite,
            route_point,
            trip,
            trip_edge,
            trip_history,
            trip_node,
            user,
        )

        Base.metadata.create_all(bind=engine)


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
