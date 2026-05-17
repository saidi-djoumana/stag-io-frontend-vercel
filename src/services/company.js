import api from './api'

export const getCompanyProfile = async () => {
  const response = await api.get('/api/company/profile')
  return response.data.profile
}

export const updateCompanyProfile = async (payload) => {
  const response = await api.put('/api/company/profile', payload)
  return response.data.profile
}

export const getCompanyOffers = async () => {
  const response = await api.get('/api/company/offers')
  return response.data
}

export const createCompanyOffer = async (payload) => {
  const response = await api.post('/api/company/offers', payload)
  return response.data
}

export const updateCompanyOffer = async (id, payload) => {
  const response = await api.put(`/api/company/offers/${id}`, payload)
  return response.data
}

export const deleteCompanyOffer = async (id) => {
  const response = await api.delete(`/api/company/offers/${id}`)
  return response.data
}

export const getOfferApplications = async (offerId) => {
  const response = await api.get(`/api/company/offers/${offerId}/applications`)
  return response.data
}

export const acceptApplication = async (applicationId) => {
  const response = await api.put(`/api/company/applications/${applicationId}/accept`)
  return response.data
}

export const refuseApplication = async (applicationId) => {
  const response = await api.put(`/api/company/applications/${applicationId}/refuse`)
  return response.data
}

export const getPublicStudentProfile = async (studentId) => {
  const response = await api.get(`/api/students/${studentId}/cv`)
  return response.data
}

export const getCompanyConventions = async () => {
  const response = await api.get('/api/company/conventions')
  return response.data
}

export const downloadCompanyConventionPdf = async (conventionId) => {
  const response = await api.get(`/api/conventions/${conventionId}/download`, {
    responseType: 'blob',
  })
  return response
}