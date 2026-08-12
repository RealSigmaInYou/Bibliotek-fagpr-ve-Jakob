from fastapi import Depends, APIRouter, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from db import Base, Session_local, engine
from api.models import User_role, Users as user_model, PCs as pcs_model, PC_loans as pc_loan_model, Book_loans as book_loan_model, Apprentices as apprentices_model, Books as books_model
from auth import authenticate_user, create_token, decode_token, hash_password
from datetime import date, datetime

router = APIRouter()

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
    except OperationalError as exc:
        print(f"DB init skipped: {exc}")


init_db()



def get_db():
    db = Session_local()
    try:
        yield db
    finally:
        db.close()


class login_payload(BaseModel):
    username: str
    password: str

@router.post("/api/login")
def login(payload: login_payload, db: Session = Depends(get_db)):
    user = db.query(user_model).filter(user_model.username == payload.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not authenticate_user(user.hashed_password, payload.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "status": 200,
        "message": "Login successful",
        "token": create_token(user.username, user.role.value),
        "role": user.role.value,
    }



def get_bearer_token(request: Request) -> str:
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return auth_header.split(" ", 1)[1]


class create_user_payload(BaseModel):
    username: str
    password: str
    role: User_role = User_role.SAKSBEHANDLER


@router.post("/api/create_user")
def create_user(payload: create_user_payload, request: Request, db: Session = Depends(get_db)):
    token = get_bearer_token(request)
    decoded_token = decode_token(token)
    
    if decoded_token.get("role") != User_role.ADMIN.value:
        raise HTTPException(status_code=403, detail="Admin only")

    existing_user = db.query(user_model).filter(user_model.username == payload.username).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Username already exists")

    new_user = user_model(
        username = payload.username,
        hashed_password = hash_password(payload.password),
        role = payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": 200,
        "message": "User created",
        "user": {
            "username": new_user.username,
            "role": new_user.role.value,
        },
    }



class register_pc_payload(BaseModel):
    serial_number: str
    device_name: str


@router.post("/api/register_pc")
def register_pc(payload: register_pc_payload, db: Session = Depends(get_db)):
    existing_serial_number = db.query(pcs_model).filter(pcs_model.serial_number == payload.serial_number).first()

    if existing_serial_number:
        raise HTTPException(status_code=409, detail="Device already registered")

    new_device = pcs_model(
        serial_number = payload.serial_number,
        device_name = payload.device_name,
    )
    db.add(new_device)
    db.commit()
    db.refresh(new_device)

    return {
        "status": 200,
        "message": "Device registered",
        "device": {
            "device-serial-number" : new_device.serial_number,
            "device-name": new_device.device_name,
        }
    }

class register_book_payload(BaseModel):
    isbn: int
    book_name: str
    amount: int


@router.post("/api/register_book")
def register_book(payload: register_book_payload, db: Session = Depends(get_db)):
    existing_book = db.query(books_model).filter(books_model.isbn == payload.isbn).first()

    if existing_book:
        existing_book.in_stock = (existing_book.in_stock or 0) + payload.amount
        
        db.commit()
        db.refresh(existing_book)

        return {
            "status": 200,
            "message": "Book stock updated",
            "book": {
                "isbn": existing_book.isbn,
                "book_name": existing_book.name,
                "in_stock": existing_book.in_stock,
                "in_use": existing_book.in_use,
            },
        }

    new_book = books_model(
        name = payload.book_name,
        isbn = payload.isbn,
        in_stock = payload.amount,
        in_use = 0,
    )
    db.add(new_book)
    db.commit()
    db.refresh(new_book)

    return {
        "status": 200,
        "message": "Book registered",
        "book": {
            "isbn": new_book.isbn,
            "book_name": new_book.name,
            "in_stock": new_book.in_stock,
            "in_use": new_book.in_use,
        },
    }


@router.get("/api/books")
def get_all_books(db: Session = Depends(get_db)):
    books = db.query(books_model).all()
    return {
        "status": 200,
        "books": [
            {
                "id": book.id,
                "name": book.name,
                "isbn": book.isbn,
                "in_stock": book.in_stock,
                "in_use": book.in_use,
            }
            for book in books
        ],
    }


@router.get("/api/books/search")
def search_books(isbn: int | None = None, book_name: str | None = None, db: Session = Depends(get_db)):
    query = db.query(books_model)

    if isbn is not None:
        query = query.filter(books_model.isbn == isbn)
    if book_name:
        query = query.filter(books_model.name.ilike(f"%{book_name}%"))

    books = query.all()
    return {
        "status": 200,
        "books": [
            {
                "id": book.id,
                "name": book.name,
                "isbn": book.isbn,
                "in_stock": book.in_stock,
                "in_use": book.in_use,
            }
            for book in books
        ],
    }


@router.get("/api/active_book_loans")
def get_active_book_loans(request: Request, db: Session = Depends(get_db)):
    get_bearer_token(request)

    loans = (
        db.query(book_loan_model, books_model, apprentices_model)
        .join(books_model, book_loan_model.book_id == books_model.id)
        .join(apprentices_model, book_loan_model.loaner_id == apprentices_model.id)
        .filter(book_loan_model.return_date == None)
        .all()
    )

    return {
        "status": 200,
        "active_loans": [
            {
                "loan_id": loan_item[0].id,
                "book_id": loan_item[1].id,
                "title": loan_item[1].name,
                "borrower_id": loan_item[2].id,
                "borrower_name": loan_item[2].name,
                "loan_date": loan_item[0].loan_date,
            }
            for loan_item in loans
        ],
    }


@router.get("/api/active_pc_loans")
def get_active_pc_loans(request: Request, db: Session = Depends(get_db)):
    get_bearer_token(request)

    loans = (
        db.query(pc_loan_model, pcs_model, apprentices_model)
        .join(pcs_model, pc_loan_model.pc_id == pcs_model.id)
        .join(apprentices_model, pc_loan_model.loaner_id == apprentices_model.id)
        .filter(pc_loan_model.return_date == None)
        .all()
    )

    return {
        "status": 200,
        "active_loans": [
            {
                "loan_id": loan_item[0].id,
                "pc_id": loan_item[1].id,
                "serial_number": loan_item[1].serial_number,
                "device_name": loan_item[1].device_name,
                "borrower_id": loan_item[2].id,
                "borrower_name": loan_item[2].name,
                "loan_date": loan_item[0].loan_date,
            }
            for loan_item in loans
        ],
    }


@router.get("/api/pcs")
def get_all_pcs(db: Session = Depends(get_db)):
    pcs = db.query(pcs_model).all()
    return {
        "status": 200,
        "pcs": [
            {
                "id": pc.id,
                "serial_number": pc.serial_number,
                "device_name": pc.device_name,
            }
            for pc in pcs
        ],
    }


@router.get("/api/pcs/search")
def search_pcs(serial_number: str | None = None, device_name: str | None = None, db: Session = Depends(get_db)):
    query = db.query(pcs_model)
    if serial_number:
        query = query.filter(pcs_model.serial_number == serial_number)
    if device_name:
        query = query.filter(pcs_model.device_name.ilike(f"%{device_name}%"))

    pcs = query.all()
    return {
        "status": 200,
        "pcs": [
            {
                "id": pc.id,
                "serial_number": pc.serial_number,
                "device_name": pc.device_name,
            }
            for pc in pcs
        ],
    }


def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = get_bearer_token(request)
    decoded_token = decode_token(token)
    username = decoded_token.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(user_model).filter(user_model.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


class register_apprentice_payload(BaseModel):
    name: str
    email: str
    apprenticeship_start: datetime #Year/Month/Day
    apprenticeship_end: datetime

@router.post("/api/register_apprentice")
def register_apprentice(payload: register_apprentice_payload, db: Session = Depends(get_db)):
    existing_apprentice_email = db.query(apprentices_model).filter(apprentices_model.email == payload.email).first()

    if existing_apprentice_email:
        raise HTTPException(status_code=409, detail="Apprentice already registered")

    new_apprentice = apprentices_model(
        name = payload.name,
        email = payload.email,
        apprenticeship_start = payload.apprenticeship_start,
        apprenticeship_end = payload.apprenticeship_end
    )

    db.add(new_apprentice)
    db.commit()
    db.refresh(new_apprentice)

    return {
        "status": 200,
        "message": "Apprentice registered",
        "apprentice": {
            "id": new_apprentice.id,
            "name": new_apprentice.name,
            "email": new_apprentice.email,
        },
    }


@router.get("/api/apprentices")
def get_all_apprentices(db: Session = Depends(get_db)):
    apprentices = db.query(apprentices_model).all()
    return {
        "status": 200,
        "apprentices": [
            {
                "id": apprentice.id,
                "name": apprentice.name,
                "email": apprentice.email,
                "start": apprentice.apprenticeship_start,
                "end": apprentice.apprenticeship_end,
            }
            for apprentice in apprentices
        ],
    }


class loan_books_payload(BaseModel):
    isbn: int
    apprentice_ID: int

@router.post("/api/loan_book")
def loan_book(payload: loan_books_payload, request: Request, db: Session = Depends(get_db), current_user: user_model = Depends(get_current_user)):
    book = db.query(books_model).filter(books_model.isbn == payload.isbn).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    #book.in_stock kan være null og derfor bruker den 0 som en fallback dersom den er det
    if (book.in_stock or 0) <= 0: 
        raise HTTPException(status_code=409, detail="No copies available for loan")

    existing_loan = db.query(book_loan_model).filter(
        book_loan_model.book_id == book.id,
        book_loan_model.loaner_id == payload.apprentice_ID,
        book_loan_model.return_date == None,
    ).first()

    if existing_loan:
        raise HTTPException(status_code=409, detail="Loan already active for this apprentice and book")

    new_loan = book_loan_model(
        loaner_id=payload.apprentice_ID,
        case_responsible_id=current_user.id,
        book_id=book.id,
        loan_date=date.today(),
        return_date=None,
    )
    book.in_stock = (book.in_stock or 0) - 1
    book.in_use = (book.in_use or 0) + 1
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    db.refresh(book)

    return {
        "status": 200,
        "message": "Bok lånet",
        "loan": {
            "loan_id": new_loan.id,
            "book_id": book.id,
            "apprentice_id": payload.apprentice_ID,
            "case_responsible_id": current_user.id,
            "case_responsible_username": current_user.username,
            "loan_date": new_loan.loan_date,
        },
    }


class return_book_payload(BaseModel):
    loan_id: int


@router.post("/api/deliver_book")
def deliver_book(payload: return_book_payload, db: Session = Depends(get_db)):
    loan = db.query(book_loan_model).filter(book_loan_model.id == payload.loan_id).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    if loan.return_date is not None:
        raise HTTPException(status_code=409, detail="Book already returned")

    book = db.query(books_model).filter(books_model.id == loan.book_id).first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    loan.return_date = date.today()
    book.in_stock = (book.in_stock or 0) + 1
    book.in_use = max((book.in_use or 0) - 1, 0)

    db.commit()
    db.refresh(loan)
    db.refresh(book)

    return {
        "status": 200,
        "message": "Book returned",
        "loan": {
            "loan_id": loan.id,
            "book_id": loan.book_id,
            "return_date": loan.return_date,
        },
    }


class loan_pc_payload(BaseModel):
    serial_number: str
    apprentice_ID: int


@router.post("/api/loan_pc")
def loan_pc(payload: loan_pc_payload, request: Request, db: Session = Depends(get_db), current_user: user_model = Depends(get_current_user)):
    pc = db.query(pcs_model).filter(pcs_model.serial_number == payload.serial_number).first()

    if not pc:
        raise HTTPException(status_code=404, detail="PC not found")
    

    existing_loan = db.query(pc_loan_model).filter(
        pc_loan_model.pc_id == pc.id,
        pc_loan_model.return_date.is_(None)
        ).first()
    if existing_loan:
        raise HTTPException(status_code=409, detail="Loan already active for PC")

    new_loan = pc_loan_model(
        loaner_id=payload.apprentice_ID,
        case_responsible_id=current_user.id,
        pc_id=pc.id,
        loan_date=date.today(),
        return_date=None,
    )
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)

    return {
        "status": 200,
        "message": "Enhet lånet",
        "loan": {
            "loan_id": new_loan.id,
            "pc_id": pc.id,
            "apprentice_id": payload.apprentice_ID,
            "case_responsible_id": current_user.id,
            "case_responsible_username": current_user.username,
            "loan_date": new_loan.loan_date,
        },
    }


class return_pc_payload(BaseModel):
    loan_id: int


@router.post("/api/deliver_pc")
def deliver_pc(payload: return_pc_payload, db: Session = Depends(get_db)):
    loan = db.query(pc_loan_model).filter(pc_loan_model.id == payload.loan_id).first()

    if not loan:
        raise HTTPException(status_code=404, detail="PC loan not found")
    if loan.return_date is not None:
        raise HTTPException(status_code=409, detail="PC already returned")

    loan.return_date = date.today()
    db.commit()
    db.refresh(loan)

    return {
        "status": 200,
        "message": "PC returned",
        "loan": {
            "loan_id": loan.id,
            "pc_id": loan.pc_id,
            "return_date": loan.return_date,
        },
    }






@router.get("/api/health")
def api_health_check():
    return {"status": 200}

