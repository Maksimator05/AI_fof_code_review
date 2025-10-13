import uvicorn
from fastapi import FastAPI

from backend.app.routers.endpoints import router

app = FastAPI(
    title="AI code review API",
    debug=False
)
app.include_router(router=router)


if __name__ == "__main__":
    uvicorn.run(
        app=app,
        host="127.0.0.1",
        port=8080,
        log_level="info"
    )
