import api from './api'

const adminHeaders = {
  'X-Auth-Scope': 'admin',
}

export const getAdminStats = async () => {
  const response = await api.get('/api/admin/stats', {
    headers: adminHeaders,
  })
  return response.data
}

export const getAdminApplications = async (params = {}) => {
  const response = await api.get('/api/admin/applications', {
    params,
    headers: adminHeaders,
  })
  return response.data
}

export const getPendingAdminApplications = async () => {
  const response = await api.get('/api/admin/applications/pending', {
    headers: adminHeaders,
  })
  return response.data
}

export const validateAdminApplication = async (id, payload = {}) => {
  const response = await api.put(`/api/admin/applications/${id}/validate`, payload, {
    headers: adminHeaders,
  })
  return response.data
}

export const rejectAdminApplication = async (id, payload = {}) => {
  const response = await api.put(`/api/admin/applications/${id}/reject`, payload, {
    headers: adminHeaders,
  })
  return response.data
}

export const getAdminConventions = async (params = {}) => {
  const response = await api.get('/api/admin/conventions', {
    params,
    headers: adminHeaders,
  })
  return response.data
}

export const generateConvention = async (applicationId) => {
  const response = await api.post(
    `/api/admin/applications/${applicationId}/generate`,
    {},
    {
      headers: adminHeaders,
    }
  )
  return response.data
}

export const downloadConventionPdf = async (conventionId) => {
  const response = await api.get(`/api/conventions/${conventionId}/download`, {
    responseType: 'blob',
    headers: adminHeaders,
  })

  return response
}