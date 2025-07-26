from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import smtplib
import random
import string

# ==== DB SETUP ====
DATABASE_URL = "sqlite:///./subscriptions.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

class Subscription(Base):
    __tablename__ = "subscriptions"
    username = Column(String, primary_key=True)
    email = Column(String, nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    status = Column(String, default="active")
    referrer = Column(String, nullable=True)  # Store who referred the user

Base.metadata.create_all(bind=engine)

# ==== FASTAPI APP ====
app = FastAPI()

# ==== MODELS ====
class PaymentVerification(BaseModel):
    username: str
    email: EmailStr
    tx_hash: str
    amount: float
    currency: str
    referral_code: Optional[str] = None  # Optional referral code

class AdminUser(BaseModel):
    username: str
    email: EmailStr
    start_time: datetime
    end_time: datetime
    status: str

# ==== UTILITIES ====
def send_subscription_email(email: str, status: str, end_time: datetime):
    message = f"""
    Subject: BitsolHunter Subscription Update

    Your subscription is now '{status}' and will end on {end_time}.
    Thank you for using BitsolHunter!
    """
    with smtplib.SMTP("localhost") as server:
        server.sendmail("admin@bitsolhunter.com", email, message)
    
def generate_referral_code() -> str:
    """Generate a unique referral code."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

# ==== ENDPOINTS ====
@app.get("/")
def root():
    return {"status": "✅ BitsolHunter backend running", "version": "0.1.0"}
    
# Verify payment, activate subscription, and apply referral logic
@app.post("/payment/verify")
def verify_crypto_payment(data: PaymentVerification, background_tasks: BackgroundTasks):
    if data.amount < 10:
        raise HTTPException(status_code=400, detail="Payment below threshold")

    db = SessionLocal()

    # Check if referral code is provided and valid
    if data.referral_code:
        referrer = db.query(Subscription).filter_by(username=data.referral_code).first()
        if not referrer:
            raise HTTPException(status_code=400, detail="Invalid referral code")
        # Apply referral benefit (e.g., add extra days to the referrer’s subscription)
        referrer.end_time += timedelta(days=7)  # Adding 7 days for a successful referral
        db.commit()
    
    # Check if the user already has a subscription
    sub = db.query(Subscription).filter_by(username=data.username).first()
    end_time = datetime.utcnow() + timedelta(days=30)
    
    if sub:
        sub.email = data.email
        sub.start_time = datetime.utcnow()
        sub.end_time = end_time
        sub.status = "active"
    else:
        # New subscription
        sub = Subscription(
            username=data.username,
            email=data.email,
            start_time=datetime.utcnow(),
            end_time=end_time,
            status="active",
            referrer=data.referral_code  # Store the referrer’s code
        )
        db.add(sub)
    
    db.commit()
    
    # Add email task for the background to notify the user
    background_tasks.add_task(send_subscription_email, data.email, "active", end_time)
    
    return {"message": "Subscription verified and activated"}
    
# Get subscription details for a user
@app.get("/subscription/{username}")
def get_subscription(username: str):
    db = SessionLocal()
    sub = db.query(Subscription).filter_by(username=username).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found")
        
    remaining = sub.end_time - datetime.utcnow()
    status = "expired" if remaining.total_seconds() <= 0 else sub.status
    return {
        "username": sub.username,
        "status": status,   
        "email": sub.email,
        "ends_in": str(remaining).split('.')[0],
        "end_time": sub.end_time,
        "referrer": sub.referrer if sub.referrer else "No referrer"
    }
    
# Admin view: Get all users' subscriptions
@app.get("/admin/users", response_model=List[AdminUser])
def admin_get_all_subscriptions():   
    db = SessionLocal()
    users = db.query(Subscription).all()
    return users
    
# Generate referral code for a user
@app.get("/generate/referral/{username}")
def generate_referral(username: str):
    db = SessionLocal()
    user = db.query(Subscription).filter_by(username=username).first()  
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    referral_code = generate_referral_code()
    return {"referral_code": referral_code}
from fastapi.middleware.cors import CORSMiddleware
from routers import botlogs  # if it's in routers/botlogs.py

app.include_router(botlogs.router)

# Optional: enable frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

