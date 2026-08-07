import enum
from fastapi import FastAPI
from sqlalchemy import Column, Integer, String, Date, ForeignKey, create_engine, Enum
from sqlalchemy.orm import declarative_base, sessionmaker, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import CITEXT
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

#Base modeller til tabellene  (WIP(som hele resten av løsningen))
class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role:Mapped[str] = mapped_column(Enum(User_role, name="user_role_enum"), nullable=False)


#tydligvis gjør fastapi middleware validation for meg så det er fint

# class Sessions(Base):
#     __tablename__ = "sessions"

#     id = Column(Integer, primary_key=True)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

class Books(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    isbn = Column(int, nullable=False)
    in_stock = Column(int)
    in_use = Column(int)

class PCs(Base):
    __tablename__ = "pcs"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    serial_number = Column(String, nullable=False)

class Apprentices(Base):
    __tablename__ = "apprentices"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(CITEXT, nullable=False)
    apprenticeship_start = Column(Date)
    aprenticeship_end = Column(Date)

class Book_loans(Base):
    __tablename__ = "book_loans"

    id = Column(Integer, primary_key=True)
    laoner_id:Mapped[int] = mapped_column(ForeignKey("apprentices.id"))
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))
    loan_date = Column(Date, nullable=False)
    return_date = Column(Date)

class PC_loans(Base):
    __tablename__ = "pc_loans"

    id = Column(Integer, primary_key=True)
    laoner_id:Mapped[int] = mapped_column(ForeignKey("apprentices.id"))
    pc_id: Mapped[int] = mapped_column(ForeignKey("pcs.id"))
    loan_date = Column(Date, nullable=False)
    return_date = Column(Date)


Base.metadata.create_all(engine)

app = FastAPI()