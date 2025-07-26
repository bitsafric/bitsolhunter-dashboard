from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_stats():
    return {"daily_gain": "8.2%", "tokens_scanned": 145}

