import api from './api'

export const registerUser = async (payload) => {
  const response = await api.post('/api/register', payload)
  return response.data
}

export const loginUser = async (payload) => {
  const response = await api.post('/api/login', payload)
  return response.data
}

export const getMe = async (isAdmin = false) => {
  const response = await api.get('/api/me', {
    headers: {
      'X-Auth-Scope': isAdmin ? 'admin' : 'main',
    },
  })
  return response.data
}

export const logoutUser = async (isAdmin = false) => {
  const response = await api.post(
    '/api/logout',
    {},
    {
      headers: {
        'X-Auth-Scope': isAdmin ? 'admin' : 'main',
      },
    },
  )
  return response.data
}

export const clearAuthStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
}

export const clearAdminAuthStorage = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  localStorage.removeItem('admin_role')
}