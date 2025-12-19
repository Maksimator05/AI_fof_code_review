import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.db.create_tables import create_tables
from backend.app.routers.endpoints import router

app = FastAPI(
    title="AI code review API",
    debug=False
)
app.include_router(router=router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://127.0.0.1:3000",
        "https://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

create_tables()


if __name__ == "__main__":
    uvicorn.run(
        app=app,
        host="127.0.0.1",
        port=8080,
        log_level="info"
    )
