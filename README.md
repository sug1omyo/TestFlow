# TestFlow

TestFlow is a simple Test Case and Bug Report management system.

## Stack

- Frontend: ReactJS + TailwindCSS
- Backend: Python FastAPI
- Database: SQL Server
- DB Tool: SSMS

## Features

- Login
- Dashboard
- Project management
- Test Case management
- Bug Report management

## Database

The first version uses only 4 tables:

- `users`
- `projects`
- `test_cases`
- `bugs`

The backend creates tables automatically with SQLAlchemy when the API starts.

Default demo accounts are seeded when the `users` table is empty:

| Username | Password | Role |
| --- | --- | --- |
| admin | admin123 | Admin |
| tester | tester123 | Tester |
| dev | dev123 | Developer |

## Backend API

- `POST /login`
- `GET /dashboard/summary`
- `GET /projects`
- `POST /projects`
- `PUT /projects/{id}`
- `DELETE /projects/{id}`
- `GET /test-cases`
- `POST /test-cases`
- `PUT /test-cases/{id}`
- `DELETE /test-cases/{id}`
- `GET /bugs`
- `POST /bugs`
- `PUT /bugs/{id}`
- `DELETE /bugs/{id}`

## Run Backend

1. Create a SQL Server database named `TestFlow`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Update `DATABASE_URL` for your SQL Server instance.
4. Install dependencies:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

5. Install frontend dependencies once:

```powershell
cd ..\frontend
npm install
cd ..\backend
```

6. Run the API:

```powershell
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.
In development, the backend also starts the frontend automatically and opens `http://127.0.0.1:5173`.

## Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

The web app runs at `http://127.0.0.1:5173`.

If the backend is not running, the frontend can still show demo data locally.

You can disable automatic frontend startup by setting `AUTO_START_FRONTEND=false` in `backend/.env`.
You can disable automatic browser opening by setting `AUTO_OPEN_BROWSER=false`.
