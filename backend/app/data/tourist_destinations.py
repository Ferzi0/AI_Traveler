"""Справочник туристических направлений (синхрон с frontend touristDestinations.ts)."""

from __future__ import annotations

TOURIST_DESTINATIONS: list[dict[str, str]] = [
    {"title": "Пхукет", "country": "Таиланд"},
    {"title": "Бангкок", "country": "Таиланд"},
    {"title": "Паттайя", "country": "Таиланд"},
    {"title": "Краби", "country": "Таиланд"},
    {"title": "Лондон", "country": "Великобритания"},
    {"title": "Эдинбург", "country": "Великобритания"},
    {"title": "Манчестер", "country": "Великобритания"},
    {"title": "Стамбул", "country": "Турция"},
    {"title": "Анталья", "country": "Турция"},
    {"title": "Измир", "country": "Турция"},
    {"title": "Париж", "country": "Франция"},
    {"title": "Ницца", "country": "Франция"},
    {"title": "Лион", "country": "Франция"},
    {"title": "Марсель", "country": "Франция"},
    {"title": "Рим", "country": "Италия"},
    {"title": "Милан", "country": "Италия"},
    {"title": "Венеция", "country": "Италия"},
    {"title": "Флоренция", "country": "Италия"},
    {"title": "Неаполь", "country": "Италия"},
    {"title": "Барселона", "country": "Испания"},
    {"title": "Мадрид", "country": "Испания"},
    {"title": "Севилья", "country": "Испания"},
    {"title": "Валенсия", "country": "Испания"},
    {"title": "Берлин", "country": "Германия"},
    {"title": "Мюнхен", "country": "Германия"},
    {"title": "Гамбург", "country": "Германия"},
    {"title": "Франкфурт", "country": "Германия"},
    {"title": "Амстердам", "country": "Нидерланды"},
    {"title": "Прага", "country": "Чехия"},
    {"title": "Вена", "country": "Австрия"},
    {"title": "Зальцбург", "country": "Австрия"},
    {"title": "Цюрих", "country": "Швейцария"},
    {"title": "Женева", "country": "Швейцария"},
    {"title": "Лиссабон", "country": "Португалия"},
    {"title": "Порту", "country": "Португалия"},
    {"title": "Афины", "country": "Греция"},
    {"title": "Санторини", "country": "Греция"},
    {"title": "Дубай", "country": "ОАЭ"},
    {"title": "Абу-Даби", "country": "ОАЭ"},
    {"title": "Доха", "country": "Катар"},
    {"title": "Тель-Авив", "country": "Израиль"},
    {"title": "Иерусалим", "country": "Израиль"},
    {"title": "Токио", "country": "Япония"},
    {"title": "Киото", "country": "Япония"},
    {"title": "Осака", "country": "Япония"},
    {"title": "Сеул", "country": "Южная Корея"},
    {"title": "Пекин", "country": "Китай"},
    {"title": "Шанхай", "country": "Китай"},
    {"title": "Гонконг", "country": "Китай"},
    {"title": "Сингапур", "country": "Сингапур"},
    {"title": "Куала-Лумпур", "country": "Малайзия"},
    {"title": "Бали", "country": "Индонезия"},
    {"title": "Джакарта", "country": "Индонезия"},
    {"title": "Ханой", "country": "Вьетнам"},
    {"title": "Хошимин", "country": "Вьетнам"},
    {"title": "Нью-Дели", "country": "Индия"},
    {"title": "Мумбаи", "country": "Индия"},
    {"title": "Гоа", "country": "Индия"},
    {"title": "Каир", "country": "Египет"},
    {"title": "Хургада", "country": "Египет"},
    {"title": "Шарм-эль-Шейх", "country": "Египет"},
    {"title": "Марракеш", "country": "Марокко"},
    {"title": "Кейптаун", "country": "ЮАР"},
    {"title": "Нью-Йорк", "country": "США"},
    {"title": "Лос-Анджелес", "country": "США"},
    {"title": "Сан-Франциско", "country": "США"},
    {"title": "Лас-Вегас", "country": "США"},
    {"title": "Майами", "country": "США"},
    {"title": "Орландо", "country": "США"},
    {"title": "Чикаго", "country": "США"},
    {"title": "Вашингтон", "country": "США"},
    {"title": "Бостон", "country": "США"},
    {"title": "Сиэтл", "country": "США"},
    {"title": "Гонолулу", "country": "США"},
    {"title": "Торонто", "country": "Канада"},
    {"title": "Ванкувер", "country": "Канада"},
    {"title": "Монреаль", "country": "Канада"},
    {"title": "Мехико", "country": "Мексика"},
    {"title": "Канкун", "country": "Мексика"},
    {"title": "Рио-де-Жанейро", "country": "Бразилия"},
    {"title": "Сан-Паулу", "country": "Бразилия"},
    {"title": "Буэнос-Айрес", "country": "Аргентина"},
    {"title": "Сантьяго", "country": "Чили"},
    {"title": "Лима", "country": "Перу"},
    {"title": "Сидней", "country": "Австралия"},
    {"title": "Мельбурн", "country": "Австралия"},
    {"title": "Окленд", "country": "Новая Зеландия"},
    {"title": "Рейкьявик", "country": "Исландия"},
    {"title": "Осло", "country": "Норвегия"},
    {"title": "Стокгольм", "country": "Швеция"},
    {"title": "Копенгаген", "country": "Дания"},
    {"title": "Хельсинки", "country": "Финляндия"},
    {"title": "Дублин", "country": "Ирландия"},
    {"title": "Брюссель", "country": "Бельгия"},
    {"title": "Будапешт", "country": "Венгрия"},
    {"title": "Варшава", "country": "Польша"},
    {"title": "Краков", "country": "Польша"},
    {"title": "Бухарест", "country": "Румыния"},
    {"title": "София", "country": "Болгария"},
    {"title": "Загреб", "country": "Хорватия"},
    {"title": "Дубровник", "country": "Хорватия"},
    {"title": "Белград", "country": "Сербия"},
    {"title": "Тбилиси", "country": "Грузия"},
    {"title": "Баку", "country": "Азербайджан"},
    {"title": "Ереван", "country": "Армения"},
    {"title": "Алматы", "country": "Казахстан"},
    {"title": "Астана", "country": "Казахстан"},
    {"title": "Ташкент", "country": "Узбекистан"},
    {"title": "Сочи", "country": "Россия"},
    {"title": "Казань", "country": "Россия"},
    {"title": "Санкт-Петербург", "country": "Россия"},
    {"title": "Калининград", "country": "Россия"},
    {"title": "Мальдивы", "country": "Мальдивы"},
    {"title": "Маврикий", "country": "Маврикий"},
    {"title": "Сейшелы", "country": "Сейшелы"},
]

_BY_TITLE: dict[str, dict[str, str]] = {
    row["title"].casefold(): row for row in TOURIST_DESTINATIONS
}


def find_tourist_destination(title: str) -> dict[str, str] | None:
    return _BY_TITLE.get(title.strip().casefold())


def search_tourist_destinations(query: str, limit: int = 80) -> list[dict[str, str]]:
    needle = query.strip().casefold()
    if not needle:
        return TOURIST_DESTINATIONS[:limit]

    starts: list[dict[str, str]] = []
    contains: list[dict[str, str]] = []
    for row in TOURIST_DESTINATIONS:
        title = row["title"].casefold()
        country = row["country"].casefold()
        hay = f"{title} {country}"
        if title.startswith(needle) or hay.startswith(needle):
            starts.append(row)
        elif needle in hay:
            contains.append(row)
    return (starts + contains)[:limit]


def destination_slug(title: str) -> str:
    digest = __import__("hashlib").md5(title.encode(), usedforsecurity=False).hexdigest()[:10]
    return digest
