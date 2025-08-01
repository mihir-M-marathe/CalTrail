import api from './api'

export const getFoods = (params = {}) => {
  return api.get('/foods', { params })
}

export const getFoodById = (id) => {
  return api.get(`/foods/${id}`)
}

export const createFood = (foodData) => {
  return api.post('/foods', foodData)
}

export const updateFood = (id, foodData) => {
  return api.put(`/foods/${id}`, foodData)
}

export const deleteFood = (id) => {
  return api.delete(`/foods/${id}`)
}

export const searchUSDAFoods = (query, limit = 10) => {
  return api.get('/foods/search/usda', {
    params: { query, limit }
  })
}

export const importUSDAFood = (fdcId) => {
  return api.post(`/foods/import/usda/${fdcId}`)
}
