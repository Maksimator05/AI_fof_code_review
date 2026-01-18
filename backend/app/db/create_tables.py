from app.db.database import engine, Base
from app.models import *

def create_tables():
    Base.metadata.create_all(bind=engine)