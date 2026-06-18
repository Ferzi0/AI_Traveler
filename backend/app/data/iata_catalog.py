from __future__ import annotations

ORIGIN_CITY_TO_IATA: dict[str, str] = {
    "москва": "MOW",
    "санкт-петербург": "LED",
    "сочи": "AER",
    "казань": "KZN",
    "новосибирск": "OVB",
    "екатеринбург": "SVX",
    "краснодар": "KRR",
    "минеральные воды": "MRV",
    "владивосток": "VVO",
    "калининград": "KGD",
    "самара": "KUF",
    "уфа": "UFA",
    "ростов-на-дону": "ROV",
    "нижний новгород": "GOJ",
    "мурманск": "MMK",
    "вологда": "VGD",
    "воронеж": "VOZ",
    "пермь": "PEE",
    "омск": "OMS",
    "челябинск": "CEK",
    "красноярск": "KJA",
    "иркутск": "IKT",
    "хабаровск": "KHV",
    "якутск": "YKS",
    "симферополь": "SIP",
    "махачкала": "MCX",
    "грозный": "GRV",
    "ставрополь": "STW",
    "тюмень": "TJM",
    "барнаул": "BAX",
    "томск": "TOF",
    "кемерово": "KEJ",
    "саратов": "RTW",
    "волгоград": "VOG",
    "улан-удэ": "UUD",
    "петрозаводск": "PES",
    "архангельск": "ARH",
    "сургут": "SGC",
    "анапа": "AAQ",
    "геленджик": "GDZ",
}

DESTINATION_IATA: dict[str, dict[str, str]] = {
    "IST": {"city": "Стамбул", "country": "Турция"},
    "AYT": {"city": "Анталья", "country": "Турция"},
    "HKT": {"city": "Пхукет", "country": "Таиланд"},
    "BKK": {"city": "Бангкок", "country": "Таиланд"},
    "LON": {"city": "Лондон", "country": "Великобритания"},
    "PAR": {"city": "Париж", "country": "Франция"},
    "DXB": {"city": "Дубай", "country": "ОАЭ"},
    "BCN": {"city": "Барселона", "country": "Испания"},
    "MAD": {"city": "Мадрид", "country": "Испания"},
    "ROM": {"city": "Рим", "country": "Италия"},
    "MIL": {"city": "Милан", "country": "Италия"},
    "BER": {"city": "Берлин", "country": "Германия"},
    "MUC": {"city": "Мюнхен", "country": "Германия"},
    "PRG": {"city": "Прага", "country": "Чехия"},
    "VIE": {"city": "Вена", "country": "Австрия"},
    "AMS": {"city": "Амстердам", "country": "Нидерланды"},
    "TBS": {"city": "Тбилиси", "country": "Грузия"},
    "EVN": {"city": "Ереван", "country": "Армения"},
    "BAK": {"city": "Баку", "country": "Азербайджан"},
    "TAS": {"city": "Ташкент", "country": "Узбекистан"},
    "ALA": {"city": "Алматы", "country": "Казахстан"},
    "NQZ": {"city": "Астана", "country": "Казахстан"},
    "FRU": {"city": "Бишкек", "country": "Кыргызстан"},
    "MLE": {"city": "Мальдивы", "country": "Мальдивы"},
    "GOI": {"city": "Гоа", "country": "Индия"},
    "DEL": {"city": "Дели", "country": "Индия"},
    "SSH": {"city": "Шарм-эль-Шейх", "country": "Египет"},
    "HRG": {"city": "Хургада", "country": "Египет"},
    "CAI": {"city": "Каир", "country": "Египет"},
    "AER": {"city": "Сочи", "country": "Россия"},
    "MRV": {"city": "Минеральные Воды", "country": "Россия"},
    "KGD": {"city": "Калининград", "country": "Россия"},
    "SIP": {"city": "Симферополь", "country": "Россия"},
    "MCX": {"city": "Махачкала", "country": "Россия"},
    "KRR": {"city": "Краснодар", "country": "Россия"},
    "LED": {"city": "Санкт-Петербург", "country": "Россия"},
    "MOW": {"city": "Москва", "country": "Россия"},
    "NYC": {"city": "Нью-Йорк", "country": "США"},
    "LAX": {"city": "Лос-Анджелес", "country": "США"},
    "MIA": {"city": "Майами", "country": "США"},
    "TYO": {"city": "Токио", "country": "Япония"},
    "SEL": {"city": "Сеул", "country": "Южная Корея"},
    "BJS": {"city": "Пекин", "country": "Китай"},
    "SHA": {"city": "Шанхай", "country": "Китай"},
    "SGN": {"city": "Хошимин", "country": "Вьетнам"},
    "DPS": {"city": "Бали", "country": "Индонезия"},
    "CMB": {"city": "Коломбо", "country": "Шри-Ланка"},
    "RHO": {"city": "Родос", "country": "Греция"},
    "HER": {"city": "Крит", "country": "Греция"},
    "ATH": {"city": "Афины", "country": "Греция"},
    "LCA": {"city": "Ларнака", "country": "Кипр"},
    "TIV": {"city": "Тиват", "country": "Черногория"},
    "RIX": {"city": "Рига", "country": "Латвия"},
    "TLL": {"city": "Таллин", "country": "Эстония"},
    "VNO": {"city": "Вильнюс", "country": "Литва"},
    "WAW": {"city": "Варшава", "country": "Польша"},
    "BUD": {"city": "Будапешт", "country": "Венгрия"},
    "DOH": {"city": "Доха", "country": "Катар"},
    "AUH": {"city": "Абу-Даби", "country": "ОАЭ"},
    "SHJ": {"city": "Шарджа", "country": "ОАЭ"},
    "VAR": {"city": "Варна", "country": "Болгария"},
    "BOJ": {"city": "Бургас", "country": "Болгария"},
}

DESTINATION_TITLE_TO_IATA: dict[str, str] = {
    "пхукет": "HKT",
    "бангкок": "BKK",
    "паттайя": "UTP",
    "краби": "KBV",
    "лондон": "LON",
    "эдинбург": "EDI",
    "манчестер": "MAN",
    "стамбул": "IST",
    "анталья": "AYT",
    "измир": "IZM",
    "париж": "PAR",
    "ницца": "NCE",
    "лион": "LYS",
    "марсель": "MRS",
    "рим": "ROM",
    "милан": "MIL",
    "венеция": "VCE",
    "флоренция": "FLR",
    "неаполь": "NAP",
    "барселона": "BCN",
    "мадрид": "MAD",
    "севилья": "SVQ",
    "валенсия": "VLC",
    "берлин": "BER",
    "мюнхен": "MUC",
    "гамбург": "HAM",
    "франкфурт": "FRA",
    "амстердам": "AMS",
    "прага": "PRG",
    "вена": "VIE",
    "зальцбург": "SZG",
    "цюрих": "ZRH",
    "женева": "GVA",
    "лиссабон": "LIS",
    "порту": "OPO",
    "афины": "ATH",
    "санторини": "JTR",
    "дубай": "DXB",
    "абу-даби": "AUH",
    "доха": "DOH",
    "тель-авив": "TLV",
    "иерусалим": "TLV",
    "токио": "TYO",
    "киото": "OSA",
    "осака": "OSA",
    "сеул": "SEL",
    "пекин": "BJS",
    "шанхай": "SHA",
    "гонконг": "HKG",
    "сингапур": "SIN",
    "куала-лумпур": "KUL",
    "бали": "DPS",
    "джакарта": "CGK",
    "ханой": "HAN",
    "хошимин": "SGN",
    "нью-дели": "DEL",
    "мумбаи": "BOM",
    "гоа": "GOI",
    "каир": "CAI",
    "хургада": "HRG",
    "шарм-эль-шейх": "SSH",
    "марракеш": "RAK",
    "кейптаун": "CPT",
    "нью-йорк": "NYC",
    "лос-анджелес": "LAX",
    "сан-франциско": "SFO",
    "лас-вегас": "LAS",
    "майами": "MIA",
    "орландо": "MCO",
    "чикаго": "CHI",
    "вашингтон": "WAS",
    "бостон": "BOS",
    "сиэтл": "SEA",
    "гонолулу": "HNL",
    "торонто": "YTO",
    "ванкувер": "YVR",
    "монреаль": "YMQ",
    "мехико": "MEX",
    "канкун": "CUN",
    "рио-де-жанейро": "RIO",
    "сан-паулу": "SAO",
    "буэнос-айрес": "BUE",
    "сантьяго": "SCL",
    "лима": "LIM",
    "сидней": "SYD",
    "мельбурн": "MEL",
    "окленд": "AKL",
    "рейкьявик": "REK",
    "осло": "OSL",
    "стокгольм": "STO",
    "копенгаген": "CPH",
    "хельсинки": "HEL",
    "дублин": "DUB",
    "брюссель": "BRU",
    "будапешт": "BUD",
    "варшава": "WAW",
    "краков": "KRK",
    "бухарест": "BUH",
    "софия": "SOF",
    "загреб": "ZAG",
    "дубровник": "DBV",
    "белград": "BEG",
    "тбилиси": "TBS",
    "баку": "BAK",
    "ереван": "EVN",
    "алматы": "ALA",
    "астана": "NQZ",
    "ташкент": "TAS",
    "сочи": "AER",
    "казань": "KZN",
    "санкт-петербург": "LED",
    "калининград": "KGD",
    "мальдивы": "MLE",
    "маврикий": "MRU",
    "сейшелы": "SEZ",
}


def destination_title_to_iata(title: str) -> str:
    needle = title.strip().lower()
    if needle in DESTINATION_TITLE_TO_IATA:
        return DESTINATION_TITLE_TO_IATA[needle]
    for code, meta in DESTINATION_IATA.items():
        if meta["city"].lower() == needle:
            return code
    raise ValueError(f"Unknown destination for IATA lookup: {title}")


def _display_city_name(city_lower: str) -> str:
    def cap_word(word: str) -> str:
        return word[:1].upper() + word[1:] if word else word

    parts: list[str] = []
    for segment in city_lower.split(" "):
        parts.append("-".join(cap_word(part) for part in segment.split("-")))
    return " ".join(parts)


def _build_origin_iata_labels() -> dict[str, str]:
    labels: dict[str, str] = {}

    for city_lower, iata in ORIGIN_CITY_TO_IATA.items():
        labels[iata.upper()] = _display_city_name(city_lower)

    for code, meta in DESTINATION_IATA.items():
        if meta.get("country") == "Россия":
            labels.setdefault(code.upper(), meta["city"])

    extras = {
        "SVO": "Москва",
        "DME": "Москва",
        "VKO": "Москва",
        "ZIA": "Москва",
        "OVB": "Новосибирск",
        "SVX": "Екатеринбург",
        "KZN": "Казань",
        "UFA": "Уфа",
        "KUF": "Самара",
        "GOJ": "Нижний Новгород",
        "CEK": "Челябинск",
        "OMS": "Омск",
        "PEE": "Пермь",
        "KJA": "Красноярск",
        "IKT": "Иркутск",
        "KHV": "Хабаровск",
        "YKS": "Якутск",
        "TJM": "Тюмень",
        "TOF": "Томск",
        "KEJ": "Кемерово",
        "RTW": "Саратов",
        "VOG": "Волгоград",
        "UUD": "Улан-Удэ",
        "ARH": "Архангельск",
        "SGC": "Сургут",
        "VOZ": "Воронеж",
        "MMK": "Мурманск",
        "VGD": "Вологда",
        "BAX": "Барнаул",
        "STW": "Ставрополь",
        "GRV": "Грозный",
        "MCX": "Махачкала",
        "AAQ": "Анапа",
        "GDZ": "Геленджик",
        "PES": "Петрозаводск",
        "BQS": "Благовещенск",
        "HTA": "Чита",
        "PKC": "Петропавловск-Камчатский",
        "UUS": "Южно-Сахалинск",
        "GDX": "Магадан",
        "NJC": "Нижневартовск",
        "IJK": "Ижевск",
        "SCW": "Сыктывкар",
        "KVX": "Киров",
        "ASF": "Астрахань",
        "REN": "Оренбург",
        "CSY": "Чебоксары",
        "EGO": "Белгород",
        "OGZ": "Владикавказ",
        "NAL": "Нальчик",
        "ESL": "Элиста",
        "SKX": "Саранск",
        "PKV": "Псков",
        "RZN": "Рязань",
        "SLY": "Салехард",
        "NOJ": "Ноябрьск",
        "NYM": "Надым",
        "HMA": "Ханты-Мансийск",
        "NUX": "Новый Уренгой",
        "NSK": "Норильск",
        "KGP": "Когалым",
        "NBC": "Набережные Челны",
        "JOK": "Йошкар-Ола",
        "ULV": "Ульяновск",
        "PEZ": "Пенза",
        "TBW": "Тамбов",
        "LPK": "Липецк",
        "URS": "Курск",
        "BZK": "Брянск",
        "IWA": "Иваново",
    }
    for code, name in extras.items():
        labels.setdefault(code, name)

    return labels


ORIGIN_IATA_LABELS: dict[str, str] = _build_origin_iata_labels()


def origin_city_to_iata(city_name: str) -> str:
    needle = city_name.strip().lower()
    if needle in ORIGIN_CITY_TO_IATA:
        return ORIGIN_CITY_TO_IATA[needle]
    upper = city_name.strip().upper()
    return upper if 2 <= len(upper) <= 3 else "MOW"


def origin_iata_label(iata: str) -> str:
    code = iata.upper()
    return ORIGIN_IATA_LABELS.get(code, DESTINATION_IATA.get(code, {}).get("city", code))


def resolve_destination(iata: str) -> dict[str, str]:
    code = iata.upper()
    known = DESTINATION_IATA.get(code)
    if known:
        return known
    return {"city": code, "country": ""}


def enrich_place_names(item: dict) -> dict:
    dest_iata = str(item.get("destination", "")).upper()
    origin_iata = str(item.get("origin", "")).upper()
    dest_meta = resolve_destination(dest_iata)

    item["city"] = item.get("destination_name") or dest_meta["city"]
    item["country"] = dest_meta["country"]
    item["origin_label"] = item.get("origin_name") or origin_iata_label(origin_iata)
    return item
