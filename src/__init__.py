from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.books.routes import book_router
from src.db.main import initdb

@asynccontextmanager
async def lifespan(app: FastAPI):
    await initdb()
    yield
    print("server is stopping")

version = 'v1'

app = FastAPI(
    title="Bookly",
    description="A REST API for a book review web service",
    version= version,
    lifespan=lifespan
)

app.include_router(book_router, prefix=f"/api/{version}", tags=['books'])

