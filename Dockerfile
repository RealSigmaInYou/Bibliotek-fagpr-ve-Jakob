# Dockerfile for the backend

FROM python:3.14
WORKDIR /code
COPY ./backend /code
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]