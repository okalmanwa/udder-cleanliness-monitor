import { useState, useEffect } from 'react'
import ScoreTrendChart from './ScoreTrendChart'
import ScoreDistributionChart from './ScoreDistributionChart'
import PositionAnalysisChart from './PositionAnalysisChart'
import PositionTrendChart from './PositionTrendChart'
import AnalyticsStory from './AnalyticsStory'
import { useFarmStore } from '@/app/store/farmStore'
import { FaChartBar, FaDownload } from 'react-icons/fa'
import ExpandableChartCard from './ExpandableChartCard'
import ExaminationsVolumeChart from './ExaminationsVolumeChart'
import AverageScoreTrendChart from './AverageScoreTrendChart'
import ScoreByCowChart from './ScoreByCowChart'
import ScoreHeatmapChart from './ScoreHeatmapChart'
import ScoreDistributionPieChart from './ScoreDistributionPieChart'
import ScoreByPositionBarChart from './ScoreByPositionBarChart'
import ScoreHeatmap from './ScoreHeatmap'
import AverageScorePerCow from './AverageScorePerCow'

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

interface UdderAnalyticsProps {
  farmId: string
  timeRange: string
  setTimeRange: (range: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  handleRefresh: () => void
}

export default function UdderAnalytics({ farmId, timeRange, setTimeRange, loading, setLoading, handleRefresh }: UdderAnalyticsProps) {
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

  const handleDownloadStory = () => {
    if (!analyticsData) return;

    const story = `
      ${selectedFarm ? selectedFarm.name : 'Farm'} - Udder Health Analytics Report
      Time Period: the last ${timeRange} days
      
      Overview
      Total Examinations: ${analyticsData.totalExaminations} Average Score: ${analyticsData.averageScore.toFixed(2)}
      
      Key Findings
      The ${analyticsData.positionStats.reduce((a, b) => a.averageScore > b.averageScore ? a : b).position} position showed the best health with an average score of ${analyticsData.positionStats.reduce((a, b) => a.averageScore > b.averageScore ? a : b).averageScore.toFixed(2)}
      The ${analyticsData.positionStats.reduce((a, b) => a.averageScore < b.averageScore ? a : b).position} position needs attention with an average score of ${analyticsData.positionStats.reduce((a, b) => a.averageScore < b.averageScore ? a : b).averageScore.toFixed(2)}
      Score ${analyticsData.scoreDistribution.reduce((a, b) => a.count > b.count ? a : b).score} was the most common, appearing in ${analyticsData.scoreDistribution.reduce((a, b) => a.count > b.count ? a : b).count} examinations
      
      Score Distribution
      ${analyticsData.scoreDistribution.map(d => `Score ${d.score}: ${d.count} examinations`).join('\n')}
      
      Position Analysis
      ${analyticsData.positionStats.map(d => `${d.position}: Average score of ${d.averageScore.toFixed(2)}`).join('\n')}
      
      Recommendations
      Monitor closely: Some improvement needed in udder health
      Focus on ${analyticsData.positionStats.reduce((a, b) => a.averageScore < b.averageScore ? a : b).position} position: Implement targeted care and monitoring
    `;

    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'udder-health-analytics-report.txt';
    link.click();
  };

  // Map timeRange to human-friendly label
  const timeRangeLabel = {
    '7d': 'the last 7 days',
    '30d': 'the last 30 days',
    '90d': 'the last 90 days',
    '1y': 'the last year',
    'all': 'all available data',
  }[timeRange] || timeRange;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ScoreDistributionPieChart data={analyticsData.scoreDistribution} />
        <ScoreByPositionBarChart data={analyticsData.positionStats} />
      </div>
      <AverageScorePerCow data={analyticsData.scoreByCow.map(cow => ({ cow: String(cow.cow_number), avgScore: cow.average }))} />
      <div className="mt-8 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between mb-6 gap-4 md:gap-0">
          <div className="flex-shrink-0 mb-2 md:mb-0">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#22c55e"/>
              <ellipse cx="24" cy="30" rx="12" ry="8" fill="#fff"/>
              <ellipse cx="18" cy="20" rx="4" ry="6" fill="#fff"/>
              <ellipse cx="30" cy="20" rx="4" ry="6" fill="#fff"/>
              <ellipse cx="18" cy="20" rx="2" ry="3" fill="#222"/>
              <ellipse cx="30" cy="20" rx="2" ry="3" fill="#222"/>
              <ellipse cx="24" cy="32" rx="3" ry="2" fill="#222"/>
            </svg>
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-3xl font-extrabold text-green-900">{selectedFarm ? selectedFarm.name : 'Farm'} - Udder Health Analytics Report</h2>
            <p className="text-lg font-semibold text-gray-700 mt-1">Time Period: {timeRangeLabel}</p>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <button
              onClick={handleDownloadStory}
              className="w-full md:w-auto px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold shadow hover:from-green-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center gap-2"
            >
              <FaDownload /> Download Report
            </button>
          </div>
        </div>
        <div className="text-left space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-green-800">Overview</h3>
            <p className="text-base sm:text-lg">Total Examinations: {analyticsData.totalExaminations} &nbsp; Average Score: {analyticsData.averageScore.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-green-800">Key Findings</h3>
            <ul className="list-disc pl-4 sm:pl-6 space-y-1 text-base sm:text-lg">
              <li>The {analyticsData.positionStats.reduce((a, b) => a.averageScore > b.averageScore ? a : b).position} position showed the best health with an average score of {analyticsData.positionStats.reduce((a, b) => a.averageScore > b.averageScore ? a : b).averageScore.toFixed(2)}</li>
              <li>The {analyticsData.positionStats.reduce((a, b) => a.averageScore < b.averageScore ? a : b).position} position needs attention with an average score of {analyticsData.positionStats.reduce((a, b) => a.averageScore < b.averageScore ? a : b).averageScore.toFixed(2)}</li>
              <li>Score {analyticsData.scoreDistribution.reduce((a, b) => a.count > b.count ? a : b).score} was the most common, appearing in {analyticsData.scoreDistribution.reduce((a, b) => a.count > b.count ? a : b).count} examinations</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-green-800">Score Distribution</h3>
            <ul className="list-disc pl-4 sm:pl-6 space-y-1 text-base sm:text-lg">
              {analyticsData.scoreDistribution.map(d => (
                <li key={d.score}>Score {d.score}: {d.count} examinations</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-green-800">Position Analysis</h3>
            <ul className="list-disc pl-4 sm:pl-6 space-y-1 text-base sm:text-lg">
              {analyticsData.positionStats.map(d => (
                <li key={d.position}>{d.position}: Average score of {d.averageScore.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-green-800">Recommendations</h3>
            <ul className="list-disc pl-4 sm:pl-6 space-y-1 text-base sm:text-lg">
              <li>Monitor closely: Some improvement needed in udder health</li>
              <li>Focus on {analyticsData.positionStats.reduce((a, b) => a.averageScore < b.averageScore ? a : b).position} position: Implement targeted care and monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 