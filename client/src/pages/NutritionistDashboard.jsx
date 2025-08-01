import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Users, MessageSquare, TrendingUp, Calendar } from 'lucide-react'

const NutritionistDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nutritionist Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Manage your clients and track their nutrition progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assigned Users</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-500">of 10 capacity</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Comments Today</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500">feedback given</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-sm text-gray-500">logged meals today</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-gray-500">total interactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent User Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">JD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-sm text-gray-600">Logged breakfast - 450 calories</p>
              </div>
              <div className="text-sm text-gray-500">2 min ago</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">SM</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sarah Miller</p>
                <p className="text-sm text-gray-600">Completed daily goal</p>
              </div>
              <div className="text-sm text-gray-500">1 hour ago</div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-yellow-600">MB</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Mike Brown</p>
                <p className="text-sm text-gray-600">Added workout session</p>
              </div>
              <div className="text-sm text-gray-500">3 hours ago</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Users Need Attention</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-red-600">AL</span>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">Alex Lee</p>
                  <p className="text-sm text-gray-600">No meals logged for 3 days</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-yellow-600">EM</span>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">Emma Wilson</p>
                  <p className="text-sm text-gray-600">Consistently under calorie goal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary">
            <Users className="h-4 w-4 mr-2" />
            View All Users
          </button>
          <button className="btn-outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Recent Comments
          </button>
          <button className="btn-outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Reports
          </button>
        </div>
      </div>
    </div>
  )
}

export default NutritionistDashboard
