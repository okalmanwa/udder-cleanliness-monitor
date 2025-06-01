import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

type AnalyticsStoryProps = {
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
  timeRange: string
  farmName: string
}

export default function AnalyticsStory({
  totalExaminations,
  averageScore,
  scoreDistribution,
  positionStats,
  timeRange,
  farmName
}: AnalyticsStoryProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateStory = () => {
    const timeRangeText = {
      '7d': 'the last 7 days',
      '30d': 'the last 30 days',
      '90d': 'the last 90 days',
      '1y': 'the last year',
      'all': 'all time'
    }[timeRange]

    const bestPosition = positionStats.reduce((best, current) => 
      current.averageScore > best.averageScore ? current : best
    )
    const worstPosition = positionStats.reduce((worst, current) => 
      current.averageScore < worst.averageScore ? current : worst
    )

    const mostCommonScore = scoreDistribution.reduce((most, current) => 
      current.count > most.count ? current : most
    )

    return `
# ${farmName} - Udder Health Analytics Report
## Time Period: ${timeRangeText}

### Overview
Total Examinations: ${totalExaminations}
Average Score: ${averageScore.toFixed(1)}

### Key Findings
- The ${bestPosition.position} position showed the best health with an average score of ${bestPosition.averageScore.toFixed(1)}
- The ${worstPosition.position} position needs attention with an average score of ${worstPosition.averageScore.toFixed(1)}
- Score ${mostCommonScore.score} was the most common, appearing in ${mostCommonScore.count} examinations

### Score Distribution
${scoreDistribution.map(({ score, count }) => 
  `- Score ${score}: ${count} examinations`
).join('\n')}

### Position Analysis
${positionStats.map(({ position, averageScore }) => 
  `- ${position}: Average score of ${averageScore.toFixed(1)}`
).join('\n')}

### Recommendations
${generateRecommendations(averageScore, bestPosition, worstPosition)}
    `
  }

  const generateRecommendations = (
    averageScore: number,
    bestPosition: { position: string; averageScore: number },
    worstPosition: { position: string; averageScore: number }
  ) => {
    const recommendations = []

    if (averageScore < 2) {
      recommendations.push('- Immediate attention required: Overall udder health is below acceptable levels')
    } else if (averageScore < 3) {
      recommendations.push('- Monitor closely: Some improvement needed in udder health')
    }

    if (worstPosition.averageScore < 2) {
      recommendations.push(`- Focus on ${worstPosition.position} position: Implement targeted care and monitoring`)
    }

    if (bestPosition.averageScore > 3) {
      recommendations.push(`- Maintain current practices for ${bestPosition.position} position`)
    }

    return recommendations.join('\n')
  }

  const exportStory = () => {
    setIsGenerating(true)
    const story = generateStory()
    const blob = new Blob([story], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${farmName}-analytics-${timeRange}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsGenerating(false)
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={exportStory}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-300 text-white rounded-full hover:from-green-500 hover:to-blue-400 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          {isGenerating ? 'Generating...' : 'Export Report'}
        </button>
      </div>
      <div className="prose prose-blue max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-3xl font-bold text-green-900 mb-6 border-b border-green-200 pb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-semibold text-green-800 mt-8 mb-4" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold text-green-700 mt-6 mb-3" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-gray-600 leading-relaxed mb-4" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-6 space-y-2 text-gray-600" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed" {...props} />
            ),
          }}
        >
          {generateStory()}
        </ReactMarkdown>
      </div>
    </div>
  )
} 