import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { getMealEntries } from '../services/mealAPI'
import { Plus, Search, Calendar, Filter } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const MealsPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [mealTypeFilter, setMealTypeFilter] = useState('')

  const { data: mealsData, isLoading } = useQuery(
    ['mealEntries', user?.id, selectedDate, mealTypeFilter],
    () => getMealEntries(user.id, {
      startDate: selectedDate,
      endDate: selectedDate,
      mealType: mealTypeFilter || undefined,
      includeFoodDetails: true
    }),
    {
      enabled: !!user
    }
  )

  const meals = mealsData?.data?.mealEntries || []
  const nutritionTotals = mealsData?.data?.nutritionTotals

  const filteredMeals = meals.filter(meal =>
    meal.food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedMeals = filteredMeals.reduce((acc, meal) => {
    const mealType = meal.mealType || 'other'
    if (!acc[mealType]) {
      acc[mealType] = []
    }
    acc[mealType].push(meal)
    return acc
  }, {})

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'other']

  if (isLoading) {
    return <LoadingSpinner className="h-64" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Meals</h1>
          <p className="mt-1 text-gray-600">Track your daily food intake</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Meal
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search meals
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by food name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal type
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={mealTypeFilter}
                onChange={(e) => setMealTypeFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="">All meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Summary */}
      {nutritionTotals && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Daily Nutrition Summary for {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {Math.round(nutritionTotals.calories || 0)}
              </p>
              <p className="text-sm text-gray-600">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(nutritionTotals.protein || 0)}g
              </p>
              <p className="text-sm text-gray-600">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {Math.round(nutritionTotals.carbs || 0)}g
              </p>
              <p className="text-sm text-gray-600">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(nutritionTotals.fat || 0)}g
              </p>
              <p className="text-sm text-gray-600">Fat</p>
            </div>
          </div>
        </div>
      )}

      {/* Meals by Type */}
      <div className="space-y-6">
        {mealTypes.map(mealType => {
          const mealsForType = groupedMeals[mealType] || []
          
          if (mealsForType.length === 0) return null

          return (
            <div key={mealType} className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                {mealType} ({mealsForType.length} items)
              </h3>
              
              <div className="space-y-3">
                {mealsForType.map(meal => (
                  <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{meal.food.name}</h4>
                      <p className="text-sm text-gray-600">
                        {meal.quantity}g • {Math.round(meal.food.calories * meal.quantity / 100)} calories
                      </p>
                      {meal.notes && (
                        <p className="text-sm text-gray-500 mt-1">{meal.notes}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {format(new Date(meal.date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {filteredMeals.length === 0 && (
        <div className="card text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Plus className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meals found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || mealTypeFilter 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first meal'}
          </p>
          <div className="mt-6">
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add your first meal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MealsPage
