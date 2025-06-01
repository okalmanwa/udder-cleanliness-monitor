'use client'

import { useFarmStore } from '../store/farmStore'
import UdderAnalytics from './analytics/UdderAnalytics'
import FarmSelector from './FarmSelector'
import { useState } from 'react'

export default function Analytics() {
  const selectedFarm = useFarmStore(state => state.selectedFarm)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  // This will be passed to UdderAnalytics and should trigger a refresh
  const handleRefresh = () => {
    // This will be implemented in UdderAnalytics via a prop
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-0 sm:px-0">
        <div className="flex flex-row flex-wrap items-center gap-4 mb-8 items-center">
          <div className="w-full max-w-md">
            <FarmSelector />
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1 rounded-full font-semibold shadow-sm transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 text-sm bg-white text-green-900 border-green-200 hover:bg-green-50 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refresh analytics data"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <select
            id="analytics-time-range"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-4 py-1 rounded-full font-semibold shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 text-sm bg-white text-green-900 border-green-200 hover:bg-green-50"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        {selectedFarm ? (
          <UdderAnalytics farmId={selectedFarm.id} timeRange={timeRange} setTimeRange={setTimeRange} loading={loading} setLoading={setLoading} handleRefresh={handleRefresh} />
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-green-700">Please select a farm to view analytics.</p>
          </div>
        )}
      </div>
    </div>
  )
} 