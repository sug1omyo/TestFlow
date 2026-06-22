from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


engine = create_engine(get_settings().database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


UNICODE_COLUMNS = {
    "users": {
        "full_name": "NVARCHAR(120) NOT NULL",
        "role": "NVARCHAR(30) NOT NULL",
    },
    "projects": {
        "name": "NVARCHAR(180) NOT NULL",
        "description": "NVARCHAR(MAX) NULL",
        "status": "NVARCHAR(40) NOT NULL",
    },
    "test_cases": {
        "module_name": "NVARCHAR(120) NOT NULL",
        "title": "NVARCHAR(180) NOT NULL",
        "precondition": "NVARCHAR(MAX) NULL",
        "test_steps": "NVARCHAR(MAX) NOT NULL",
        "expected_result": "NVARCHAR(MAX) NOT NULL",
        "actual_result": "NVARCHAR(MAX) NULL",
        "priority": "NVARCHAR(30) NOT NULL",
        "status": "NVARCHAR(30) NOT NULL",
    },
    "bugs": {
        "title": "NVARCHAR(180) NOT NULL",
        "description": "NVARCHAR(MAX) NULL",
        "steps_to_reproduce": "NVARCHAR(MAX) NOT NULL",
        "expected_result": "NVARCHAR(MAX) NOT NULL",
        "actual_result": "NVARCHAR(MAX) NOT NULL",
        "severity": "NVARCHAR(30) NOT NULL",
        "priority": "NVARCHAR(30) NOT NULL",
        "status": "NVARCHAR(30) NOT NULL",
        "assigned_to": "NVARCHAR(120) NULL",
    },
}


def ensure_unicode_columns() -> None:
    if engine.dialect.name != "mssql":
        return

    with engine.begin() as connection:
        for table_name, columns in UNICODE_COLUMNS.items():
            for column_name, column_type in columns.items():
                data_type = connection.scalar(
                    text(
                        """
                        SELECT DATA_TYPE
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_NAME = :table_name
                          AND COLUMN_NAME = :column_name
                        """
                    ),
                    {"table_name": table_name, "column_name": column_name},
                )
                if data_type in {"varchar", "char", "text"}:
                    connection.execute(
                        text(f"ALTER TABLE {table_name} ALTER COLUMN {column_name} {column_type}")
                    )


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
