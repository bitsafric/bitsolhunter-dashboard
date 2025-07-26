from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Wallet(Base):
    __tablename__ = "wallets"
    
    # Unique address for each wallet
    address = Column(String, primary_key=True, index=True)
    
    # Wallet balances for USDT and BitsCat
    usdt = Column(Float, default=0.0)
    bitscat = Column(Float, default=0.0)
    
    # Define the one-to-many relationship with Referral
    referrals = relationship("Referral", back_populates="referrer_wallet", cascade="all, delete-orphan")

class Referral(Base):
    __tablename__ = "referrals"
    
    # The referred user (Primary key)
    referred = Column(String, primary_key=True)
    
    # The referrer (Foreign key linking to the Wallet's address)
    referrer = Column(String, ForeignKey("wallets.address"), nullable=False)
    
    # Define the back relationship to the Wallet
    referrer_wallet = relationship("Wallet", back_populates="referrals")

