from __future__ import annotations

from typing import Any

from app.data.curated_hotels import CURATED_DESTINATION_TITLES

CURATED_TITLES = CURATED_DESTINATION_TITLES


def _item(item_id: str, title: str, description: str, cost: float) -> dict[str, Any]:
    return {"id": item_id, "title": title, "description": description, "estimated_cost": cost}


CURATED_PROFILES: dict[str, dict[str, Any]] = {
    "Пхукет": {
        "hotel_extras": {
            "restaurants": [
                _item(
                    "phuket_rest_baanrimpa",
                    "Baan Rim Pa Pa Klok",
                    "Thai fine dining · рейтинг 4.6 · baanrimpa.com · 1.8 км",
                    3200,
                ),
                _item(
                    "phuket_rest_silversands",
                    "The Slate · Coq Blanc",
                    "Пляж Nai Yang · рейтинг 4.5 · 3.2 км",
                    2800,
                ),
                _item(
                    "phuket_rest_nahmyah",
                    "Nahmyah Thai Cuisine",
                    "JW Marriott Phuket · рейтинг 4.7 · 2.5 км",
                    3500,
                ),
            ],
            "attractions": [
                _item(
                    "phuket_attr_bigbuddha",
                    "Big Buddha Phuket",
                    "Официальный комплекс · bigbuddhaphuket.com · вход бесплатно",
                    0,
                ),
                _item(
                    "phuket_attr_phiphi",
                    "Phi Phi Islands · официальный тур",
                    "Нац. парк Mu Ko Phi Phi · лодочный тур · 8–9 ч",
                    4500,
                ),
                _item(
                    "phuket_attr_oldtown",
                    "Phuket Old Town Heritage Walk",
                    "Sino-Portuguese architecture · Tourism Authority of Thailand",
                    800,
                ),
            ],
            "events": [
                _item(
                    "phuket_event_siam",
                    "Siam Niramit Phuket",
                    "Культурное шоу · siamniramitphuket.com · 20:30",
                    2800,
                ),
                _item(
                    "phuket_event_carnival",
                    "Phuket Carnival / Patong Beach Festival",
                    "Сезонные мероприятия · patong.go.th",
                    0,
                ),
            ],
            "walking_routes": [
                _item(
                    "phuket_walk_promthep",
                    "Promthep Cape Sunset Route",
                    "2.4 км · лучшая точка заката на острове",
                    0,
                ),
                _item(
                    "phuket_walk_karon",
                    "Karon — Kata Coastal Path",
                    "5.8 км · пляжи Karon и Kata Noi",
                    0,
                ),
            ],
        },
        "city_transport": {
            "public_transport": [
                _item(
                    "phuket_public_smartbus",
                    "Phuket Smart Bus",
                    "Маршрут аэропорт — пляжи · phuket.smartbus.co · 180 ₽/поездка",
                    900,
                ),
            ],
            "taxi": [
                _item(
                    "phuket_taxi_grab",
                    "Grab / InDrive Phuket",
                    "Официальные приложения · 400–1500 ₽ по городу",
                    1800,
                ),
            ],
            "rent": [
                _item(
                    "phuket_rent_bike",
                    "Аренда скутера (локальные прокаты)",
                    "От 800 ₽/день · международные права кат. A",
                    3200,
                ),
            ],
            "ferry": [
                _item(
                    "phuket_ferry_rassada",
                    "Rassada Pier — Phi Phi Ferry",
                    "Официальные операторы · phi-phi.com · 2–3 ч",
                    2400,
                ),
            ],
        },
    },
    "Сочи": {
        "hotel_extras": {
            "restaurants": [
                _item(
                    "sochi_rest_grand",
                    "Grand Hotel Rodina · ресторан",
                    "5★ · grandhotelrodina.ru · 0.5 км",
                    4200,
                ),
                _item(
                    "sochi_rest_gosti",
                    "Gosti",
                    "Современная кухня · рейтинг 4.5 · 1.1 км",
                    2600,
                ),
            ],
            "attractions": [
                _item(
                    "sochi_attr_riviera",
                    "Парк «Ривьера»",
                    "Городской парк · rivierasochi.ru · вход от 300 ₽",
                    600,
                ),
                _item(
                    "sochi_attr_krasnaya",
                    "Красная Поляна · Rosa Khutor",
                    "Горнолыжный курорт · rosa.ru · канатная дорога",
                    3500,
                ),
                _item(
                    "sochi_attr_olympic",
                    "Олимпийский парк Сочи",
                    "Стадион «Фишт», «Сочи Парк» · olympic-park.ru",
                    1200,
                ),
            ],
            "events": [
                _item(
                    "sochi_event_formula",
                    "Sochi Autodrom · Formula 1 / events",
                    "sochiautodrom.ru · календарь гонок и концертов",
                    5500,
                ),
            ],
            "walking_routes": [
                _item(
                    "sochi_walk_agura",
                    "Тропа к водопадам Агura",
                    "5.2 км · Agura Waterfalls · 2–3 ч",
                    0,
                ),
                _item(
                    "sochi_walk_matsesta",
                    "Мацеста — Kurortny Prospekt",
                    "4.1 км · набережная и сероводородные источники",
                    0,
                ),
            ],
        },
        "city_transport": {
            "public_transport": [
                _item(
                    "sochi_public_card",
                    "Единый проездной Сочи",
                    "Автобусы и электрички · sochi.ru · 65 ₽/поездка",
                    780,
                ),
            ],
            "taxi": [
                _item(
                    "sochi_taxi_yandex",
                    "Яндекс Go / Ситимобил Сочи",
                    "Официальные сервисы · 300–1200 ₽",
                    1600,
                ),
            ],
            "rent": [
                _item(
                    "sochi_rent_car",
                    "Прокат авто (Rentmotors / Localrent)",
                    "От 2200 ₽/день · Красная Поляна и центр",
                    6600,
                ),
            ],
            "ferry": [
                _item(
                    "sochi_ferry_gelend",
                    "Морская прогулка Сочи — Геленджик",
                    "Сезонные рейсы · morport.com.ru",
                    1800,
                ),
            ],
        },
    },
    "Дубай": {
        "hotel_extras": {
            "restaurants": [
                _item(
                    "dubai_rest_atmosphere",
                    "At.mosphere · Burj Khalifa",
                    "122 этаж · atmosphereburjkhalifa.com · 0.3 км",
                    8500,
                ),
                _item(
                    "dubai_rest_alfaham",
                    "Al Ustad Special Kabab",
                    "Классика Дубая · рейтинг 4.6 · 2.1 км",
                    1800,
                ),
                _item(
                    "dubai_rest_pierchic",
                    "Pierchic",
                    "Al Qasr · рейтинг 4.7 · 4.5 км",
                    7200,
                ),
            ],
            "attractions": [
                _item(
                    "dubai_attr_burj",
                    "At The Top · Burj Khalifa",
                    "Официальный билет · burjkhalifa.ae · 124/148 этаж",
                    6200,
                ),
                _item(
                    "dubai_attr_museum",
                    "Museum of the Future",
                    "museumofthefuture.ae · билет онлайн",
                    4800,
                ),
                _item(
                    "dubai_attr_desert",
                    "Arabian Adventures · Desert Safari",
                    "Официальный тур · arabian-adventures.com",
                    5500,
                ),
            ],
            "events": [
                _item(
                    "dubai_event_dubaiopera",
                    "Dubai Opera",
                    "dubaiopera.com · афиша концертов и шоу",
                    4200,
                ),
            ],
            "walking_routes": [
                _item(
                    "dubai_walk_marina",
                    "Dubai Marina Walk",
                    "7 км · набережная · Dubai Tourism",
                    0,
                ),
                _item(
                    "dubai_walk_old",
                    "Al Fahidi Historical Neighbourhood",
                    "3.5 км · heritage district · dubaiculture.gov.ae",
                    0,
                ),
            ],
        },
        "city_transport": {
            "public_transport": [
                _item(
                    "dubai_public_nol",
                    "Nol Card · RTA Dubai",
                    "Метро, трамвай, автобус · rta.ae · Silver/Gold",
                    1100,
                ),
            ],
            "taxi": [
                _item(
                    "dubai_taxi_careem",
                    "Careem / Dubai Taxi Corporation",
                    "Официальные такси · rta.ae · 500–2000 ₽",
                    2400,
                ),
            ],
            "rent": [
                _item(
                    "dubai_rent_ez",
                    "Europcar / Hertz Dubai",
                    "От 3500 ₽/день · международные права",
                    10500,
                ),
            ],
            "ferry": [
                _item(
                    "dubai_ferry_abra",
                    "Abra · Dubai Creek",
                    "Традиционная переправа · rta.ae · 1 AED",
                    200,
                ),
            ],
        },
    },
    "Стамбул": {
        "hotel_extras": {
            "restaurants": [
                _item(
                    "istanbul_rest_hamdi",
                    "Hamdi Restaurant",
                    "Eminönü · с 1960 · hamdi.com.tr · 1.2 км",
                    2200,
                ),
                _item(
                    "istanbul_rest_mikla",
                    "Mikla",
                    "Рooftop · рейтинг 4.7 · The Marmara Pera · 2.8 км",
                    4800,
                ),
                _item(
                    "istanbul_rest_ciya",
                    "Çiya Sofrası",
                    "Anadolu mutfağı · рейтинг 4.6 · Kadıköy · 4.5 км",
                    1900,
                ),
            ],
            "attractions": [
                _item(
                    "istanbul_attr_ayasofya",
                    "Ayasofya-i Kebir Camii",
                    "UNESCO · ayasofyacamii.gov.tr · бесплатный вход",
                    0,
                ),
                _item(
                    "istanbul_attr_topkapi",
                    "Topkapı Sarayı Müzesi",
                    "topkapisarayi.gov.tr · билет онлайн",
                    1800,
                ),
                _item(
                    "istanbul_attr_bosphorus",
                    "Şehir Hatları · Bosphorus Tour",
                    "Официальные паромы · sehirhatlari.istanbul · 1.5 ч",
                    1200,
                ),
            ],
            "events": [
                _item(
                    "istanbul_event_istanbul",
                    "Istanbul Foundation for Culture and Arts",
                    "İKSV · биеннале, джаз, кино · iksv.org",
                    2500,
                ),
            ],
            "walking_routes": [
                _item(
                    "istanbul_walk_sultanahmet",
                    "Sultanahmet Heritage Loop",
                    "4.2 км · Blue Mosque, Hippodrome, Grand Bazaar",
                    0,
                ),
                _item(
                    "istanbul_walk_balat",
                    "Balat & Fener Colorful Streets",
                    "3.8 км · UNESCO buffer zone",
                    0,
                ),
            ],
        },
        "city_transport": {
            "public_transport": [
                _item(
                    "istanbul_public_istanbulkart",
                    "Istanbulkart",
                    "Metro, tramvay, Marmaray · istanbulkart.istanbul · 50 TRY",
                    950,
                ),
            ],
            "taxi": [
                _item(
                    "istanbul_taxi_biTaksi",
                    "BiTaksi / Uber Istanbul",
                    "Лицензированные такси · 350–1500 ₽",
                    1700,
                ),
            ],
            "rent": [
                _item(
                    "istanbul_rent_car",
                    "Avis / Enterprise Istanbul",
                    "От 2800 ₽/день · центр и аэропорт IST",
                    8400,
                ),
            ],
            "ferry": [
                _item(
                    "istanbul_ferry_vapur",
                    "İDO / Şehir Hatları Vapur",
                    "Паромы Босфор · sehirhatlari.istanbul",
                    400,
                ),
            ],
        },
    },
    "Париж": {
        "hotel_extras": {
            "restaurants": [
                _item(
                    "paris_rest_julesverne",
                    "Le Jules Verne · Tour Eiffel",
                    "Michelin · eiffel-tower.com · 0.8 км",
                    12000,
                ),
                _item(
                    "paris_rest_bouillon",
                    "Bouillon Chartier",
                    "Классика 1896 · chartier.com · 2.2 км",
                    1600,
                ),
                _item(
                    "paris_rest_septime",
                    "Septime",
                    "Рейтинг 4.7 · septime-charonne.fr · 3.5 км",
                    5500,
                ),
            ],
            "attractions": [
                _item(
                    "paris_attr_louvre",
                    "Musée du Louvre",
                    "louvre.fr · билет онлайн · обязательно бронировать",
                    2200,
                ),
                _item(
                    "paris_attr_versailles",
                    "Château de Versailles",
                    "chateauversailles.fr · RER C · аудиогид",
                    2800,
                ),
                _item(
                    "paris_attr_montmartre",
                    "Basilique du Sacré-Cœur",
                    "Montmartre · basilique-sacre-coeur.fr · вход бесплатно",
                    0,
                ),
            ],
            "events": [
                _item(
                    "paris_event_opera",
                    "Opéra national de Paris",
                    "operadeparis.fr · балет и опера",
                    4800,
                ),
            ],
            "walking_routes": [
                _item(
                    "paris_walk_seine",
                    "Promenade Seine · Île de la Cité",
                    "5.5 км · Notre-Dame, Latin Quarter",
                    0,
                ),
                _item(
                    "paris_walk_marais",
                    "Le Marais Historic Walk",
                    "4.0 км · Place des Vosges, musées",
                    0,
                ),
            ],
        },
        "city_transport": {
            "public_transport": [
                _item(
                    "paris_public_navigo",
                    "Navigo Easy / Paris Visite",
                    "RATP · ratp.fr · метро, RER, автобус · зоны 1–3",
                    1400,
                ),
            ],
            "taxi": [
                _item(
                    "paris_taxi_g7",
                    "G7 Taxi Paris",
                    "Официальная сеть · g7.fr · 600–2500 ₽",
                    2200,
                ),
            ],
            "rent": [
                _item(
                    "paris_rent_velib",
                    "Vélib' Métropole",
                    "Городской прокат велосипедов · velib-metropole.fr",
                    900,
                ),
            ],
        },
    },
}


def is_curated_destination(title: str) -> bool:
    return title in CURATED_TITLES


def get_curated_profile(title: str) -> dict[str, Any] | None:
    return CURATED_PROFILES.get(title)
