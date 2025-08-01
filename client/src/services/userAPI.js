import api from './api'

export const getUsers = (params = {}) => {
  return api.get('/users', { params })
}

export const getUserById = (id) => {
  return api.get(`/users/${id}`)
}

export const getNutritionSummary = (userId, params = {}) => {
  return api.get(`/users/${userId}/nutrition-summary`, { params })
}

export const assignNutritionist = (userId, nutritionistId) => {
  return api.put(`/users/${userId}/assign-nutritionist`, { nutritionistId })
}

export const deleteUser = (id) => {
  return api.delete(`/users/${id}`)
}
