from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

# Database connection URL for PostgreSQL
DATABASE_URL = "postgresql://postgres:K@lthie23@localhost:5432/bitsolhunter"

# Create an engine to connect to the PostgreSQL database
engine = create_engine(DATABASE_URL)

# Session setup
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for models
Base = declarative_base()

# Define the Subscription model
class Subscription(Base):
    __tablename__ = "subscriptions"
    username = Column(String, primary_key=True)
    email = Column(String, nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    status = Column(String, default="active")
    referrer = Column(String, nullable=True)

# Create the tables in the database if they do not exist
Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")

