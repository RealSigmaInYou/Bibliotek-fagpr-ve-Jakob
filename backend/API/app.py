import enum
from fastapi import FastAPI
from sqlalchemy import Column, Integer, String, ForeignKey, create_engine, Enum
from sqlalchemy.orm import declarative_base, sessionmaker, Mapped, mapped_column
from dotenv import load_dotenv
import os
load_dotenv()

postgres_pw = os.getenv("postgres_pw")

engine = create_engine(
    f"postgresql+psycopg2://postgres:{postgres_pw}@localhost:5432/user_test_db"
)

Base = declarative_base()
Session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)

#Bruker enums selv om at for denne ene trengte 
#jeg egentlig ikke å ha ett felt for hvilken
#rolle man har, men kunne hat det som 
#"is_admin = Column(bool)" istedenfor
class User_role(enum.Enum): 
    ADMIN = "admin"
    SAKSBEHANDLER = "saksbehandler"


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role:Mapped[str] = mapped_column(Enum(User_role, name="user_role_enum"), nullable=False)


class Sessions(Base):
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


Base.metadata.create_all(engine)

app = FastAPI()