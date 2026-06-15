"""Галереи фото отелей — статика фронтенда."""

from __future__ import annotations

ACCOMMODATION_IDS = (
    "acc_phuket_laguna",
    "acc_phuket_hostel",
    "acc_london_hotel",
)


def accommodation_image_urls(public_id: str) -> list[str]:
    return [f"/images/hotels/{public_id}/{i}.jpg" for i in range(1, 5)]


def accommodation_cover_image(public_id: str) -> str:
    urls = accommodation_image_urls(public_id)
    return urls[0] if urls else "/images/hotels/default.jpg"
