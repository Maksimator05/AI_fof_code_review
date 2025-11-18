FROM python:3.12

WORKDIR /

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY app /backend/app

CMD ["python", "-m", "backend.app.main"]