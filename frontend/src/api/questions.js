import api from './axios'

export const getQuestions = (quizId) => api.get(`/quizzes/${quizId}/questions`)
export const createQuestion = (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data)
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data)
export const deleteQuestion = (id) => api.delete(`/questions/${id}`)
