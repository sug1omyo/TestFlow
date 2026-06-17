from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    token: str


class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    status: str = "Active"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None


class ProjectRead(ProjectBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TestCaseBase(BaseModel):
    test_case_code: str
    project_id: int
    module_name: str
    title: str
    precondition: str | None = None
    test_steps: str
    expected_result: str
    actual_result: str | None = None
    priority: str = "Medium"
    status: str = "Not Run"


class TestCaseCreate(TestCaseBase):
    pass


class TestCaseUpdate(BaseModel):
    test_case_code: str | None = None
    project_id: int | None = None
    module_name: str | None = None
    title: str | None = None
    precondition: str | None = None
    test_steps: str | None = None
    expected_result: str | None = None
    actual_result: str | None = None
    priority: str | None = None
    status: str | None = None


class TestCaseRead(TestCaseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BugBase(BaseModel):
    bug_code: str
    project_id: int
    test_case_id: int | None = None
    title: str
    description: str | None = None
    steps_to_reproduce: str
    expected_result: str
    actual_result: str
    severity: str = "Major"
    priority: str = "Medium"
    status: str = "New"
    assigned_to: str | None = None


class BugCreate(BugBase):
    pass


class BugUpdate(BaseModel):
    bug_code: str | None = None
    project_id: int | None = None
    test_case_id: int | None = None
    title: str | None = None
    description: str | None = None
    steps_to_reproduce: str | None = None
    expected_result: str | None = None
    actual_result: str | None = None
    severity: str | None = None
    priority: str | None = None
    status: str | None = None
    assigned_to: str | None = None


class BugRead(BugBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardSummary(BaseModel):
    total_projects: int
    total_test_cases: int
    passed_test_cases: int
    failed_test_cases: int
    open_bugs: int
    fixed_bugs: int
