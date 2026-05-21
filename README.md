# AI Traveler

MVP-скелет дипломного веб-приложения.

## Стек (текущий скелет)

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Alembic, Redis, Celery
- Инфраструктура: Docker, docker-compose

## Запуск

1. Открой терминал в папке `infra`.
2. Запусти сервисы:

```bash
docker compose up --build
```

3. Открой документацию API:

- [http://localhost:8000/docs](http://localhost:8000/docs)

## Миграции Alembic

Выполнять из папки `backend`:

```bash
alembic upgrade head
```

Создать новую миграцию после изменения моделей:

```bash
alembic revision -m "ваше сообщение"
```

## Доступные endpoint-заглушки

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET/POST /api/v1/trips`
- `GET /api/v1/trips/{trip_id}`
- `GET/POST/DELETE /api/v1/favorites`
- `GET /api/v1/history`
- `GET /api/v1/health`
