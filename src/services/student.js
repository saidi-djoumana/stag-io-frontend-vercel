import api from './api'

// STUDENT
export const getStudentProfile = async () => {
  const response = await api.get('/api/student/profile')
  return response.data
}

export const updateStudentProfile = async (payload) => {
  const response = await api.put('/api/student/profile', payload)
  return response.data
}

export const getStudentApplications = async () => {
  const response = await api.get('/api/student/applications')
  return response.data
}

export const applyToOffer = async (offerId, payload = {}) => {
  const response = await api.post(`/api/student/offers/${offerId}/apply`, payload)
  return response.data
}

export const cancelApplication = async (id) => {
  const response = await api.delete(`/api/student/applications/${id}`)
  return response.data
}

export const finalizeInternshipChoice = async (applicationId) => {
  const response = await api.put(`/api/student/applications/${applicationId}/finalize-choice`)
  return response.data
}

// NEW: backend now returns a paginated list of conventions
export const getStudentConventions = async () => {
  const response = await api.get('/api/student/conventions')
  return response.data
}

// Keep this alias in case another old file still imports getStudentConvention
export const getStudentConvention = getStudentConventions

export const downloadStudentConventionPdf = async (conventionId) => {
  const response = await api.get(`/api/conventions/${conventionId}/download`, {
    responseType: 'blob',
  })
  return response
}

// PUBLIC
export const getOffers = async () => {
  const response = await api.get('/api/offers')
  return response.data
}

export const getOfferById = async (id) => {
  const response = await api.get(`/api/offers/${id}`)
  return response.data
}

export const getCompanyById = async (id) => {
  const response = await api.get(`/api/companies/${id}`)
  return response.data
}

export const getAiMatch = async (offerId) => {
  const response = await api.post(`/api/student/offers/${offerId}/ai-match`)
  return response.data
}