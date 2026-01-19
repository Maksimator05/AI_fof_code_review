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
    debug=False
)
app.include_router(router=router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()


if __name__ == "__main__":
    uvicorn.run(
        app=app,
        host=HOST_IP,
        port=8080,
        log_level="info"
    )
