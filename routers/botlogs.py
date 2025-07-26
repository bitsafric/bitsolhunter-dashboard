from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import SessionLocal
from models import BotLog
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BotLogCreate(BaseModel):
    log_type: str
    message: str
    token_symbol: Optional[str] = None
    wallet_address: Optional[str] = None

class BotLogResponse(BotLogCreate):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

@router.post("/logs", response_model=BotLogResponse)
def create_log(log: BotLogCreate, db: Session = Depends(get_db)):
    db_log = BotLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/logs", response_model=List[BotLogResponse])
def get_logs(db: Session = Depends(get_db)):
    return db.query(BotLog).order_by(BotLog.timestamp.desc()).limit(100).all()

