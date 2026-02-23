from fastapi import APIRouter, status, HTTPException, Depends
from typing import List
from uuid import UUID

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.main import get_session
from src.db.models import Book
from src.books.schemas import BookCreate, BookRead, BookUpdateModel

book_router = APIRouter()


@book_router.get("/books", response_model=List[BookRead])
async def get_all_books(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Book))
    return result.scalars().all()


@book_router.post("/books", status_code=status.HTTP_201_CREATED, response_model=BookRead)
async def create_a_book(book_data: BookCreate, session: AsyncSession = Depends(get_session)):
    new_book = Book(**book_data.model_dump())
    session.add(new_book)
    await session.commit()
    await session.refresh(new_book)
    return new_book


@book_router.get("/book/{book_uid}", response_model=BookRead)
async def get_book(book_uid: UUID, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Book).where(Book.uid == book_uid))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@book_router.patch("/book/{book_uid}", response_model=BookRead)
async def update_book(
    book_uid: UUID,
    book_update_data: BookUpdateModel,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Book).where(Book.uid == book_uid))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    updates = book_update_data.model_dump(exclude_unset=True)
    for k, v in updates.items():
        setattr(book, k, v)

    session.add(book)
    await session.commit()
    await session.refresh(book)
    return book


@book_router.delete("/book/{book_uid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_uid: UUID, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Book).where(Book.uid == book_uid))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    await session.delete(book)
    await session.commit()
    return None