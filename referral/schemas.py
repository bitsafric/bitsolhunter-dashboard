# referral/schemas.py
from pydantic import BaseModel

class ReferralCreate(BaseModel):
    referred_user: str
    referrer: str
    usdt_amount: float
    bitscat_amount: float

