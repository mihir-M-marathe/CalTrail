import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { User, Save, Lock } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      height: user?.height || '',
      weight: user?.weight || '',
      gender: user?.gender || '',
      activityLevel: user?.activityLevel || '',
      goals: user?.goals || ''
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch
  } = useForm()

  const watchNewPassword = watch('newPassword')

  const onProfileSubmit = async (data) => {
    setIsUpdating(true)
    await updateProfile(data)
    setIsUpdating(false)
  }

  const onPasswordSubmit = async (data) => {
    setIsUpdating(true)
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
    if (result.success) {
      resetPasswordForm()
    }
    setIsUpdating(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Security
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  {...registerProfile('name', { required: 'Name is required' })}
                  type="text"
                  className="input"
                />
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="input bg-gray-50 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  {...registerProfile('height', { 
                    valueAsNumber: true,
                    min: { value: 50, message: 'Height must be at least 50cm' },
                    max: { value: 300, message: 'Height must be less than 300cm' }
                  })}
                  type="number"
                  className="input"
                />
                {profileErrors.height && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.height.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  {...registerProfile('weight', { 
                    valueAsNumber: true,
                    min: { value: 20, message: 'Weight must be at least 20kg' },
                    max: { value: 500, message: 'Weight must be less than 500kg' }
                  })}
                  type="number"
                  step="0.1"
                  className="input"
                />
                {profileErrors.weight && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.weight.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select {...registerProfile('gender')} className="input">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level
                </label>
                <select {...registerProfile('activityLevel')} className="input">
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="lightly_active">Lightly active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very active (hard exercise 6-7 days/week)</option>
                  <option value="extra_active">Extra active (very hard exercise, physical job)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goals
                </label>
                <select {...registerProfile('goals')} className="input">
                  <option value="">Select your goal</option>
                  <option value="lose">Lose weight</option>
                  <option value="maintain">Maintain weight</option>
                  <option value="gain">Gain weight</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary flex items-center"
              >
                {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  type="password"
                  className="input"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  {...registerPassword('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type="password"
                  className="input"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  {...registerPassword('confirmPassword', { 
                    required: 'Please confirm your new password',
                    validate: value => value === watchNewPassword || 'Passwords do not match'
                  })}
                  type="password"
                  className="input"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary flex items-center"
              >
                {isUpdating ? <LoadingSpinner size="sm" className="mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                Update Password
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Account Info */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Account Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role?.toLowerCase()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </dd>
          </div>
          {user?.assignedNutritionist && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Assigned Nutritionist</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.assignedNutritionist.name}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

export default ProfilePage
