from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from db import Base

class BotLog(Base):
    __tablename__ = "bot_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    log_type = Column(String(50))  # e.g., info, warning, error, trade
    message = Column(Text)
    token_symbol = Column(String(20), nullable=True)
    wallet_address = Column(String(100), nullable=True)

