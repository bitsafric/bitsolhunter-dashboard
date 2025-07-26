from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_wallets():
    return [{"address": "ABC123", "balance": 2.5}]

