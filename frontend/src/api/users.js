import api from './axios'

export const getStudents = (search) => api.get('/users', { params: { search } })
export const getStudentProfile = (id) => api.get(`/users/${id}`)
export const updateStudent = (id, data) => api.put(`/users/${id}`, data)
export const deleteStudent = (id) => api.delete(`/users/${id}`)
export const setStudentStatus = (id, status) => api.patch(`/users/${id}/status`, { status })
