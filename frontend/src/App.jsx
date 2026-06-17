import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { api } from './api'

const demoProjects = [
  {
    id: 1,
    name: 'Web quan ly ban hang',
    description: 'Demo project for sales management website',
    status: 'Active',
    created_at: '2026-06-17T08:00:00',
  },
]

const demoTestCases = [
  {
    id: 1,
    test_case_code: 'TC-001',
    project_id: 1,
    module_name: 'Dang nhap',
    title: 'Kiem tra dang nhap sai mat khau',
    precondition: 'User da ton tai trong he thong',
    test_steps: 'Nhap username dung, password sai, bam Dang nhap',
    expected_result: 'He thong hien thong bao sai mat khau',
    actual_result: 'Khong hien thong bao loi',
    priority: 'High',
    status: 'Fail',
    created_at: '2026-06-17T09:00:00',
  },
]

const demoBugs = [
  {
    id: 1,
    bug_code: 'BUG-001',
    project_id: 1,
    test_case_id: 1,
    title: 'Khong hien thong bao sai mat khau',
    description: 'Login form khong phan hoi khi nhap sai mat khau',
    steps_to_reproduce: 'Mo man hinh login, nhap password sai, bam Dang nhap',
    expected_result: 'Hien thong bao sai mat khau',
    actual_result: 'Form khong hien thong bao',
    severity: 'Major',
    priority: 'High',
    status: 'New',
    assigned_to: 'Developer',
    created_at: '2026-06-17T10:00:00',
  },
]

const emptyProject = { name: '', description: '', status: 'Active' }
const emptyTestCase = {
  test_case_code: '',
  project_id: '',
  module_name: '',
  title: '',
  precondition: '',
  test_steps: '',
  expected_result: '',
  actual_result: '',
  priority: 'Medium',
  status: 'Not Run',
}
const emptyBug = {
  bug_code: '',
  project_id: '',
  test_case_id: '',
  title: '',
  description: '',
  steps_to_reproduce: '',
  expected_result: '',
  actual_result: '',
  severity: 'Major',
  priority: 'Medium',
  status: 'New',
  assigned_to: '',
}

function App() {
  const [user, setUser] = useState(() => readSession())
  const [activePage, setActivePage] = useState('dashboard')
  const [projects, setProjects] = useState([])
  const [testCases, setTestCases] = useState([])
  const [bugs, setBugs] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const [modal, setModal] = useState(null)

  async function loadData() {
    if (!user) return
    setLoading(true)
    try {
      const [summaryData, projectData, testCaseData, bugData] = await Promise.all([
        api.getDashboard(),
        api.listProjects(),
        api.listTestCases(),
        api.listBugs(),
      ])
      setSummary(summaryData)
      setProjects(projectData)
      setTestCases(testCaseData)
      setBugs(bugData)
      setOffline(false)
    } catch {
      setProjects(demoProjects)
      setTestCases(demoTestCases)
      setBugs(demoBugs)
      setSummary(buildSummary(demoProjects, demoTestCases, demoBugs))
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  async function handleLogin(payload) {
    try {
      const account = await api.login(payload)
      saveSession(account)
      setUser(account)
      setOffline(false)
    } catch {
      if (payload.username === 'admin' && payload.password === 'admin123') {
        const account = {
          id: 1,
          username: 'admin',
          full_name: 'System Admin',
          role: 'Admin',
          token: 'demo-token-local',
        }
        saveSession(account)
        setUser(account)
        setOffline(true)
        return
      }
      throw new Error('Sai tai khoan hoac mat khau')
    }
  }

  function handleLogout() {
    localStorage.removeItem('testflow_user')
    setUser(null)
  }

  async function saveRecord(type, payload, id) {
    const normalized = normalizePayload(type, payload)

    if (offline) {
      applyLocalSave(type, normalized, id)
      setModal(null)
      return
    }

    if (type === 'project') {
      id ? await api.updateProject(id, normalized) : await api.createProject(normalized)
    }
    if (type === 'testcase') {
      id ? await api.updateTestCase(id, normalized) : await api.createTestCase(normalized)
    }
    if (type === 'bug') {
      id ? await api.updateBug(id, normalized) : await api.createBug(normalized)
    }

    setModal(null)
    await loadData()
  }

  async function deleteRecord(type, id) {
    if (offline) {
      applyLocalDelete(type, id)
      return
    }

    if (type === 'project') await api.deleteProject(id)
    if (type === 'testcase') await api.deleteTestCase(id)
    if (type === 'bug') await api.deleteBug(id)
    await loadData()
  }

  function applyLocalSave(type, payload, id) {
    const created_at = new Date().toISOString()
    const upsert = (items) =>
      id
        ? items.map((item) => (item.id === id ? { ...item, ...payload } : item))
        : [{ ...payload, id: Date.now(), created_at }, ...items]

    if (type === 'project') setProjects(upsert)
    if (type === 'testcase') setTestCases(upsert)
    if (type === 'bug') setBugs(upsert)
  }

  function applyLocalDelete(type, id) {
    if (type === 'project') setProjects((items) => items.filter((item) => item.id !== id))
    if (type === 'testcase') setTestCases((items) => items.filter((item) => item.id !== id))
    if (type === 'bug') setBugs((items) => items.filter((item) => item.id !== id))
  }

  const computedSummary = useMemo(
    () => (offline ? buildSummary(projects, testCases, bugs) : summary || buildSummary(projects, testCases, bugs)),
    [offline, summary, projects, testCases, bugs],
  )

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center border-b border-line px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-sm font-bold text-white">TF</div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold leading-5">TestFlow</h1>
            <p className="text-xs text-muted">Test case & bug report</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          <NavButton icon={LayoutDashboard} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavButton icon={FolderKanban} label="Projects" active={activePage === 'projects'} onClick={() => setActivePage('projects')} />
          <NavButton icon={ClipboardList} label="Test Cases" active={activePage === 'testcases'} onClick={() => setActivePage('testcases')} />
          <NavButton icon={Bug} label="Bugs" active={activePage === 'bugs'} onClick={() => setActivePage('bugs')} />
        </nav>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">He thong quan ly Test Case & Bug Report</p>
              <h2 className="text-2xl font-semibold">{pageTitle(activePage)}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-10 items-center gap-2 rounded border border-line bg-white px-3 text-sm">
                <User className="h-4 w-4 text-muted" />
                <span>{user.full_name}</span>
                <Badge value={user.role} />
              </div>
              <button className="button-secondary" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 lg:hidden">
            <MobileTab label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
            <MobileTab label="Projects" active={activePage === 'projects'} onClick={() => setActivePage('projects')} />
            <MobileTab label="Test Cases" active={activePage === 'testcases'} onClick={() => setActivePage('testcases')} />
            <MobileTab label="Bugs" active={activePage === 'bugs'} onClick={() => setActivePage('bugs')} />
          </div>
        </header>

        {offline && (
          <div className="mx-4 mt-4 rounded border border-warning/30 bg-amber-50 px-4 py-3 text-sm text-warning lg:mx-8">
            Backend chua ket noi duoc. Dang dung du lieu demo cuc bo.
          </div>
        )}

        <section className="px-4 py-6 lg:px-8">
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && <Dashboard summary={computedSummary} projects={projects} testCases={testCases} bugs={bugs} />}
              {activePage === 'projects' && (
                <ProjectsPage projects={projects} onAdd={() => setModal({ type: 'project' })} onEdit={(item) => setModal({ type: 'project', item })} onDelete={deleteRecord} />
              )}
              {activePage === 'testcases' && (
                <TestCasesPage
                  projects={projects}
                  testCases={testCases}
                  onAdd={() => setModal({ type: 'testcase' })}
                  onEdit={(item) => setModal({ type: 'testcase', item })}
                  onDelete={deleteRecord}
                />
              )}
              {activePage === 'bugs' && (
                <BugsPage
                  projects={projects}
                  testCases={testCases}
                  bugs={bugs}
                  onAdd={() => setModal({ type: 'bug' })}
                  onEdit={(item) => setModal({ type: 'bug', item })}
                  onDelete={deleteRecord}
                />
              )}
            </>
          )}
        </section>
      </main>

      {modal?.type === 'project' && (
        <ProjectModal item={modal.item} onClose={() => setModal(null)} onSubmit={(payload) => saveRecord('project', payload, modal.item?.id)} />
      )}
      {modal?.type === 'testcase' && (
        <TestCaseModal
          item={modal.item}
          projects={projects}
          onClose={() => setModal(null)}
          onSubmit={(payload) => saveRecord('testcase', payload, modal.item?.id)}
        />
      )}
      {modal?.type === 'bug' && (
        <BugModal
          item={modal.item}
          projects={projects}
          testCases={testCases}
          onClose={() => setModal(null)}
          onSubmit={(payload) => saveRecord('bug', payload, modal.item?.id)}
        />
      )}
    </div>
  )
}

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onLogin(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form className="w-full max-w-sm rounded border border-line bg-white p-6 shadow-soft" onSubmit={submit}>
        <div className="mb-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded bg-primary text-sm font-bold text-white">TF</div>
          <h1 className="text-2xl font-semibold">Login TestFlow</h1>
          <p className="mt-1 text-sm text-muted">Demo account: admin / admin123</p>
        </div>
        <Field label="Username" value={form.username} onChange={(value) => setForm({ ...form, username: value })} required />
        <div className="mt-4">
          <Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required />
        </div>
        {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <button className="button-primary mt-6 w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
          <span>Login</span>
        </button>
      </form>
    </div>
  )
}

function Dashboard({ summary, projects, testCases, bugs }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Metric icon={FolderKanban} label="Projects" value={summary.total_projects} tone="primary" />
        <Metric icon={ClipboardList} label="Test cases" value={summary.total_test_cases} tone="primary" />
        <Metric icon={CheckCircle2} label="Pass" value={summary.passed_test_cases} tone="success" />
        <Metric icon={AlertTriangle} label="Fail" value={summary.failed_test_cases} tone="danger" />
        <Metric icon={Bug} label="Open bugs" value={summary.open_bugs} tone="warning" />
        <Metric icon={CheckCircle2} label="Fixed bugs" value={summary.fixed_bugs} tone="success" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <PreviewList title="Projects moi" rows={projects} empty="Chua co project" render={(item) => <RowTitle title={item.name} meta={item.status} />} />
        <PreviewList title="Test case moi" rows={testCases} empty="Chua co test case" render={(item) => <RowTitle title={item.title} meta={`${item.test_case_code} - ${item.status}`} />} />
        <PreviewList title="Bug moi" rows={bugs} empty="Chua co bug" render={(item) => <RowTitle title={item.title} meta={`${item.bug_code} - ${item.status}`} />} />
      </div>
    </div>
  )
}

function ProjectsPage({ projects, onAdd, onEdit, onDelete }) {
  return (
    <CrudPage title="Projects" onAdd={onAdd} addLabel="Project">
      <Table
        headers={['Name', 'Description', 'Status', 'Created']}
        rows={projects}
        empty="Chua co project."
        render={(item) => [
          item.name,
          item.description || '-',
          <Badge value={item.status} />,
          formatDate(item.created_at),
        ]}
        onEdit={onEdit}
        onDelete={(id) => onDelete('project', id)}
      />
    </CrudPage>
  )
}

function TestCasesPage({ projects, testCases, onAdd, onEdit, onDelete }) {
  return (
    <CrudPage title="Test Cases" onAdd={onAdd} addLabel="Test Case">
      <Table
        headers={['Code', 'Project', 'Module', 'Title', 'Priority', 'Status']}
        rows={testCases}
        empty="Chua co test case."
        render={(item) => [
          item.test_case_code,
          findProjectName(projects, item.project_id),
          item.module_name,
          item.title,
          <Badge value={item.priority} />,
          <Badge value={item.status} />,
        ]}
        onEdit={onEdit}
        onDelete={(id) => onDelete('testcase', id)}
      />
    </CrudPage>
  )
}

function BugsPage({ projects, testCases, bugs, onAdd, onEdit, onDelete }) {
  return (
    <CrudPage title="Bugs" onAdd={onAdd} addLabel="Bug">
      <Table
        headers={['Code', 'Project', 'Test Case', 'Title', 'Severity', 'Priority', 'Status']}
        rows={bugs}
        empty="Chua co bug."
        render={(item) => [
          item.bug_code,
          findProjectName(projects, item.project_id),
          findTestCaseCode(testCases, item.test_case_id),
          item.title,
          <Badge value={item.severity} />,
          <Badge value={item.priority} />,
          <Badge value={item.status} />,
        ]}
        onEdit={onEdit}
        onDelete={(id) => onDelete('bug', id)}
      />
    </CrudPage>
  )
}

function ProjectModal({ item, onClose, onSubmit }) {
  const [form, setForm] = useState(item || emptyProject)
  return (
    <Modal title={item ? 'Edit Project' : 'Create Project'} onClose={onClose} onSubmit={() => onSubmit(form)}>
      <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
      <TextArea label="Description" value={form.description || ''} onChange={(value) => setForm({ ...form, description: value })} />
      <Select label="Status" value={form.status} options={['Active', 'Inactive', 'Done']} onChange={(value) => setForm({ ...form, status: value })} />
    </Modal>
  )
}

function TestCaseModal({ item, projects, onClose, onSubmit }) {
  const [form, setForm] = useState(item || { ...emptyTestCase, project_id: projects[0]?.id || '' })
  return (
    <Modal title={item ? 'Edit Test Case' : 'Create Test Case'} onClose={onClose} onSubmit={() => onSubmit(form)}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Code" value={form.test_case_code} onChange={(value) => setForm({ ...form, test_case_code: value })} required />
        <ProjectSelect projects={projects} value={form.project_id} onChange={(value) => setForm({ ...form, project_id: value })} />
        <Field label="Module" value={form.module_name} onChange={(value) => setForm({ ...form, module_name: value })} required />
      </div>
      <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
      <TextArea label="Precondition" value={form.precondition || ''} onChange={(value) => setForm({ ...form, precondition: value })} />
      <TextArea label="Test steps" value={form.test_steps} onChange={(value) => setForm({ ...form, test_steps: value })} required />
      <TextArea label="Expected result" value={form.expected_result} onChange={(value) => setForm({ ...form, expected_result: value })} required />
      <TextArea label="Actual result" value={form.actual_result || ''} onChange={(value) => setForm({ ...form, actual_result: value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Priority" value={form.priority} options={['Low', 'Medium', 'High', 'Critical']} onChange={(value) => setForm({ ...form, priority: value })} />
        <Select label="Status" value={form.status} options={['Not Run', 'Pass', 'Fail', 'Blocked']} onChange={(value) => setForm({ ...form, status: value })} />
      </div>
    </Modal>
  )
}

function BugModal({ item, projects, testCases, onClose, onSubmit }) {
  const [form, setForm] = useState(item || { ...emptyBug, project_id: projects[0]?.id || '', test_case_id: testCases[0]?.id || '' })
  return (
    <Modal title={item ? 'Edit Bug' : 'Create Bug'} onClose={onClose} onSubmit={() => onSubmit(form)}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Code" value={form.bug_code} onChange={(value) => setForm({ ...form, bug_code: value })} required />
        <ProjectSelect projects={projects} value={form.project_id} onChange={(value) => setForm({ ...form, project_id: value })} />
        <label className="block">
          <span className="field-label">Test case</span>
          <select className="field-input" value={form.test_case_id || ''} onChange={(event) => setForm({ ...form, test_case_id: event.target.value })}>
            <option value="">No link</option>
            {testCases.map((testCase) => (
              <option key={testCase.id} value={testCase.id}>{testCase.test_case_code}</option>
            ))}
          </select>
        </label>
      </div>
      <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
      <TextArea label="Description" value={form.description || ''} onChange={(value) => setForm({ ...form, description: value })} />
      <TextArea label="Steps to reproduce" value={form.steps_to_reproduce} onChange={(value) => setForm({ ...form, steps_to_reproduce: value })} required />
      <TextArea label="Expected result" value={form.expected_result} onChange={(value) => setForm({ ...form, expected_result: value })} required />
      <TextArea label="Actual result" value={form.actual_result} onChange={(value) => setForm({ ...form, actual_result: value })} required />
      <div className="grid gap-4 sm:grid-cols-4">
        <Select label="Severity" value={form.severity} options={['Minor', 'Major', 'Critical', 'Blocker']} onChange={(value) => setForm({ ...form, severity: value })} />
        <Select label="Priority" value={form.priority} options={['Low', 'Medium', 'High', 'Critical']} onChange={(value) => setForm({ ...form, priority: value })} />
        <Select label="Status" value={form.status} options={['New', 'In Progress', 'Fixed', 'Closed', 'Rejected']} onChange={(value) => setForm({ ...form, status: value })} />
        <Field label="Assigned to" value={form.assigned_to || ''} onChange={(value) => setForm({ ...form, assigned_to: value })} />
      </div>
    </Modal>
  )
}

function CrudPage({ title, addLabel, onAdd, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button className="button-primary" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          <span>{addLabel}</span>
        </button>
      </div>
      {children}
    </div>
  )
}

function Table({ headers, rows, empty, render, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              {headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
              <th className="w-32 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="align-top hover:bg-slate-50">
                {render(row).map((cell, index) => <td key={index} className="px-4 py-4">{cell}</td>)}
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button className="button-secondary h-9 px-3" onClick={() => onEdit(row)}>Edit</button>
                    <button className="icon-button" onClick={() => onDelete(row.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 py-12 text-center text-muted" colSpan={headers.length + 1}>{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Modal({ title, children, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-4">
      <form
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded border border-line bg-white shadow-xl"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="icon-button" type="button" onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">{children}</div>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-white px-5 py-4">
          <button className="button-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="button-primary" type="submit">
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, required = false, type = 'text' }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  )
}

function TextArea({ label, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea className="field-input min-h-24 resize-y py-2" value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="field-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function ProjectSelect({ projects, value, onChange }) {
  return (
    <label className="block">
      <span className="field-label">Project</span>
      <select className="field-input" value={value} onChange={(event) => onChange(event.target.value)} required>
        <option value="">Select project</option>
        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>
    </label>
  )
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button className={`nav-button ${active ? 'nav-button-active' : ''}`} onClick={onClick}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}

function MobileTab({ label, active, onClick }) {
  return (
    <button className={`h-9 shrink-0 rounded px-3 text-sm font-medium ${active ? 'bg-primary text-white' : 'text-muted'}`} onClick={onClick}>
      {label}
    </button>
  )
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded border border-line bg-white p-4 shadow-soft">
      <div className={`metric-icon tone-${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  )
}

function PreviewList({ title, rows, empty, render }) {
  return (
    <section className="rounded border border-line bg-white shadow-soft">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-line">
        {rows.slice(0, 5).map((item) => <div key={item.id} className="px-5 py-4">{render(item)}</div>)}
        {!rows.length && <div className="px-5 py-10 text-center text-sm text-muted">{empty}</div>}
      </div>
    </section>
  )
}

function RowTitle({ title, meta }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{meta}</p>
    </div>
  )
}

function Badge({ value }) {
  const tone = {
    Admin: 'badge-danger',
    Tester: 'badge-primary',
    Developer: 'badge-success',
    Active: 'badge-success',
    Inactive: 'badge-muted',
    Done: 'badge-primary',
    Pass: 'badge-success',
    Fail: 'badge-danger',
    Blocked: 'badge-warning',
    'Not Run': 'badge-muted',
    New: 'badge-danger',
    'In Progress': 'badge-primary',
    Fixed: 'badge-success',
    Closed: 'badge-muted',
    Rejected: 'badge-warning',
    Low: 'badge-muted',
    Medium: 'badge-primary',
    High: 'badge-warning',
    Critical: 'badge-danger',
    Minor: 'badge-muted',
    Major: 'badge-warning',
    Blocker: 'badge-danger',
  }[value] || 'badge-muted'

  return <span className={`badge ${tone}`}>{value || '-'}</span>
}

function normalizePayload(type, payload) {
  if (type === 'project') return payload
  if (type === 'testcase') return { ...payload, project_id: Number(payload.project_id) }
  return {
    ...payload,
    project_id: Number(payload.project_id),
    test_case_id: payload.test_case_id ? Number(payload.test_case_id) : null,
    assigned_to: payload.assigned_to || null,
  }
}

function buildSummary(projects, testCases, bugs) {
  return {
    total_projects: projects.length,
    total_test_cases: testCases.length,
    passed_test_cases: testCases.filter((item) => item.status === 'Pass').length,
    failed_test_cases: testCases.filter((item) => item.status === 'Fail').length,
    open_bugs: bugs.filter((item) => ['New', 'In Progress'].includes(item.status)).length,
    fixed_bugs: bugs.filter((item) => item.status === 'Fixed').length,
  }
}

function findProjectName(projects, id) {
  return projects.find((project) => Number(project.id) === Number(id))?.name || '-'
}

function findTestCaseCode(testCases, id) {
  return testCases.find((testCase) => Number(testCase.id) === Number(id))?.test_case_code || '-'
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function pageTitle(page) {
  return {
    dashboard: 'Dashboard',
    projects: 'Projects',
    testcases: 'Test Cases',
    bugs: 'Bug Reports',
  }[page]
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem('testflow_user'))
  } catch {
    return null
  }
}

function saveSession(account) {
  localStorage.setItem('testflow_user', JSON.stringify(account))
}

export default App
