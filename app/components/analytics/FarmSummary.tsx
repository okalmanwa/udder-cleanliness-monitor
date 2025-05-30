import { useFarmStore } from '@/app/store/farmStore'

type FarmSummaryProps = {
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
}

export default function FarmSummary({
  totalExaminations,
  averageScore,
  scoreDistribution,
  positionStats
}: FarmSummaryProps) {
  const selectedFarm = useFarmStore(state => state.selectedFarm)

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-200 to-green-400 px-6 py-4">
        <h3 className="text-xl font-semibold text-green-900">Farm Summary</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500">Farm</h4>
            <p className="text-2xl font-semibold text-gray-900">{selectedFarm?.name || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500">Total Examinations</h4>
            <p className="text-2xl font-semibold text-gray-900">{totalExaminations}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500">Average Score</h4>
            <p className="text-2xl font-semibold text-gray-900">{averageScore.toFixed(1)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500">Best Position</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {positionStats.reduce((best, current) => 
                current.averageScore > best.averageScore ? current : best
              ).position}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 