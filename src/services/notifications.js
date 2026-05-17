import api from './api'

const getAuthHeaders = (authScope = 'main') => ({
  headers: {
    'X-Auth-Scope': authScope,
  },
})

export const getNotifications = async (authScope = 'main', page = 1) => {
  const response = await api.get(
    `/api/notifications?page=${page}`,
    getAuthHeaders(authScope)
  )
  return response.data
}

export const getUnreadNotificationsCount = async (authScope = 'main') => {
  const response = await api.get(
    '/api/notifications/unread-count',
    getAuthHeaders(authScope)
  )
  return response.data
}

export const markNotificationAsRead = async (id, authScope = 'main') => {
  const response = await api.put(
    `/api/notifications/${id}/read`,
    {},
    getAuthHeaders(authScope)
  )
  return response.data
}

export const markAllNotificationsAsRead = async (authScope = 'main') => {
  const response = await api.put(
    '/api/notifications/read-all',
    {},
    getAuthHeaders(authScope)
  )
  return response.data
}