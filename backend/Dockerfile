FROM python:3.12-slim

WORKDIR /

COPY requirements.txt .

RUN python -m pip install --upgrade pip
RUN pip install -r requirements.txt

COPY app /backend/app

CMD ["python", "-m", "backend.app.main"]