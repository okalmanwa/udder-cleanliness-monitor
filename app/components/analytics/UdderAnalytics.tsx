import { useState, useEffect } from 'react'
import ScoreTrendChart from './ScoreTrendChart'
import ScoreDistributionChart from './ScoreDistributionChart'
import PositionAnalysisChart from './PositionAnalysisChart'
import PositionTrendChart from './PositionTrendChart'
import AnalyticsStory from './AnalyticsStory'
import { useFarmStore } from '@/app/store/farmStore'
import { FaChartBar } from 'react-icons/fa'
import ExpandableChartCard from './ExpandableChartCard'
import ExaminationsVolumeChart from './ExaminationsVolumeChart'
import AverageScoreTrendChart from './AverageScoreTrendChart'
import ScoreByCowChart from './ScoreByCowChart'
import ScoreHeatmapChart from './ScoreHeatmapChart'

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

type AnalyticsData = {
  totalExaminations: number
  averageScore: number
  scoreDistribution: {
    score: number
    count: number
  }[]
  positionStats: {
    position: string
    averageScore: number
  }[]
  scoreTrend: {
    date: string
    score: number
  }[]
  positionTrend: {
    date: string
    position: string
    score: number
  }[]
  examinationsVolumeTrend: { month: string; count: number }[]
  averageScoreTrend: { month: string; average: number }[]
  scoreByCow: { cow_number: number; average: number }[]
  scoreHeatmapPositionMonth: { position: string; month: string; average: number }[]
}

export default function UdderAnalytics({ farmId }: { farmId: string }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const selectedFarm = useFarmStore(state => state.selectedFarm)
  const { setAnalyticsCache, getAnalyticsCache, clearAnalyticsCache } = useFarmStore()
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const fetchAnalytics = async (forceRefresh = false) => {
      try {
        setLoading(true)
        setError(null)
        const cacheKey = `analytics_${farmId}_${timeRange}`
      
      if (forceRefresh) {
        // Clear cache for this specific analytics query
        clearAnalyticsCache(farmId)
      }
      
        const cached = getAnalyticsCache ? getAnalyticsCache(cacheKey) : undefined
      if (cached && !forceRefresh) {
          setAnalyticsData(cached.analytics)
          setLoading(false)
          return
        }
        const response = await fetch(`/api/analytics/${farmId}?timeRange=${timeRange}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const data = await response.json()
        setAnalyticsData(data)
        if (setAnalyticsCache) setAnalyticsCache(cacheKey, data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchAnalytics()
  }, [farmId, timeRange])

  const handleRefresh = () => {
    fetchAnalytics(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <svg className="animate-spin h-12 w-12 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-green-700 text-lg font-semibold">Fetching analytics...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>
  }

  if (!analyticsData) {
    return <div className="text-center py-8">No data available</div>
  }

  // --- Month selector for Score Heatmap ---
  const allMonths = Array.from(new Set(analyticsData.scoreHeatmapPositionMonth.map(d => d.month))).sort()
  const filteredHeatmapData =
    selectedMonth === 'all'
      ? analyticsData.scoreHeatmapPositionMonth
      : analyticsData.scoreHeatmapPositionMonth.filter(d => d.month === selectedMonth)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 w-full">
        {/* Left group: Title and Refresh */}
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FaChartBar className="text-green-500 text-2xl" />
          <h2 className="text-2xl font-extrabold text-green-900 tracking-tight">Analytics</h2>
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
        </div>
        {/* Right group: Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
            {['7d', '30d', '90d', '1y', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as TimeRange)}
                className={`px-4 py-1 rounded-full font-semibold shadow-sm transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 text-sm
                  ${timeRange === range
                    ? 'bg-gradient-to-r from-green-400 to-blue-300 text-white border-green-400 scale-105'
                    : 'bg-white text-green-900 border-green-200 hover:bg-green-50 hover:scale-105'}`}
              >
                {range === '7d' ? 'Last 7 Days' :
                  range === '30d' ? 'Last 30 Days' :
                  range === '90d' ? 'Last 90 Days' :
                  range === '1y' ? 'Last Year' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpandableChartCard title="">
            <ScoreByCowChart data={analyticsData.scoreByCow} />
          </ExpandableChartCard>

          <ExpandableChartCard title="">
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="font-semibold text-green-900">Filter by month:</span>
              <button
                className={`px-3 py-1 rounded-full font-semibold text-sm transition-all duration-200 ${selectedMonth === 'all' ? 'bg-green-500 text-white shadow-md' : 'bg-white text-green-900 border border-green-300 hover:bg-green-50'}`}
                onClick={() => setSelectedMonth('all')}
              >
                All Time
              </button>
              {allMonths.map(month => (
                <button
                  key={month}
                  className={`px-3 py-1 rounded-full font-semibold text-sm transition-all duration-200 ${selectedMonth === month ? 'bg-green-500 text-white shadow-md' : 'bg-white text-green-900 border border-green-300 hover:bg-green-50'}`}
                  onClick={() => setSelectedMonth(month)}
                >
                  {month}
                </button>
              ))}
            </div>
            <ScoreHeatmapChart data={filteredHeatmapData} />
          </ExpandableChartCard>
        </div>

        <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:bg-white/50">
          <AnalyticsStory
            totalExaminations={analyticsData.totalExaminations}
            averageScore={analyticsData.averageScore}
            scoreDistribution={analyticsData.scoreDistribution}
            positionStats={analyticsData.positionStats}
            timeRange={timeRange}
            farmName={selectedFarm?.name || 'Farm'}
          />
        </div>
      </div>
    </div>
  )
} 