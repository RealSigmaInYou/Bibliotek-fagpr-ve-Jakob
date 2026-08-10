import os
import dotenv
from datetime import datetime, timedelta, timezone
import jwt
from argon2 import PasswordHasher
dotenv.load_dotenv()

PH = PasswordHasher()
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")

if not JWT_SECRET:
    print("JWT not found")



def hash_password(password: str) -> str:
    return PH.hash(password)


def authenticate_user(stored_hash: str, password: str) -> bool:
    try:
        return PH.verify(stored_hash, password)
    except Exception:
        return False


def create_token(username: str, role: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "role": role
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

