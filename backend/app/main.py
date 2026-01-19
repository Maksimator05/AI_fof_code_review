import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from backend.app.db.create_tables import create_tables
from backend.app.routers.endpoints import router

load_dotenv()
HOST_IP = os.getenv("IP")
if not HOST_IP:
    raise ValueError("IP not set in .env")

app = FastAPI(
    title="AI code review API",
    debug=True  # Включаем debug для отладки
)
app.include_router(router=router)

# ====== ИСПРАВЛЕННЫЙ CORS КОД ======
# Получаем список разрешенных origins
cors_origins_str = os.getenv("CORS_ORIGINS", "")
if cors_origins_str:
    origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]
else:
    # Стандартные origins для разработки
    origins = [
        "http://localhost:3000",      # React dev server
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://frontend:3000",       # Docker internal
    ]

print("=" * 50)
print("🔧 Настройки CORS:")
print(f"Разрешенные origins: {origins}")
print("=" * 50)

# Добавляем middleware с правильными настройками
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Список разрешенных origins
    allow_credentials=True,  # Разрешаем cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Явно указываем методы
    allow_headers=[
        "Authorization", 
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],  # Явно указываем заголовки
    expose_headers=["*"],  # Экспонируем все заголовки
    max_age=3600,  # Кэшируем preflight на 1 час
)

create_tables()

# Добавляем middleware для обработки OPTIONS запросов
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    
    # Добавляем CORS заголовки ко всем ответам
    origin = request.headers.get("origin")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# Явно добавляем обработчик OPTIONS для всех путей
@app.options("/{path:path}")
async def options_handler(path: str):
    return {
        "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allowed_headers": ["*"],
        "allow_credentials": True
    }

if __name__ == "__main__":
    uvicorn.run(
        app=app,
        host=HOST_IP,
        port=8080,
        log_level="debug"  # Включаем подробные логи
    )