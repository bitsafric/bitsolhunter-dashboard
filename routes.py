# referral/routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from referral import models, schemas, logic
from database import get_db  # Correctly importing get_db

referral_router = APIRouter()

@referral_router.post("/create_referral")
async def create_referral(data: schemas.ReferralCreate, db: Session = Depends(get_db)):
    # Logic for creating a referral
    referred_user = data.referred_user
    referrer = data.referrer
    usdt_amount = data.usdt_amount
    bitscat_amount = data.bitscat_amount

    # Call your referral logic
    logic.handle_referral_payment(referred_user, referrer, usdt_amount, bitscat_amount, db)

    return {"message": "Referral created successfully"}


