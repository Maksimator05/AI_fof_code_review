# backend/app/main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
HOST_IP = os.getenv("IP", "127.0.0.1")

app = FastAPI(
    title="AI code review API",
    debug=True  # Включите для разработки
)

# Исправьте CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",  # Без https
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Импортируем router
from app.routers.endpoints import router
app.include_router(router=router)

# Импортируем и запускаем создание таблиц
from app.db.create_tables import create_tables
create_tables()

@app.get("/")
async def root():
    return {"message": "AI Code Review API is running"}

# Этот блок не нужен т к используем run.py
# if __name__ == "__main__":
#     uvicorn.run(
#         app=app,
#         host=HOST_IP,
#         port=8080,
#         log_level="info"
#     )