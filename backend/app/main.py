from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.config import get_settings
from app.database import Base, SessionLocal, engine, get_db

settings = get_settings()

Base.metadata.create_all(bind=engine)
with SessionLocal() as seed_db:
    crud.seed_users(seed_db)

app = FastAPI(title="TestFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "TestFlow API"}


@app.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)) -> schemas.LoginResponse:
    user = crud.login(db, payload)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    return schemas.LoginResponse(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        token=f"demo-token-{user.id}",
    )


@app.get("/dashboard/summary", response_model=schemas.DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)) -> schemas.DashboardSummary:
    return crud.get_dashboard_summary(db)


@app.get("/projects", response_model=list[schemas.ProjectRead])
def list_projects(db: Session = Depends(get_db)) -> list[models.Project]:
    return crud.list_projects(db)


@app.post("/projects", response_model=schemas.ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)) -> models.Project:
    return crud.create_project(db, payload)


@app.put("/projects/{project_id}", response_model=schemas.ProjectRead)
def update_project(project_id: int, payload: schemas.ProjectUpdate, db: Session = Depends(get_db)) -> models.Project:
    project = crud.get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return crud.update_project(db, project, payload)


@app.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)) -> None:
    project = crud.get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    crud.delete_project(db, project)


@app.get("/test-cases", response_model=list[schemas.TestCaseRead])
def list_test_cases(db: Session = Depends(get_db)) -> list[models.TestCase]:
    return crud.list_test_cases(db)


@app.post("/test-cases", response_model=schemas.TestCaseRead, status_code=status.HTTP_201_CREATED)
def create_test_case(payload: schemas.TestCaseCreate, db: Session = Depends(get_db)) -> models.TestCase:
    if crud.get_project(db, payload.project_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project does not exist")
    return crud.create_test_case(db, payload)


@app.put("/test-cases/{test_case_id}", response_model=schemas.TestCaseRead)
def update_test_case(
    test_case_id: int,
    payload: schemas.TestCaseUpdate,
    db: Session = Depends(get_db),
) -> models.TestCase:
    test_case = crud.get_test_case(db, test_case_id)
    if test_case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test case not found")
    if payload.project_id is not None and crud.get_project(db, payload.project_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project does not exist")
    return crud.update_test_case(db, test_case, payload)


@app.delete("/test-cases/{test_case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test_case(test_case_id: int, db: Session = Depends(get_db)) -> None:
    test_case = crud.get_test_case(db, test_case_id)
    if test_case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test case not found")
    crud.delete_test_case(db, test_case)


@app.get("/bugs", response_model=list[schemas.BugRead])
def list_bugs(db: Session = Depends(get_db)) -> list[models.Bug]:
    return crud.list_bugs(db)


@app.post("/bugs", response_model=schemas.BugRead, status_code=status.HTTP_201_CREATED)
def create_bug(payload: schemas.BugCreate, db: Session = Depends(get_db)) -> models.Bug:
    if crud.get_project(db, payload.project_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project does not exist")
    if payload.test_case_id is not None and crud.get_test_case(db, payload.test_case_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Test case does not exist")
    return crud.create_bug(db, payload)


@app.put("/bugs/{bug_id}", response_model=schemas.BugRead)
def update_bug(bug_id: int, payload: schemas.BugUpdate, db: Session = Depends(get_db)) -> models.Bug:
    bug = crud.get_bug(db, bug_id)
    if bug is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")
    if payload.project_id is not None and crud.get_project(db, payload.project_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project does not exist")
    if payload.test_case_id is not None and crud.get_test_case(db, payload.test_case_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Test case does not exist")
    return crud.update_bug(db, bug, payload)


@app.delete("/bugs/{bug_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bug(bug_id: int, db: Session = Depends(get_db)) -> None:
    bug = crud.get_bug(db, bug_id)
    if bug is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")
    crud.delete_bug(db, bug)
