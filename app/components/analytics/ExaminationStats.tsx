type ExaminationStatsProps = {
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

export default function ExaminationStats({
  totalExaminations = 0,
  averageScore = 0,
  scoreDistribution = [],
  positionStats = []
}: ExaminationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Total Examinations</h3>
        <p className="text-3xl font-bold text-blue-600">{totalExaminations}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Average Score</h3>
        <p className="text-3xl font-bold text-green-600">{averageScore.toFixed(1)}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Score Distribution</h3>
        <div className="mt-2 space-y-2">
          {scoreDistribution.map(({ score, count }) => (
            <div key={score} className="flex justify-between items-center">
              <span className="text-gray-600">Score {score}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Position Analysis</h3>
        <div className="mt-2 space-y-2">
          {positionStats.map(({ position, averageScore }) => (
            <div key={position} className="flex justify-between items-center">
              <span className="text-gray-600">{position}</span>
              <span className="font-semibold">{averageScore.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 