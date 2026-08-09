import api from './axios'

export const startAttempt = (quizId) => api.post(`/quizzes/${quizId}/start`)
export const submitAttempt = (quizId, attemptId, data) =>
  api.post(`/quizzes/${quizId}/submit`, data, { params: { attemptId } })
export const getMyAttempts = () => api.get('/attempts')
export const getAttempt = (id) => api.get(`/attempts/${id}`)

export const resumeAttempt = (attemptId) => api.get(`/attempts/${attemptId}/resume`)
