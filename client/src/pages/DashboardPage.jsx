import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { getDailyNutrition } from '../services/mealAPI'
import { TrendingUp, Apple, Target, Calendar } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const DashboardPage = () => {
  const { user } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: dailyData, isLoading } = useQuery(
    ['dailyNutrition', user?.id, today],
    () => getDailyNutrition(user.id, today),
    {
      enabled: !!user && user.role === 'USER'
    }
  )

  const nutritionData = dailyData?.data

  if (isLoading) {
    return <LoadingSpinner className="h-64" />
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's your nutrition overview for {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {user?.role === 'USER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Calories Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(nutritionData?.totals?.calories || 0)}
                </p>
                <p className="text-sm text-gray-500">of 2,000 goal</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Apple className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Protein</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(nutritionData?.totals?.protein || 0)}g
                </p>
                <p className="text-sm text-gray-500">of 150g goal</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Carbs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(nutritionData?.totals?.carbs || 0)}g
                </p>
                <p className="text-sm text-gray-500">of 250g goal</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Meals Logged</p>
                <p className="text-2xl font-bold text-gray-900">
                  {nutritionData?.totalEntries || 0}
                </p>
                <p className="text-sm text-gray-500">entries today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'USER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Meals</h3>
            <div className="space-y-3">
              {nutritionData?.mealsByType ? (
                Object.entries(nutritionData.mealsByType).map(([mealType, meals]) => (
                  meals.length > 0 && (
                    <div key={mealType} className="border-l-4 border-primary-400 pl-4">
                      <h4 className="font-medium text-gray-900 capitalize">{mealType}</h4>
                      <p className="text-sm text-gray-600">
                        {meals.length} item{meals.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No meals logged today yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nutrition Goals</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Calories</span>
                  <span>{Math.round(nutritionData?.totals?.calories || 0)}/2000</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-primary-500 rounded-full" 
                    style={{ width: `${Math.min((nutritionData?.totals?.calories || 0) / 2000 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Protein</span>
                  <span>{Math.round(nutritionData?.totals?.protein || 0)}/150g</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${Math.min((nutritionData?.totals?.protein || 0) / 150 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Carbs</span>
                  <span>{Math.round(nutritionData?.totals?.carbs || 0)}/250g</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-yellow-500 rounded-full" 
                    style={{ width: `${Math.min((nutritionData?.totals?.carbs || 0) / 250 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(user?.role === 'NUTRITIONIST' || user?.role === 'ADMIN') && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nutritionist Dashboard</h3>
          <p className="text-gray-600">
            Welcome to your nutritionist dashboard. Here you can manage your assigned users, 
            review their nutrition data, and provide personalized recommendations.
          </p>
          <div className="mt-4 space-x-4">
            <button className="btn-primary">View Assigned Users</button>
            <button className="btn-outline">Recent Activity</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
