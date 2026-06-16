from __future__ import annotations

import gzip
import json
import logging
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from app.core.config import settings
from app.data.iata_catalog import enrich_place_names

logger = logging.getLogger(__name__)

BASE_URL = "https://api.travelpayouts.com"
CACHE_TTL_SEC = 3600

_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}


def _http_get_json(url: str, token: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={
            "Accept-Encoding": "gzip, deflate",
            "X-Access-Token": token,
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            raw = response.read()
            encoding = response.info().get("Content-Encoding", "")
            if encoding == "gzip":
                raw = gzip.decompress(raw)
            payload = json.loads(raw.decode("utf-8"))
            if not isinstance(payload, dict):
                raise ValueError("Unexpected Travelpayouts response shape")
            return payload
    except urllib.error.HTTPError as exc:
        raw = exc.read()
        try:
            if exc.headers.get("Content-Encoding") == "gzip":
                raw = gzip.decompress(raw)
            parsed = json.loads(raw.decode("utf-8"))
            msg = parsed.get("error") or parsed.get("message") or str(parsed)
        except Exception:
            msg = exc.reason or f"HTTP {exc.code}"
        if exc.code == 400:
            raise ValueError(
                "Aviasales отклонил запрос по этим датам или направлению. "
                "Сократите поездку или измените даты вылета и возврата."
            ) from exc
        raise RuntimeError(f"Travelpayouts HTTP {exc.code}: {msg}") from exc


def _normalize_row(row: dict[str, Any], default_origin: str) -> dict[str, Any] | None:
    destination = row.get("destination") or row.get("destination_code") or row.get("destination_airport")
    price_raw = row.get("price", row.get("value"))
    if not destination or price_raw is None:
        return None

    item: dict[str, Any] = {
        "origin": row.get("origin") or default_origin,
        "destination": str(destination).upper(),
        "origin_airport": row.get("origin_airport"),
        "destination_airport": row.get("destination_airport"),
        "origin_name": row.get("origin_name"),
        "destination_name": row.get("destination_name"),
        "price": price_raw,
        "airline": row.get("airline"),
        "flight_number": row.get("flight_number"),
        "departure_at": row.get("departure_at"),
        "return_at": row.get("return_at"),
        "transfers": row.get("transfers", row.get("number_of_changes")),
        "return_transfers": row.get("return_transfers"),
        "duration": row.get("duration"),
        "duration_to": row.get("duration_to"),
        "duration_back": row.get("duration_back"),
        "link": row.get("link"),
        "expires_at": row.get("expires_at"),
    }
    return item


def fetch_prices_for_route(
    origin_iata: str,
    destination_iata: str,
    departure_at: str,
    return_at: str | None,
    one_way: bool,
    max_results: int = 90,
) -> list[dict[str, Any]]:
    token = settings.TRAVELPAYOUTS_API_TOKEN.strip()
    if not token:
        raise RuntimeError("TRAVELPAYOUTS_API_TOKEN is not configured")

    per_page = 30
    pages = max(1, min(3, (max_results + per_page - 1) // per_page))
    all_rows: list[dict[str, Any]] = []

    for page in range(1, pages + 1):
        params: dict[str, str] = {
            "origin": origin_iata.upper(),
            "destination": destination_iata.upper(),
            "departure_at": departure_at,
            "sorting": "price",
            "direct": "false",
            "unique": "false",
            "one_way": "true" if one_way else "false",
            "currency": settings.TRAVELPAYOUTS_CURRENCY,
            "market": settings.TRAVELPAYOUTS_MARKET,
            "limit": str(per_page),
            "page": str(page),
            "token": token,
        }
        if return_at and not one_way:
            params["return_at"] = return_at

        url = f"{BASE_URL}/aviasales/v3/prices_for_dates?{urllib.parse.urlencode(params)}"
        payload = _http_get_json(url, token)
        if not payload.get("success"):
            raise RuntimeError(str(payload.get("error") or "Travelpayouts prices_for_dates failed"))

        rows = payload.get("data") or []
        if isinstance(rows, dict):
            rows = list(rows.values())
        if not rows:
            break
        for row in rows:
            if isinstance(row, dict):
                normalized = _normalize_row(row, origin_iata.upper())
                if normalized:
                    all_rows.append(normalized)

    return _dedupe_items(all_rows, max_results)


def _dedupe_items(items: list[dict[str, Any]], limit: int) -> list[dict[str, Any]]:
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for item in items:
        key = "|".join(
            str(item.get(field, ""))
            for field in (
                "origin",
                "destination",
                "departure_at",
                "return_at",
                "airline",
                "flight_number",
                "price",
            )
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
        if len(unique) >= limit:
            break
    return unique


def _fetch_v3_popular(origin_iata: str, limit: int, token: str) -> list[dict[str, Any]]:
    params = {
        "origin": origin_iata,
        "sorting": "route",
        "unique": "true",
        "currency": settings.TRAVELPAYOUTS_CURRENCY,
        "market": settings.TRAVELPAYOUTS_MARKET,
        "limit": str(min(max(limit * 2, limit), 30)),
        "page": "1",
        "token": token,
    }
    url = f"{BASE_URL}/aviasales/v3/prices_for_dates?{urllib.parse.urlencode(params)}"
    payload = _http_get_json(url, token)
    if not payload.get("success"):
        raise RuntimeError(str(payload.get("error") or "Travelpayouts v3 request failed"))

    rows = payload.get("data") or []
    if isinstance(rows, dict):
        rows = list(rows.values())

    items: list[dict[str, Any]] = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        normalized = _normalize_row(row, origin_iata)
        if normalized:
            items.append(enrich_place_names(normalized))
    return _dedupe_items(items, limit)


def _fetch_city_directions(origin_iata: str, limit: int, token: str) -> list[dict[str, Any]]:
    params = {
        "origin": origin_iata,
        "currency": settings.TRAVELPAYOUTS_CURRENCY,
        "market": settings.TRAVELPAYOUTS_MARKET,
        "limit": str(min(max(limit * 2, limit), 30)),
        "page": "1",
        "token": token,
    }
    url = f"{BASE_URL}/v1/city-directions?{urllib.parse.urlencode(params)}"
    payload = _http_get_json(url, token)
    if not payload.get("success"):
        raise RuntimeError(str(payload.get("error") or "Travelpayouts city-directions failed"))

    data = payload.get("data") or {}
    items: list[dict[str, Any]] = []
    if isinstance(data, dict):
        for row in data.values():
            if isinstance(row, dict):
                normalized = _normalize_row(row, origin_iata)
                if normalized:
                    items.append(enrich_place_names(normalized))
    return _dedupe_items(items, limit)


def _cache_get(key: str) -> list[dict[str, Any]] | None:
    entry = _cache.get(key)
    if not entry:
        return None
    expires_at, items = entry
    if time.time() >= expires_at:
        _cache.pop(key, None)
        return None
    return items


def _cache_set(key: str, items: list[dict[str, Any]]) -> None:
    _cache[key] = (time.time() + CACHE_TTL_SEC, items)


def get_popular_destinations(origin_iata: str, limit: int = 6) -> dict[str, Any]:
    token = settings.TRAVELPAYOUTS_API_TOKEN.strip()
    if not token:
        raise RuntimeError("TRAVELPAYOUTS_API_TOKEN is not configured")

    origin = origin_iata.strip().upper()
    cache_key = f"popular:{origin}:{limit}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return {
            "origin": origin,
            "currency": settings.TRAVELPAYOUTS_CURRENCY,
            "items": cached,
        }

    items = _fetch_v3_popular(origin, limit, token)
    if not items:
        items = _fetch_city_directions(origin, limit, token)
    if not items:
        raise RuntimeError("Travelpayouts returned no popular directions")

    _cache_set(cache_key, items)
    return {
        "origin": origin,
        "currency": settings.TRAVELPAYOUTS_CURRENCY,
        "items": items,
    }
