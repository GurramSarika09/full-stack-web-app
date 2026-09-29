-- Run as the postgres superuser:
--   psql -U postgres -f Database/schema.sql
CREATE DATABASE expenses_db;

\connect expenses_db

CREATE TABLE IF NOT EXISTS expenses (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(120)   NOT NULL,
    amount       NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category     VARCHAR(50)    NOT NULL,
    expense_date DATE           NOT NULL,
    notes        VARCHAR(500),
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_expenses_category     ON expenses (category);
CREATE INDEX IF NOT EXISTS ix_expenses_expense_date ON expenses (expense_date);

-- Optional sample data
INSERT INTO expenses (title, amount, category, expense_date, notes) VALUES
    ('Groceries',     54.20, 'Food',          CURRENT_DATE - 2, 'Weekly shop'),
    ('Bus pass',      30.00, 'Transport',     CURRENT_DATE - 5, NULL),
    ('Electricity',   72.45, 'Bills',         CURRENT_DATE - 9, 'Monthly bill'),
    ('Movie night',   18.00, 'Entertainment', CURRENT_DATE - 1, NULL);
