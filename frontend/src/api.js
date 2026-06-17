const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  login: (payload) =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDashboard: () => request('/dashboard/summary'),
  listProjects: () => request('/projects'),
  createProject: (payload) =>
    request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProject: (id, payload) =>
    request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  listTestCases: () => request('/test-cases'),
  createTestCase: (payload) =>
    request('/test-cases', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTestCase: (id, payload) =>
    request(`/test-cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteTestCase: (id) => request(`/test-cases/${id}`, { method: 'DELETE' }),
  listBugs: () => request('/bugs'),
  createBug: (payload) =>
    request('/bugs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBug: (id, payload) =>
    request(`/bugs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteBug: (id) => request(`/bugs/${id}`, { method: 'DELETE' }),
}
