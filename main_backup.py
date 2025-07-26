from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

app = FastAPI()

# ==== MODELS ====

# Trade History model
class TradeHistory(BaseModel):
    trade_id: int
    symbol: str
    amount: float
    price: float
    action: str  # "buy" or "sell"
    timestamp: str

# User Preferences model
class UserPreferences(BaseModel):
    notifications: bool = True
    alerts: bool = True
    preferred_trade_bot: Optional[str] = None

# Payment Verification model
class PaymentVerification(BaseModel):
    payment_id: str
    amount: float
    currency: str

# ==== MOCK DATA ====

# In-memory trade history (mock data)
mock_trade_history = [
    TradeHistory(trade_id=1, symbol="SOL", amount=10, price=200.5, action="buy", timestamp="2025-07-20T10:00:00"),
    TradeHistory(trade_id=2, symbol="SOL", amount=5, price=250.7, action="sell", timestamp="2025-07-21T14:15:00"),
]

# In-memory user preferences storage
user_preferences_db = {}

# In-memory subscription info
user_subscriptions = {}

# ==== ENDPOINTS ====

# Get trade history for a user
@app.get("/users/{username}/trade-history", response_model=List[TradeHistory])
async def get_trade_history(username: str):
    return mock_trade_history

# Create or update user preferences
@app.post("/users/{username}/preferences")
async def create_or_update_preferences(username: str, preferences: UserPreferences):
    user_preferences_db[username] = preferences
    return {"msg": "Preferences updated successfully"}

# Get user preferences
@app.get("/users/{username}/preferences", response_model=UserPreferences)
async def get_user_preferences(username: str):
    preferences = user_preferences_db.get(username)
    if not preferences:
        raise HTTPException(status_code=404, detail="User preferences not found")
    return preferences

# Delete user preferences
@app.delete("/users/{username}/preferences")
async def delete_user_preferences(username: str):
    if username not in user_preferences_db:
        raise HTTPException(status_code=404, detail="User preferences not found")
    del user_preferences_db[username]
    return {"msg": "Preferences deleted successfully"}

# Simulate payment verification and activate subscription (30-day trial)
@app.post("/users/{username}/verify-payment")
async def verify_payment(username: str, payment: PaymentVerification):
    # Mock verification logic
    if payment.amount >= 10:
        user_subscriptions[username] = {
            "start_time": datetime.now(),
            "end_time": datetime.now() + timedelta(days=30),
            "status": "active"
        }
        return {"msg": "Payment verified. Subscription activated for 30 days."}
    else:
        raise HTTPException(status_code=400, detail="Payment amount too low")

# Get subscription countdown and status
@app.get("/users/{username}/subscription-status")
async def get_subscription_status(username: str):
    sub = user_subscriptions.get(username)
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    now = datetime.now()
    remaining = sub["end_time"] - now
    if remaining.total_seconds() <= 0:
        sub["status"] = "expired"
        return {"status": "expired", "message": "Your subscription has expired."}

    return {
        "status": sub["status"],
        "time_remaining": str(remaining).split('.')[0],  # HH:MM:SS
        "ends_at": sub["end_time"].isoformat()
    }

