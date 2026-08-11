import enum
from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum, BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from db import Base, Session_local, engine


class User_role(enum.Enum): 
    ADMIN = "admin"
    SAKSBEHANDLER = "saksbehandler"


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role: Mapped[str] = mapped_column(Enum(User_role, name="user_role_enum"), nullable=False)


class Books(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    isbn = Column(BigInteger, unique=True)
    in_stock = Column(Integer)
    in_use = Column(Integer)


class PCs(Base):
    __tablename__ = "pcs"

    id = Column(Integer, primary_key=True)
    device_name = Column("name", String, nullable=False)
    serial_number = Column(String, nullable=False, unique=True)


class Apprentices(Base):
    __tablename__ = "apprentices"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    apprenticeship_start = Column(Date)
    apprenticeship_end = Column(Date)


class Book_loans(Base):
    __tablename__ = "book_loans"

    id = Column(Integer, primary_key=True)
    loaner_id: Mapped[int] = mapped_column("laoner_id", ForeignKey("apprentices.id"))
    case_responsible_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))
    loan_date = Column(Date, nullable=False)
    return_date = Column(Date)


class PC_loans(Base):
    __tablename__ = "pc_loans"

    id = Column(Integer, primary_key=True)
    loaner_id: Mapped[int] = mapped_column("laoner_id", ForeignKey("apprentices.id"))
    case_responsible_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    pc_id: Mapped[int] = mapped_column(ForeignKey("pcs.id"))
    loan_date = Column(Date, nullable=False)
    return_date = Column(Date)


Base.metadata.create_all(engine)