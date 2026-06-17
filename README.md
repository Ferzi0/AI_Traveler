# AI Traveler

Дипломный веб-проект — AI-планировщик путешествий.

## Боевые ссылки

| Сервис | URL |
|--------|-----|
| Фронтенд | https://ai-traveler-1.onrender.com |
| Backend API | https://ai-traveler-0jhd.onrender.com |
| Swagger / Docs | https://ai-traveler-0jhd.onrender.com/docs |

> Render переводит сервисы в спящий режим при отсутствии трафика.  
> Первый запрос после простоя может занять 30–60 секунд.

---

## Стек

### Backend
- **FastAPI** — веб-фреймворк
- **SQLAlchemy** + **Alembic** — ORM и миграции
- **PostgreSQL** — основная БД
- **Redis** + **Celery** — очередь задач
- **Pydantic Settings** — управление конфигурацией
- **Python 3.12**

### Frontend
- **React 19** + **TypeScript 6**
- **Vite 8** — сборщик
- **Leaflet** — карты

### Инфраструктура
- **Docker** + **docker-compose** — локальная разработка
- **Render** — хостинг (backend + frontend как отдельные сервисы)

---

## Локальный запуск

### Требования
- Docker Desktop

### Запуск

```bash
cd infra
docker compose up --build
```

Сервисы поднимутся на:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/docs

### Миграции Alembic

Выполнять из папки `backend`:

```bash
alembic upgrade head
```

Создать новую миграцию после изменения моделей:

```bash
alembic revision --autogenerate -m "описание изменений"
```

---

## Переменные окружения

Создай файл `backend/.env` на основе примера ниже.

```env
PROJECT_NAME=AI Traveler API
PROJECT_VERSION=0.1.0
API_V1_PREFIX=/api/v1

# База данных
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ai_traveler

# JWT
JWT_SECRET_KEY=change_me_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Авто-создание таблиц (только для разработки)
AUTO_CREATE_TABLES=false
```

> На продакшне (Render) переменные задаются через Environment в дашборде сервиса.  
> `JWT_SECRET_KEY` обязательно замени на случайную строку.

### Render (продакшн)

| Сервис | Dockerfile | Ключевые ENV |
|--------|------------|--------------|
| Backend | `backend/Dockerfile.prod` | `CORS_ORIGINS`, `POSTGRES_*`, `JWT_SECRET_KEY`, `TRAVELPAYOUTS_*` |
| Frontend | `frontend/Dockerfile.prod` | `VITE_API_BASE`, `VITE_FRONTEND_URL` |

**Важно:** на Render фронтенд должен ходить в API по публичному URL, а не на `localhost`.  
`frontend/src/config.ts` определяет API по hostname страницы; для явной настройки задай `VITE_API_BASE` при сборке.

На бэкенде в `CORS_ORIGINS` укажи URL фронта без слэша в конце, например:  
`https://ai-traveler-1.onrender.com`

Первый запрос после сна сервиса может занять до минуты — фронт автоматически повторяет запросы при 502/503.

---

## API эндпоинты

Базовый префикс: `/api/v1`

### System
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/health` | Проверка работоспособности |

### Auth
| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/auth/register` | Регистрация |
| `POST` | `/auth/login` | Вход, возвращает JWT |
| `GET` | `/auth/me` | Профиль текущего пользователя |
| `PATCH` | `/auth/me` | Обновить профиль |

### Trips
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/trips` | Список поездок |
| `POST` | `/trips` | Создать поездку |
| `GET` | `/trips/{trip_id}` | Детали поездки |
| `PATCH` | `/trips/{trip_id}/params` | Обновить параметры поездки |
| `GET` | `/trips/destination/search` | Поиск направлений |
| `POST` | `/trips/{trip_id}/destination/select` | Выбрать направление |
| `GET` | `/trips/{trip_id}/tree` | Дерево поездки |
| `POST` | `/trips/{trip_id}/nodes` | Создать узел дерева |
| `POST` | `/trips/{trip_id}/edges` | Создать связь в дереве |
| `POST` | `/trips/{trip_id}/accommodations/search` | Поиск отелей |
| `POST` | `/trips/{trip_id}/accommodations/select` | Выбрать отель |
| `POST` | `/trips/{trip_id}/accommodations/rooms` | Список номеров |
| `POST` | `/trips/{trip_id}/accommodations/select-room` | Выбрать номер |
| `GET` | `/trips/{trip_id}/accommodations/{accommodation_id}/extras` | Допуслуги отеля |
| `POST` | `/trips/{trip_id}/accommodations/{accommodation_id}/extras/select` | Выбрать допуслугу отеля |
| `POST` | `/trips/{trip_id}/transport/search` | Поиск рейсов |
| `GET` | `/trips/{trip_id}/transport/itineraries/{itinerary_id}` | Детали маршрута |
| `POST` | `/trips/{trip_id}/transport/select` | Выбрать рейс |
| `GET` | `/trips/{trip_id}/transport/{itinerary_id}/extras` | Допуслуги рейса |
| `POST` | `/trips/{trip_id}/transport/{itinerary_id}/extras/select` | Выбрать допуслугу рейса |
| `GET` | `/trips/{trip_id}/city-transport/options` | Варианты транспорта по городу |
| `POST` | `/trips/{trip_id}/city-transport/select` | Выбрать транспорт по городу |
| `GET` | `/trips/{trip_id}/day-plan/options` | Варианты дневной программы |
| `POST` | `/trips/{trip_id}/day-plan/select` | Выбрать пункт дневной программы |
| `GET` | `/trips/{trip_id}/summary` | Итоговая стоимость поездки |

### Favorites
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/favorites` | Список избранного |
| `POST` | `/favorites` | Добавить в избранное |
| `DELETE` | `/favorites/{favorite_id}` | Удалить из избранного |

### History
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/history` | История поездок |
| `POST` | `/history` | Сохранить поездку в историю |
| `GET` | `/history/{history_id}` | Детали записи истории |
| `GET` | `/history/{history_id}/pdf` | Скачать PDF-отчёт |

### Stats
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/stats` | Счётчики пользователей и маршрутов |

---

## Структура репозитория

```
AI_Traveler/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── favorites.py
│   │   │   │   ├── history.py
│   │   │   │   ├── stats.py
│   │   │   │   └── trips.py
│   │   │   ├── deps.py
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── constructor_catalog.py
│   │   │   ├── favorite.py
│   │   │   ├── route_point.py
│   │   │   ├── trip.py
│   │   │   ├── trip_edge.py
│   │   │   ├── trip_history.py
│   │   │   ├── trip_node.py
│   │   │   └── user.py
│   │   └── main.py
│   ├── alembic/
│   │   └── versions/        # 7 миграций (initial → user_default_origin)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React-компоненты
│   │   ├── types/           # TypeScript-типы
│   │   ├── api.ts           # HTTP-клиент
│   │   └── App.tsx          # Корневой компонент
│   └── package.json
└── infra/
    └── docker-compose.yml
```

---

## Авторы

Разработчик: **Торгашов Эдуард Ринатович, студент группы П-45С**  
Учебное заведение: МИДиС, специальность 09.02.07 «Информационные системы и программирование», 2026