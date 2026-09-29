from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ExpenseBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    category: str = Field(min_length=1, max_length=50)
    expense_date: date
    notes: str | None = Field(default=None, max_length=500)


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    pass


class ExpenseRead(ExpenseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class CategoryTotal(BaseModel):
    category: str
    total: Decimal


class Summary(BaseModel):
    total: Decimal
    count: int
    by_category: list[CategoryTotal]
