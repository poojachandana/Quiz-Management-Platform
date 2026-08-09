import api from './axios'

export const getQuizzes = (params) => api.get('/quizzes', { params })
export const getAllQuizzesAdmin = () => api.get('/quizzes', { params: { all: true } })
export const getQuiz = (id) => api.get(`/quizzes/${id}`)
export const createQuiz = (data) => api.post('/quizzes', data)
export const updateQuiz = (id, data) => api.put(`/quizzes/${id}`, data)
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`)
export const publishQuiz = (id, status) => api.patch(`/quizzes/${id}/publish`, { status })
