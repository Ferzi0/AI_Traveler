from __future__ import annotations

from app.data.curated_hotels import all_curated_hotel_ids, is_curated_hotel

LEGACY_ACCOMMODATION_IDS = (
    "acc_phuket_laguna",
    "acc_phuket_hostel",
    "acc_london_hotel",
)

HOTEL_GALLERY_SIZE = 4


def all_accommodation_ids() -> tuple[str, ...]:
    return all_curated_hotel_ids() + LEGACY_ACCOMMODATION_IDS


def accommodation_image_urls(public_id: str, *, size: int = HOTEL_GALLERY_SIZE) -> list[str]:
    return [f"/images/hotels/{public_id}/{i}.jpg" for i in range(1, size + 1)]


def accommodation_cover_image(public_id: str) -> str:
    urls = accommodation_image_urls(public_id)
    return urls[0] if urls else "/images/hotels/default.jpg"


def has_hotel_gallery(public_id: str) -> bool:
    return is_curated_hotel(public_id) or public_id in LEGACY_ACCOMMODATION_IDS


ACCOMMODATION_IDS = all_accommodation_ids()
