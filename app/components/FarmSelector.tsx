'use client'

import { useEffect, useState } from 'react'
import { useFarmStore } from '../store/farmStore'
import { FaSeedling, FaPlus } from 'react-icons/fa'

type Farm = {
  id: string
  name: string
  code: string
}

export default function FarmSelector() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedFarm, setSelectedFarm } = useFarmStore()
  const [showAddFarm, setShowAddFarm] = useState(false)
  const [farmName, setFarmName] = useState('')
  const [farmCode, setFarmCode] = useState('')
  const [numCows, setNumCows] = useState(1)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await fetch('/api/farms')
        if (!response.ok) throw new Error('Failed to fetch farms')
        const data = await response.json()
        setFarms(data)
      } catch (error) {
        console.error('Error fetching farms:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFarms()
  }, [])

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: farmName, code: farmCode, numCows }),
      })
      if (!response.ok) throw new Error('Failed to add farm')
      const newFarm = await response.json()
      setFarms((prev) => [...prev, newFarm])
      setSelectedFarm(newFarm)
      setShowAddFarm(false)
      setFarmName('')
      setFarmCode('')
      setNumCows(1)
    } catch (err) {
      setAddError('Failed to add farm. Please try again.')
    } finally {
      setAddLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[20vh]">
        <svg className="animate-spin h-10 w-10 text-green-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-green-700 text-base font-semibold">Loading farms...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="relative w-auto">
          <select
            id="farm-select"
            value={selectedFarm?.id || ''}
            onChange={(e) => {
              const farm = farms.find(f => f.id === e.target.value)
              setSelectedFarm(farm || null)
            }}
            className="block w-full appearance-none rounded-full border-2 border-green-300 bg-green-50 py-3 pl-10 pr-10 text-base font-medium text-green-900 shadow-md focus:border-green-500 focus:ring-2 focus:ring-green-400 transition-all duration-200"
          >
            <option value="">🌱 Select a farm</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name} ({farm.code})
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {/* Icon on the left */}
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-green-400">
            <FaSeedling className="w-5 h-5" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddFarm(true)}
          className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-blue-300 text-white font-semibold flex items-center gap-2 shadow hover:from-green-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <FaPlus /> Add Farm
        </button>
      </div>
      {/* Add Farm Modal */}
      {showAddFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-2 border-green-200">
            <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2"><FaSeedling className="text-green-500" /> Add New Farm</h2>
            <form onSubmit={handleAddFarm} className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-green-800 mb-1">Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={e => setFarmName(e.target.value)}
                  required
                  className="w-full rounded-full border-2 border-green-200 bg-green-50 px-4 py-2 text-base font-medium text-green-900 focus:border-green-500 focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-green-800 mb-1">Farm Code</label>
                <input
                  type="text"
                  value={farmCode}
                  onChange={e => setFarmCode(e.target.value)}
                  required
                  className="w-full rounded-full border-2 border-green-200 bg-green-50 px-4 py-2 text-base font-medium text-green-900 focus:border-green-500 focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-green-800 mb-1">Number of Cows</label>
                <input
                  type="number"
                  min={1}
                  value={numCows}
                  onChange={e => setNumCows(Number(e.target.value))}
                  required
                  className="w-full rounded-full border-2 border-green-200 bg-green-50 px-4 py-2 text-base font-medium text-green-900 focus:border-green-500 focus:ring-2 focus:ring-green-400"
                />
              </div>
              {addError && <div className="text-red-600 font-medium">{addError}</div>}
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold shadow hover:from-green-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60"
                >
                  {addLoading ? 'Adding...' : 'Add Farm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFarm(false)}
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-green-900 font-bold border border-green-200 hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 