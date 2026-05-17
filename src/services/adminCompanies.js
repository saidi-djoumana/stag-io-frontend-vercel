import api from './api'

// Companies
export const getPendingCompanies = async () => {
  const response = await api.get('/api/admin/companies/pending', {
    headers: { 'X-Auth-Scope': 'admin' },
  })
  return response.data
}

export const approveCompany = async (id) => {
  const response = await api.put(`/api/admin/companies/${id}/approve`, {}, {
    headers: { 'X-Auth-Scope': 'admin' },
  })
  return response.data
}

export const rejectCompany = async (id) => {
  const response = await api.put(`/api/admin/companies/${id}/reject`, {}, {
    headers: { 'X-Auth-Scope': 'admin' },
  })
  return response.data
}

// Students
export const getPendingStudents = async () => {
  const response = await api.get('/api/admin/students/pending', {
    headers: { 'X-Auth-Scope': 'admin' },
  })
  return response.data
}

export const approveStudent = async (id) => {
  const response = await api.put(`/api/admin/students/${id}/approve`, {}, {
    headers: { 'X-Auth-Scope': 'admin' },
  })
  return response.data
}

export const rejectStudent = async (id) => {
  const response = await api.put(`/api/admin/students/${id}/reject`, {}, {
    headers: { 'X-Auth-Scope': 'admin' },
  })
  return response.data
}