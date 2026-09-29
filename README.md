# Expense Tracker

Angular 22 frontend · FastAPI backend · PostgreSQL database

```
Frontend/expense-tracker   Angular app (http://localhost:4200)
Backend/                   FastAPI API (http://localhost:8000, docs at /docs)
Database/schema.sql        PostgreSQL schema + sample data
```

## 1. Database

Create the database (enter your postgres password when prompted):

```
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f Database/schema.sql
```

(The backend also creates the `expenses` table automatically on startup if it doesn't exist,
so only `CREATE DATABASE expenses_db;` is strictly required.)

## 2. Backend

```
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        # then edit .env and set your postgres password
fastapi dev app/main.py
```

### API

| Method | Path                     | Description                                   |
|--------|--------------------------|-----------------------------------------------|
| GET    | /api/expenses            | List (filters: `category`, `start`, `end`)    |
| GET    | /api/expenses/summary    | Total, count and totals per category          |
| GET    | /api/expenses/{id}       | Get one                                       |
| POST   | /api/expenses            | Create                                        |
| PUT    | /api/expenses/{id}       | Update                                        |
| DELETE | /api/expenses/{id}       | Delete                                        |

## 3. Frontend

```
cd Frontend/expense-tracker
npm install
npm start
```

Open http://localhost:4200.
