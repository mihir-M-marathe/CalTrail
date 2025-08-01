import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Auth pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Dashboard pages
import DashboardPage from './pages/DashboardPage'
import MealsPage from './pages/MealsPage'
import FoodsPage from './pages/FoodsPage'
import ProfilePage from './pages/ProfilePage'

// Nutritionist pages
import NutritionistDashboard from './pages/NutritionistDashboard'
import UsersManagement from './pages/UsersManagement'

// Protected route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Public route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="meals" element={<MealsPage />} />
          <Route path="foods" element={<FoodsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Nutritionist routes */}
          <Route path="nutritionist" element={
            <ProtectedRoute roles={['NUTRITIONIST', 'ADMIN']}>
              <NutritionistDashboard />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute roles={['NUTRITIONIST', 'ADMIN']}>
              <UsersManagement />
            </ProtectedRoute>
          } />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
