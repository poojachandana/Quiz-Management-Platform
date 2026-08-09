import api from './axios'

export const getAllAttemptsAdmin = () => api.get('/admin/attempts')
export const getAttemptAdmin = (id) => api.get(`/admin/attempts/${id}`)
export const getAnalytics = () => api.get('/admin/analytics')
