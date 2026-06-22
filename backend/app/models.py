from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Unicode, UnicodeText, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), nullable=False)
    full_name: Mapped[str] = mapped_column(Unicode(120), nullable=False)
    role: Mapped[str] = mapped_column(Unicode(30), default="Tester", nullable=False)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(Unicode(180), nullable=False)
    description: Mapped[str | None] = mapped_column(UnicodeText)
    status: Mapped[str] = mapped_column(Unicode(40), default="Active", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    test_cases: Mapped[list["TestCase"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    bugs: Mapped[list["Bug"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class TestCase(Base):
    __tablename__ = "test_cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    test_case_code: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    module_name: Mapped[str] = mapped_column(Unicode(120), nullable=False)
    title: Mapped[str] = mapped_column(Unicode(180), nullable=False)
    precondition: Mapped[str | None] = mapped_column(UnicodeText)
    test_steps: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    expected_result: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    actual_result: Mapped[str | None] = mapped_column(UnicodeText)
    priority: Mapped[str] = mapped_column(Unicode(30), default="Medium", nullable=False)
    status: Mapped[str] = mapped_column(Unicode(30), default="Not Run", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    project: Mapped[Project] = relationship(back_populates="test_cases")
    bugs: Mapped[list["Bug"]] = relationship(back_populates="test_case")


class Bug(Base):
    __tablename__ = "bugs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    bug_code: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    test_case_id: Mapped[int | None] = mapped_column(ForeignKey("test_cases.id"))
    title: Mapped[str] = mapped_column(Unicode(180), nullable=False)
    description: Mapped[str | None] = mapped_column(UnicodeText)
    steps_to_reproduce: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    expected_result: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    actual_result: Mapped[str] = mapped_column(UnicodeText, nullable=False)
    severity: Mapped[str] = mapped_column(Unicode(30), default="Major", nullable=False)
    priority: Mapped[str] = mapped_column(Unicode(30), default="Medium", nullable=False)
    status: Mapped[str] = mapped_column(Unicode(30), default="New", nullable=False)
    assigned_to: Mapped[str | None] = mapped_column(Unicode(120))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    project: Mapped[Project] = relationship(back_populates="bugs")
    test_case: Mapped[TestCase | None] = relationship(back_populates="bugs")
