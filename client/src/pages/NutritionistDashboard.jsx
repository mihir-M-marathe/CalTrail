import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Users, MessageSquare, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import { getNutritionistStats } from '../services/userAPI'

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const initials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const COLORS = ['primary', 'green', 'yellow', 'purple', 'red', 'blue']
const colorClass = (i) => COLORS[i % COLORS.length]

const NutritionistDashboard = () => {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['nutritionist-stats'],
    queryFn: () => getNutritionistStats().then((r) => r.data.data),
    refetchInterval: 60000
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load dashboard stats. Please refresh.
      </div>
    )
  }

  const {
    assignedUsersCount,
    commentsToday,
    activeUsersToday,
    weeklyInteractions,
    recentActivity,
    usersNeedingAttention
  } = data

  const stats = [
    {
      label: 'Assigned Users',
      value: assignedUsersCount,
      sub: 'total clients',
      icon: Users,
      color: 'text-primary-600'
    },
    {
      label: 'Comments Today',
      value: commentsToday,
      sub: 'feedback given',
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      label: 'Active Today',
      value: activeUsersToday,
      sub: 'logged meals today',
      icon: TrendingUp,
      color: 'text-yellow-600'
    },
    {
      label: 'This Week',
      value: weeklyInteractions,
      sub: 'meal entries logged',
      icon: Calendar,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nutritionist Dashboard</h1>
        <p className="mt-1 text-gray-600">Manage your clients and track their nutrition progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity + Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent User Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent meal entries from your clients.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((entry, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div
                    className={`flex-shrink-0 h-8 w-8 bg-${colorClass(i)}-100 rounded-full flex items-center justify-center`}
                  >
                    <span className={`text-sm font-medium text-${colorClass(i)}-600`}>
                      {initials(entry.userName)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{entry.userName}</p>
                    <p className="text-sm text-gray-600">
                      {entry.mealType
                        ? `Logged ${entry.mealType}`
                        : 'Logged a meal'}{' '}
                      — {entry.foodName} ({entry.calories} kcal)
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">{timeAgo(entry.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users Needing Attention */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Users Need Attention</h3>
          {usersNeedingAttention.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">All clients logged meals in the last 3 days.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {usersNeedingAttention.map((u) => (
                <div key={u.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-600">No meals logged in the last 3 days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="btn-primary" onClick={() => navigate('/users')}>
            <Users className="h-4 w-4 mr-2" />
            View All Clients
          </button>
          <button className="btn-outline" onClick={() => navigate('/users')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Review Meals &amp; Leave Feedback
          </button>
        </div>
      </div>
    </div>
  )
}

export default NutritionistDashboard
