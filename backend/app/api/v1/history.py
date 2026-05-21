from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_history() -> dict[str, list]:
    return {"items": []}
