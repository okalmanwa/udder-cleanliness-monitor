'use client'

import { useFarmStore } from '../store/farmStore'
import UdderAnalytics from './analytics/UdderAnalytics'
import FarmSelector from './FarmSelector'

export default function Analytics() {
  const selectedFarm = useFarmStore(state => state.selectedFarm)

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-0 sm:px-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="w-full max-w-md">
            <FarmSelector />
          </div>
        </div>
        {selectedFarm ? (
          <UdderAnalytics farmId={selectedFarm.id} />
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-green-700">Please select a farm to view analytics.</p>
          </div>
        )}
      </div>
    </div>
  )
} 