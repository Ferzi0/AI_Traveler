# AI Traveler

Дипломный веб-проект — AI-планировщик путешествий.

## Локальный запуск

Нужен установленный **Docker Desktop**.

```bash
# 1. (необязательно) свои настройки поверх backend/.env.example
cp backend/.env.example backend/.env
#    впишите TRAVELPAYOUTS_API_TOKEN, иначе блоки с рейсами будут пустыми

# 2. запуск всех сервисов
docker compose -f infra/docker-compose.yml up --build
```

| Сервис | URL |
|--------|-----|
| Фронтенд | http://localhost:5173 |
| Backend API | http://localhost:8000/api/v1 |
| Swagger / Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 (postgres / postgres, БД `ai_traveler`) |

Миграции применяются автоматически при старте backend-контейнера.  
Код `backend/app` и `frontend/src` смонтирован в контейнеры — изменения подхватываются без пересборки.

Остановить: `docker compose -f infra/docker-compose.yml down` (добавьте `-v`, чтобы удалить данные БД).

---

## Стек

### Backend
- **FastAPI** — веб-фреймворк
- **SQLAlchemy** + **Alembic** — ORM и миграции
- **PostgreSQL** — основная БД
- **Redis** + **Celery** — очередь задач
- **Pydantic Settings** — управление конфигурацией
- **Travelpayouts / Aviasales API** — цены и предложения на авиабилеты
- **Python 3.12**

### Frontend
- **React 19** + **TypeScript 6**
- **Vite 8** — сборщик
- **Leaflet** — карты

### Инфраструктура
- **Docker Compose** — локальный запуск (frontend, api, PostgreSQL, Redis)

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

### Flights
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/flights/popular` | Популярные направления из города вылета |
| `GET` | `/flights/calendar` | Календарь цен по маршруту |
| `GET` | `/flights/special-offers` | Спецпредложения Aviasales |

### Trips
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/trips` | Список поездок |
| `POST` | `/trips` | Создать поездку |
| `GET` | `/trips/{trip_id}` | Детали поездки |
| `PATCH` | `/trips/{trip_id}/params` | Обновить параметры поездки |
| `GET` | `/trips/destination/search` | Поиск направлений |
| `POST` | `/trips/{trip_id}/destination/select` | Выбрать направление |
| `POST` | `/trips/{trip_id}/destination/reset` | Сбросить направление |
| `POST` | `/trips/{trip_id}/selections/reset` | Сбросить выборы в конструкторе |
| `POST` | `/trips/{trip_id}/detail/reset` | Сбросить детализацию |
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

### Reviews
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/reviews/{entity_type}/{entity_id}` | Отзывы по объекту каталога |
| `POST` | `/reviews` | Оставить отзыв |
| `POST` | `/reviews/summary/batch` | Сводка рейтингов по списку объектов |

### History
| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/history` | История поездок |
| `POST` | `/history` | Сохранить поездку в историю |
| `GET` | `/history/{history_id}` | Детали записи истории |
| `GET` | `/history/{history_id}/pdf` | Скачать PDF-отчёт |
| `DELETE` | `/history/{history_id}` | Удалить запись |

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
│   │   │   │   ├── flights.py
│   │   │   │   ├── history.py
│   │   │   │   ├── reviews.py
│   │   │   │   ├── stats.py
│   │   │   │   └── trips.py
│   │   │   ├── deps.py
│   │   │   └── router.py
│   │   ├── core/
│   │   ├── data/              # каталоги отелей, IATA, направления
│   │   ├── models/
│   │   ├── services/          # Travelpayouts, поиск рейсов, отзывы
│   │   └── main.py
│   ├── alembic/
│   │   └── versions/          # 8 миграций
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── types/
│   │   ├── api.ts
│   │   ├── config.ts
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── infra/
│   └── docker-compose.yml
```

---

## Авторы

Разработчик: **Торгашов Эдуард Ринатович, студент группы П-45С**  
Учебное заведение: МИДиС, специальность 09.02.07 «Информационные системы и программирование», 2026
