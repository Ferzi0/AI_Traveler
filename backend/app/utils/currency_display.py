import re

_PRICE_TIER_REPLACEMENTS = (
    (re.compile(r"₽₽₽"), "премиум"),
    (re.compile(r"₽₽"), "средний чек"),
    (re.compile(r" · ₽ · "), " · бюджет · "),
    (re.compile(r"\bUSD\b", re.IGNORECASE), "₽"),
    (re.compile(r"\$"), "₽"),
)


def normalize_currency_text(value: str | None) -> str | None:
    if not value:
        return value

    def _replace_amount(match: re.Match[str]) -> str:
        raw = match.group(1).replace(" ", "").replace(",", ".")
        try:
            amount = float(raw)
        except ValueError:
            return f"₽{match.group(1)}"
        rounded = round(amount)
        formatted = f"{rounded:,}".replace(",", "\u00a0")
        return f"~\u202f{formatted}\u00a0₽"

    normalized = re.sub(r"\$\s?(\d[\d\s.,]*)", _replace_amount, value)
    for pattern, replacement in _PRICE_TIER_REPLACEMENTS:
        normalized = pattern.sub(replacement, normalized)
    return normalized
