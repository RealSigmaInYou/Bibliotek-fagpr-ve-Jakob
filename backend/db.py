from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()


POSTGRES_PW = os.getenv("postgres_pw")
DB_NAME = os.getenv("db_name")
POSTGRES_HOST = os.getenv("postgres_host")
POSTGRES_PORT = os.getenv("postgres_port")

engine = create_engine(
    f"postgresql+psycopg2://postgres:{POSTGRES_PW}@{POSTGRES_HOST}:{POSTGRES_PORT}/{DB_NAME}"
)

Base = declarative_base()
Session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base.metadata.create_all(engine)
