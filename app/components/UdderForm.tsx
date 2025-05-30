'use client'

import { useState } from 'react'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { GiCow } from 'react-icons/gi'

type UdderFormProps = {
  farmId: string
  onUdderAdded: () => void
}

export default function UdderForm({ farmId, onUdderAdded }: UdderFormProps) {
  const [numCows, setNumCows] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddCows = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/farms/${farmId}/udders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numCows }),
      })
      if (!response.ok) throw new Error('Failed to add cows')
      onUdderAdded()
      setNumCows(1)
    } catch (err) {
      setError('Failed to add cows. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleAddCows} className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <GiCow className="text-green-500 text-xl" />
        <h3 className="text-lg font-bold text-green-900">Add Cows</h3>
        <span className="text-green-600 text-xs font-medium ml-2">(4 udders per cow)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setNumCows(Math.max(1, numCows - 1))}
          className="px-2 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
        >
          <FaMinus />
        </button>
        <span className="text-xl font-bold text-green-900 w-8 text-center">{numCows}</span>
        <button
          type="button"
          onClick={() => setNumCows(numCows + 1)}
          className="px-2 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
        >
          <FaPlus />
        </button>
        <button
          type="submit"
          disabled={loading}
          className="ml-4 px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold shadow-sm hover:from-green-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? 'Adding...' : `Add ${numCows} Cow${numCows > 1 ? 's' : ''}`}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-base font-medium mt-2">
          {error}
        </div>
      )}
    </form>
  )
} 