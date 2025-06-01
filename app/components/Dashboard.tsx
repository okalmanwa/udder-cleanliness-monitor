'use client'

import UdderGrid from './UdderGrid'
import FarmSelector from './FarmSelector'
import { useFarmStore } from '../store/farmStore'
import { FaSeedling, FaCheckCircle } from 'react-icons/fa'
import { useState, useEffect } from 'react'

const DATE_FILTERS = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last Year', value: '1y' },
]

export default function Dashboard() {
  const { selectedFarm } = useFarmStore()
  const [dateFilter, setDateFilter] = useState('all')
  const [exportCSVHandler, setExportCSVHandler] = useState<(() => void) | null>(null)
  const [exportExcelHandler, setExportExcelHandler] = useState<(() => void) | null>(null)

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 w-full">
        {/* Left group: FarmSelector and Add Farm */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <FarmSelector />
        </div>
        {/* Right group: Filters and Export buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-4 py-1 rounded-full font-semibold shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 text-sm bg-white text-green-900 border-green-200 hover:bg-green-50"
            >
              {DATE_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center sm:justify-start">
            <button
              onClick={() => exportCSVHandler && exportCSVHandler()}
              className="px-4 py-1 rounded-full font-semibold bg-gradient-to-r from-green-400 to-blue-300 text-white shadow-md hover:from-green-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm flex items-center gap-2"
            >
              <FaCheckCircle /> Export CSV
            </button>
            <button
              onClick={() => exportExcelHandler && exportExcelHandler()}
              className="px-4 py-1 rounded-full font-semibold bg-gradient-to-r from-blue-400 to-green-300 text-white shadow-md hover:from-blue-500 hover:to-green-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm flex items-center gap-2"
            >
              <FaCheckCircle /> Export Excel
            </button>
          </div>
        </div>
      </div>
      {selectedFarm && (
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
              <span className="inline-flex items-center"><FaSeedling className="text-green-500" /> Udder Examinations</span>
            </h2>
          </div>
        </div>
      )}
      {selectedFarm ? (
        <UdderGrid
          farmId={selectedFarm.id}
          dateFilter={dateFilter}
          setExportCSVHandler={setExportCSVHandler}
          setExportExcelHandler={setExportExcelHandler}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-green-700">Please select a farm to view udder examinations.</p>
        </div>
      )}
    </div>
  )
} 