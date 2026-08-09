import api from './axios'

export const getLeaderboard = (params) => api.get('/leaderboard', { params })
