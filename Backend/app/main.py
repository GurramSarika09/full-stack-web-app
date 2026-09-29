from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import models, schemas
from .config import settings
from .database import Base, engine, get_db

# Creates the table if it doesn't exist (see Database/schema.sql for the equivalent SQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _filtered(stmt, category: str | None, start: date | None, end: date | None):
    if category:
        stmt = stmt.where(models.Expense.category == category)
    if start:
        stmt = stmt.where(models.Expense.expense_date >= start)
    if end:
        stmt = stmt.where(models.Expense.expense_date <= end)
    return stmt


def _get_or_404(db: Session, expense_id: int) -> models.Expense:
    expense = db.get(models.Expense, expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/expenses", response_model=list[schemas.ExpenseRead])
def list_expenses(
    category: str | None = None,
    start: date | None = None,
    end: date | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(models.Expense).order_by(models.Expense.expense_date.desc(), models.Expense.id.desc())
    return db.scalars(_filtered(stmt, category, start, end)).all()


@app.get("/api/expenses/summary", response_model=schemas.Summary)
def summary(
    category: str | None = None,
    start: date | None = None,
    end: date | None = None,
    db: Session = Depends(get_db),
):
    stmt = _filtered(
        select(models.Expense.category, func.sum(models.Expense.amount), func.count())
        .group_by(models.Expense.category)
        .order_by(func.sum(models.Expense.amount).desc()),
        category, start, end,
    )
    rows = db.execute(stmt).all()
    return schemas.Summary(
        total=sum((r[1] for r in rows), 0),
        count=sum(r[2] for r in rows),
        by_category=[schemas.CategoryTotal(category=r[0], total=r[1]) for r in rows],
    )


@app.get("/api/expenses/{expense_id}", response_model=schemas.ExpenseRead)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, expense_id)


@app.post("/api/expenses", response_model=schemas.ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(payload: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    expense = models.Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@app.put("/api/expenses/{expense_id}", response_model=schemas.ExpenseRead)
def update_expense(expense_id: int, payload: schemas.ExpenseUpdate, db: Session = Depends(get_db)):
    expense = _get_or_404(db, expense_id)
    for key, value in payload.model_dump().items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


@app.delete("/api/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db.delete(_get_or_404(db, expense_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
