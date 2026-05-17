import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const mainToken = localStorage.getItem('token')
    const adminToken = localStorage.getItem('admin_token')

    const isPublicRoute =
      config.url?.includes('/api/login') ||
      config.url?.includes('/api/register')

    const authScope = config.headers?.['X-Auth-Scope']

    if (!isPublicRoute) {
      if (authScope === 'admin' && adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`
      } else if (authScope === 'main' && mainToken) {
        config.headers.Authorization = `Bearer ${mainToken}`
      } else if (!authScope && mainToken) {
        config.headers.Authorization = `Bearer ${mainToken}`
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authScope = error.config?.headers?.['X-Auth-Scope']

    if (error.response?.status === 401) {
      if (authScope === 'admin') {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_role')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
      }
    }

    return Promise.reject(error)
  },
)

export default api