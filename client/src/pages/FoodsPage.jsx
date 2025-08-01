import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { getFoods, searchUSDAFoods } from '../services/foodAPI'
import { Search, Plus, Database, ExternalLink } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const FoodsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('database') // 'database' or 'usda'
  const [usdaSearchTerm, setUsdaSearchTerm] = useState('')

  const { data: foodsData, isLoading } = useQuery(
    ['foods', searchTerm],
    () => getFoods({ search: searchTerm, limit: 20 }),
    {
      enabled: activeTab === 'database'
    }
  )

  const { data: usdaData, isLoading: usdaLoading } = useQuery(
    ['usdaFoods', usdaSearchTerm],
    () => searchUSDAFoods(usdaSearchTerm),
    {
      enabled: activeTab === 'usda' && usdaSearchTerm.length > 2
    }
  )

  const foods = foodsData?.data?.foods || []
  const usdaFoods = usdaData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Database</h1>
          <p className="mt-1 text-gray-600">Search and explore nutritional information</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Food
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('database')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'database'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="h-4 w-4 inline mr-2" />
            Our Database
          </button>
          <button
            onClick={() => setActiveTab('usda')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usda'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ExternalLink className="h-4 w-4 inline mr-2" />
            USDA Database
          </button>
        </nav>
      </div>

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search foods in our database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner className="h-32" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.map(food => (
                <div key={food.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{food.name}</h3>
                    {food.source === 'USDA' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        USDA
                      </span>
                    )}
                  </div>
                  
                  {food.brand && (
                    <p className="text-sm text-gray-600 mb-2">{food.brand}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Calories:</span>
                      <span className="ml-1 font-medium">{food.calories}/100g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Protein:</span>
                      <span className="ml-1 font-medium">{food.protein}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Carbs:</span>
                      <span className="ml-1 font-medium">{food.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fat:</span>
                      <span className="ml-1 font-medium">{food.fat}g</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="btn-primary btn-sm w-full">
                      Add to Meal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && foods.length === 0 && (
            <div className="card text-center py-12">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No foods found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Try a different search term or check the USDA database' 
                  : 'Start typing to search for foods'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* USDA Tab */}
      {activeTab === 'usda' && (
        <div className="space-y-6">
          <div className="card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search USDA food database..."
                value={usdaSearchTerm}
                onChange={(e) => setUsdaSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Search the comprehensive USDA food database to find nutritional information
            </p>
          </div>

          {usdaLoading ? (
            <LoadingSpinner className="h-32" />
          ) : usdaSearchTerm.length > 2 ? (
            <div className="space-y-4">
              {usdaFoods.map(food => (
                <div key={food.usdaFdcId} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{food.name}</h3>
                      {food.brand && (
                        <p className="text-sm text-gray-600">{food.brand}</p>
                      )}
                      {food.description && (
                        <p className="text-sm text-gray-500 mt-1">{food.description}</p>
                      )}
                    </div>
                    <button className="btn-primary btn-sm ml-4">
                      Import Food
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <ExternalLink className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Search USDA Database</h3>
              <p className="mt-1 text-sm text-gray-500">
                Type at least 3 characters to search the USDA food database
              </p>
            </div>
          )}

          {!usdaLoading && usdaSearchTerm.length > 2 && usdaFoods.length === 0 && (
            <div className="card text-center py-12">
              <ExternalLink className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search term or check our main database
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FoodsPage
