import api from './api'

export const getMealComments = (mealEntryId) => {
  return api.get(`/comments/meal/${mealEntryId}`)
}

export const getUserComments = (userId, params = {}) => {
  return api.get(`/comments/user/${userId}`, { params })
}

export const createComment = (commentData) => {
  return api.post('/comments', commentData)
}

export const updateComment = (id, commentData) => {
  return api.put(`/comments/${id}`, commentData)
}

export const deleteComment = (id) => {
  return api.delete(`/comments/${id}`)
}

export const getNutritionistRecentComments = (nutritionistId, limit = 10) => {
  return api.get(`/comments/nutritionist/${nutritionistId}/recent`, {
    params: { limit }
  })
}
