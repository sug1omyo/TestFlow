from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas


def seed_users(db: Session) -> None:
    has_user = db.scalar(select(func.count()).select_from(models.User)) or 0
    if has_user:
        return

    db.add_all(
        [
            models.User(username="admin", password="admin123", full_name="System Admin", role="Admin"),
            models.User(username="tester", password="tester123", full_name="Demo Tester", role="Tester"),
            models.User(username="dev", password="dev123", full_name="Demo Developer", role="Developer"),
        ]
    )
    db.commit()


def login(db: Session, payload: schemas.LoginRequest) -> models.User | None:
    statement = select(models.User).where(
        models.User.username == payload.username,
        models.User.password == payload.password,
    )
    return db.scalar(statement)


def list_projects(db: Session) -> list[models.Project]:
    return list(db.scalars(select(models.Project).order_by(models.Project.created_at.desc())))


def get_project(db: Session, project_id: int) -> models.Project | None:
    return db.get(models.Project, project_id)


def create_project(db: Session, payload: schemas.ProjectCreate) -> models.Project:
    project = models.Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: models.Project, payload: schemas.ProjectUpdate) -> models.Project:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: models.Project) -> None:
    db.delete(project)
    db.commit()


def list_test_cases(db: Session) -> list[models.TestCase]:
    return list(db.scalars(select(models.TestCase).order_by(models.TestCase.created_at.desc())))


def get_test_case(db: Session, test_case_id: int) -> models.TestCase | None:
    return db.get(models.TestCase, test_case_id)


def create_test_case(db: Session, payload: schemas.TestCaseCreate) -> models.TestCase:
    test_case = models.TestCase(**payload.model_dump())
    db.add(test_case)
    db.commit()
    db.refresh(test_case)
    return test_case


def update_test_case(db: Session, test_case: models.TestCase, payload: schemas.TestCaseUpdate) -> models.TestCase:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(test_case, field, value)
    db.commit()
    db.refresh(test_case)
    return test_case


def delete_test_case(db: Session, test_case: models.TestCase) -> None:
    db.delete(test_case)
    db.commit()


def list_bugs(db: Session) -> list[models.Bug]:
    return list(db.scalars(select(models.Bug).order_by(models.Bug.created_at.desc())))


def get_bug(db: Session, bug_id: int) -> models.Bug | None:
    return db.get(models.Bug, bug_id)


def create_bug(db: Session, payload: schemas.BugCreate) -> models.Bug:
    bug = models.Bug(**payload.model_dump())
    db.add(bug)
    db.commit()
    db.refresh(bug)
    return bug


def update_bug(db: Session, bug: models.Bug, payload: schemas.BugUpdate) -> models.Bug:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(bug, field, value)
    db.commit()
    db.refresh(bug)
    return bug


def delete_bug(db: Session, bug: models.Bug) -> None:
    db.delete(bug)
    db.commit()


def get_dashboard_summary(db: Session) -> schemas.DashboardSummary:
    total_projects = db.scalar(select(func.count()).select_from(models.Project)) or 0
    total_test_cases = db.scalar(select(func.count()).select_from(models.TestCase)) or 0
    passed_test_cases = (
        db.scalar(select(func.count()).select_from(models.TestCase).where(models.TestCase.status == "Pass")) or 0
    )
    failed_test_cases = (
        db.scalar(select(func.count()).select_from(models.TestCase).where(models.TestCase.status == "Fail")) or 0
    )
    open_bugs = (
        db.scalar(
            select(func.count())
            .select_from(models.Bug)
            .where(models.Bug.status.in_(["New", "In Progress"]))
        )
        or 0
    )
    fixed_bugs = db.scalar(select(func.count()).select_from(models.Bug).where(models.Bug.status == "Fixed")) or 0

    return schemas.DashboardSummary(
        total_projects=total_projects,
        total_test_cases=total_test_cases,
        passed_test_cases=passed_test_cases,
        failed_test_cases=failed_test_cases,
        open_bugs=open_bugs,
        fixed_bugs=fixed_bugs,
    )
