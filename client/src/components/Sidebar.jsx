import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, 
  Utensils, 
  Apple, 
  Users, 
  TrendingUp,
  User,
  MessageSquare
} from 'lucide-react'

const Sidebar = () => {
  const { user } = useAuth()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['USER', 'NUTRITIONIST', 'ADMIN']
    },
    {
      name: 'My Meals',
      href: '/meals',
      icon: Utensils,
      roles: ['USER']
    },
    {
      name: 'Food Database',
      href: '/foods',
      icon: Apple,
      roles: ['USER', 'NUTRITIONIST', 'ADMIN']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['USER', 'NUTRITIONIST', 'ADMIN']
    },
    // Nutritionist specific items
    {
      name: 'Nutritionist Dashboard',
      href: '/nutritionist',
      icon: TrendingUp,
      roles: ['NUTRITIONIST', 'ADMIN']
    },
    {
      name: 'Manage Users',
      href: '/users',
      icon: Users,
      roles: ['NUTRITIONIST', 'ADMIN']
    }
  ]

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <span className="text-xl font-semibold text-gray-900">Navigation</span>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            )
          })}
        </div>

        {/* Quick Stats (for users) */}
        {user?.role === 'USER' && (
          <div className="mt-8 px-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Today's Summary
            </h3>
            <div className="mt-3 space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Calories</span>
                  <span className="text-sm font-medium text-gray-900">1,200 / 2,000</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-primary-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions (for nutritionists) */}
        {(user?.role === 'NUTRITIONIST' || user?.role === 'ADMIN') && (
          <div className="mt-8 px-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="mt-3 space-y-1">
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <MessageSquare className="mr-3 h-4 w-4" />
                Recent Comments
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Sidebar
