from sqlalchemy import create_engine, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Mapped, mapped_column
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv('DB_URL')

engine = create_engine(DB_URL)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class Users(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column()
    email: Mapped[str] = mapped_column()
    password: Mapped[str] = mapped_column(nullable=True)
    provider: Mapped[str] = mapped_column()
    provider_id: Mapped[str] = mapped_column()

def get_db():
    db = SessionLocal()

    try:
        yield db
    
    finally:
        db.close()