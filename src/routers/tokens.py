from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_tokens():
    return [{"name": "CAT", "market_cap": 500000, "liquidity": 30000}]

