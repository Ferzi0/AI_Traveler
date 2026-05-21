#!/bin/sh

# Применяем миграции при каждом старте контейнера — схема БД не отстаёт от кода.
alembic upgrade head || exit 1

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
