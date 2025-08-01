import api from './api'

export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

export const register = (userData) => {
  return api.post('/auth/register', userData)
}

export const getCurrentUser = () => {
  return api.get('/auth/me')
}

export const updateProfile = (profileData) => {
  return api.put('/auth/profile', profileData)
}

export const changePassword = (passwordData) => {
  return api.post('/auth/change-password', passwordData)
}
