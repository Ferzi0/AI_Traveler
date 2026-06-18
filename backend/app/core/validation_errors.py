from __future__ import annotations

from typing import Any

FIELD_LABELS: dict[str, str] = {
    "login": "Логин",
    "password": "Пароль",
    "email": "Email",
    "phone": "Телефон",
    "last_name": "Фамилия",
    "first_name": "Имя",
    "middle_name": "Отчество",
    "default_origin": "Город вылета",
    "title": "Название",
    "node_type": "Тип узла",
    "destination_title": "Направление",
    "item_id": "Элемент",
    "accommodation_id": "Размещение",
    "room_id": "Номер",
    "itinerary_id": "Маршрут",
    "category": "Категория",
    "day_key": "День",
    "slot": "Слот",
    "entity_id": "Объект",
    "entity_type": "Тип объекта",
    "item_key": "Ключ",
    "origin": "Город вылета",
    "destination": "Направление",
    "depart_month": "Месяц вылета",
    "return_month": "Месяц возврата",
    "trip_length": "Длительность поездки",
    "limit": "Лимит",
    "rating": "Оценка",
    "text": "Текст",
    "start_date": "Дата начала",
    "end_date": "Дата окончания",
    "passengers": "Пассажиры",
    "round_trip": "Обратный билет",
    "price_from": "Цена от",
    "price_to": "Цена до",
}


def _field_label(loc: tuple[Any, ...] | list[Any]) -> str:
    for part in reversed(loc):
        if isinstance(part, str) and not part.isdigit():
            return FIELD_LABELS.get(part, part.replace("_", " "))
    return "Поле"


def _strip_value_error_prefix(message: str) -> str:
    prefixes = ("Value error, ", "Assertion failed, ")
    for prefix in prefixes:
        if message.startswith(prefix):
            return message[len(prefix) :]
    return message


def translate_validation_error(error: dict[str, Any]) -> str:
    loc = error.get("loc") or ()
    label = _field_label(tuple(loc))
    error_type = str(error.get("type") or "")
    ctx = error.get("ctx") or {}
    raw_msg = str(error.get("msg") or "")

    if error_type == "missing":
        return f"«{label}»: обязательное поле"

    if error_type == "string_too_short":
        min_length = ctx.get("min_length", "?")
        return f"«{label}»: минимум {min_length} символов"

    if error_type == "string_too_long":
        max_length = ctx.get("max_length", "?")
        return f"«{label}»: максимум {max_length} символов"

    if error_type == "string_pattern_mismatch":
        if label == "Логин":
            return "«Логин»: только латиница, цифры, точка, дефис и подчёркивание"
        if label in {"Месяц вылета", "Месяц возврата"}:
            return f"«{label}»: формат ГГГГ-ММ"
        return f"«{label}»: неверный формат"

    if error_type in {"greater_than_equal", "ge"}:
        bound = ctx.get("ge", "?")
        return f"«{label}»: значение не меньше {bound}"

    if error_type in {"less_than_equal", "le"}:
        bound = ctx.get("le", "?")
        return f"«{label}»: значение не больше {bound}"

    if error_type in {"int_parsing", "float_parsing"}:
        return f"«{label}»: должно быть числом"

    if error_type == "bool_parsing":
        return f"«{label}»: должно быть true или false"

    if error_type in {"value_error", "assertion_error"} or error_type.startswith("value_error"):
        cleaned = _strip_value_error_prefix(raw_msg)
        if cleaned and cleaned != raw_msg:
            return cleaned
        if label == "Email":
            return "«Email»: неверный адрес"
        return f"«{label}»: {cleaned or 'некорректное значение'}"

    if "email" in error_type:
        return "«Email»: неверный адрес"

    return f"«{label}»: {raw_msg}" if raw_msg else f"«{label}»: некорректное значение"


def format_validation_errors(errors: list[dict[str, Any]]) -> list[dict[str, str]]:
    formatted: list[dict[str, str]] = []
    for error in errors:
        formatted.append({"msg": translate_validation_error(error)})
    return formatted
