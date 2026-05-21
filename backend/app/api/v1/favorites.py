from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_favorites() -> dict[str, list]:
    return {"items": []}


@router.post("")
def add_favorite() -> dict[str, str]:
    return {"message": "add favorite stub"}


@router.delete("/{favorite_id}")
def remove_favorite(favorite_id: int) -> dict[str, int]:
    return {"favorite_id": favorite_id}
