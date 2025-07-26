from database import Base, engine
from referral.models import Wallet, Referral

Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully.")

