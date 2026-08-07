from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from models import Users as user_model, Books as books_model, PCs as pcs_model, Apprentices as apprentices_model, Book_loans as book_loans_model, PC_loans as pc_loans_model
from app import Base, Session_local, engine
app = FastAPI()

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


@app.get("/api/health")
def api_health_check():
    return {"status": "200"}

