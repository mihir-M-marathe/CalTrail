import api from './api'

export const getMealEntries = (userId, params = {}) => {
  return api.get(`/meals/user/${userId}`, { params })
}

export const getMealEntry = (id) => {
  return api.get(`/meals/${id}`)
}

export const createMealEntry = (mealData) => {
  return api.post('/meals', mealData)
}

export const updateMealEntry = (id, mealData) => {
  return api.put(`/meals/${id}`, mealData)
}

export const deleteMealEntry = (id) => {
  return api.delete(`/meals/${id}`)
}

export const getDailyNutrition = (userId, date) => {
  return api.get(`/meals/user/${userId}/daily/${date}`)
}

export const getWeeklyNutrition = (userId, startDate) => {
  return api.get(`/meals/user/${userId}/weekly`, {
    params: { startDate }
  })
}
