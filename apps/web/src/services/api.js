const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

async function request(path, { method = 'GET', body, accessToken } = {}) {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.success) {
    const error = new Error(payload.message || 'Permintaan tidak dapat diproses.')
    error.status = response.status
    throw error
  }

  return payload.data
}

export const api = {
  login(credentials) {
    return request('/auth/login', { method: 'POST', body: credentials })
  },
  register(user) {
    return request('/auth/register', { method: 'POST', body: user })
  },
  refresh() {
    return request('/auth/refresh', { method: 'POST' })
  },
  logout() {
    return request('/auth/logout', { method: 'POST' })
  },
  me(accessToken) {
    return request('/auth/me', { accessToken })
  },
  checkRedirect(url) {
    return request(`/auth/redirect-check?url=${encodeURIComponent(url)}`)
  },
  users(accessToken) {
    return request('/users', { accessToken })
  },
}
