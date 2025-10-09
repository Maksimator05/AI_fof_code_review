import uvicorn
from fastapi import FastAPI

from backend.app.routers.endpoints import router

app = FastAPI(
    title="AI code review API",
    debug=False
)
app.include_router(router=router)

'''
Для запуска пусть будет создан базовый каркас,
в основном приложении запускаем сервер, пути пропишим в отдельном импорте
Сейчас главное чтобы он запускался, работал и содержал какое-то подобие
документации, которую нужно подправить после утверждения интерфейса общения
'''
if __name__ == "__main__":
    uvicorn.run(
        app=app,
        host="127.0.0.1",
        port=8080,
        log_level="info"
    )
