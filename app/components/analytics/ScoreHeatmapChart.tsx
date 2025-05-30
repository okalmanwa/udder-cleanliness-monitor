import React from 'react'
import { FaQuestionCircle } from 'react-icons/fa'

// Fallback: Table-based heatmap (Chart.js Matrix is not always available)
type ScoreHeatmapChartProps = {
  data: { position: string; month: string; average: number }[]
}

const POSITIONS = ['LF', 'RF', 'LR', 'RR']
const POSITION_NAMES = {
  'LF': 'Left Front',
  'RF': 'Right Front', 
  'LR': 'Left Rear',
  'RR': 'Right Rear'
}

function getColor(score: number) {
  // More nuanced color scale
  if (score <= 1.5) return '#10b981' // emerald-500 (excellent)
  if (score <= 2.0) return '#84cc16' // lime-500 (good)
  if (score <= 2.5) return '#eab308' // yellow-500 (fair)
  if (score <= 3.0) return '#f97316' // orange-500 (poor)
  if (score <= 3.5) return '#ef4444' // red-500 (bad)
  return '#dc2626' // red-600 (critical)
}

function getTextColor(score: number) {
  return score <= 2.0 ? '#ffffff' : '#000000'
}

function getScoreLabel(score: number) {
  if (score <= 1.5) return 'Excellent'
  if (score <= 2.0) return 'Good'
  if (score <= 2.5) return 'Fair'
  if (score <= 3.0) return 'Poor'
  if (score <= 3.5) return 'Bad'
  return 'Critical'
}

export default function ScoreHeatmapChart({ data }: ScoreHeatmapChartProps) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6 min-h-[200px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FaQuestionCircle className="mx-auto text-4xl mb-2 opacity-50" />
          <p className="text-lg font-medium">No position data available</p>
          <p className="text-sm">Complete examinations across different positions to see trends</p>
        </div>
      </div>
    )
  }

  // Get all unique months, sorted
  const months = Array.from(new Set(data.map(d => d.month))).sort()
  
  // Build a lookup for quick access
  const lookup: Record<string, Record<string, number>> = {}
  data.forEach(({ position, month, average }) => {
    if (!lookup[position]) lookup[position] = {}
    lookup[position][month] = average
  })

  // Check if we have data for multiple months
  const hasMultipleMonths = months.length > 1
  
  // For single month or limited data, show a compact card layout
  if (months.length === 1 || data.length <= 4) {
    const month = months[0]
    const positionsWithData = POSITIONS.filter(pos => lookup[pos]?.[month])
    
    if (positionsWithData.length === 0) {
      return (
        <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6 min-h-[200px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <FaQuestionCircle className="mx-auto text-4xl mb-2 opacity-50" />
            <p className="text-lg font-medium">No data for this period</p>
            <p className="text-sm">Complete some examinations to see position analysis</p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-green-900">Position Performance</h3>
          {hasMultipleMonths && (
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {month}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {POSITIONS.map(position => {
            const score = lookup[position]?.[month]
            const hasData = score !== undefined
            
            return (
              <div
                key={position}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  hasData
                    ? 'hover:shadow-md transform hover:scale-105 cursor-pointer'
                    : 'border-dashed border-gray-300 bg-gray-50'
                }`}
                style={{
                  backgroundColor: hasData ? getColor(score) : undefined,
                  borderColor: hasData ? getColor(score) : undefined,
                  color: hasData ? getTextColor(score) : '#9ca3af'
                }}
                title={hasData ? `${POSITION_NAMES[position as keyof typeof POSITION_NAMES]}: ${score.toFixed(2)} (${getScoreLabel(score)})` : `${POSITION_NAMES[position as keyof typeof POSITION_NAMES]}: No data`}
              >
                <div className="text-center">
                  <div className="font-bold text-lg">{position}</div>
                  <div className="text-sm opacity-80 mb-2">
                    {POSITION_NAMES[position as keyof typeof POSITION_NAMES].split(' ')[0]} {POSITION_NAMES[position as keyof typeof POSITION_NAMES].split(' ')[1]}
                  </div>
                  {hasData ? (
                    <>
                      <div className="text-2xl font-bold">{score.toFixed(1)}</div>
                      <div className="text-xs opacity-90">{getScoreLabel(score)}</div>
                    </>
                  ) : (
                    <div className="text-sm">No data</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Color scale legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Score Scale:</div>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span>1.0-1.5 Excellent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }}></div>
              <span>1.5-2.0 Good</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
              <span>2.0-2.5 Fair</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span>3.0+ Poor</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For multiple months, show the traditional heatmap but improved
  return (
    <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-green-900">Position Trends Over Time</h3>
        <span className="text-sm text-gray-600">{months.length} months</span>
      </div>
      
      {/* Add scrollable container for the table */}
      <div className="overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-gray-100">
        <table className="w-full border-separate border-spacing-1">
          <thead className="sticky top-0 bg-white/90 backdrop-blur-sm z-10">
            <tr>
              <th className="p-3 text-left text-green-900 font-bold bg-green-50 rounded-lg min-w-[100px]">
                Position
              </th>
              {months.map(month => (
                <th key={month} className="p-3 text-green-900 font-bold bg-green-50 rounded-lg min-w-[80px] text-center">
                  {month.split('-')[1]}/{month.split('-')[0].slice(-2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POSITIONS.map(position => (
              <tr key={position}>
                <td className="p-3 font-semibold text-green-800 bg-green-50 rounded-lg sticky left-0 z-10">
                  <div className="text-sm font-bold">{position}</div>
                  <div className="text-xs text-gray-600">
                    {POSITION_NAMES[position as keyof typeof POSITION_NAMES]}
                  </div>
                </td>
                {months.map(month => {
                  const avg = lookup[position]?.[month]
                  const hasData = avg !== undefined
                  
                  return (
                    <td
                      key={month}
                      className={`p-3 text-center font-bold rounded-lg transition-all duration-200 min-w-[80px] ${
                        hasData ? 'hover:scale-105 cursor-pointer shadow-sm' : 'bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: hasData ? getColor(avg) : undefined,
                        color: hasData ? getTextColor(avg) : '#9ca3af'
                      }}
                      title={hasData ? `${POSITION_NAMES[position as keyof typeof POSITION_NAMES]} - ${month}: ${avg.toFixed(2)} (${getScoreLabel(avg)})` : `${POSITION_NAMES[position as keyof typeof POSITION_NAMES]} - ${month}: No data`}
                    >
                      {hasData ? (
                        <div>
                          <div className="text-lg font-bold">{avg.toFixed(1)}</div>
                          <div className="text-xs opacity-90">{getScoreLabel(avg)}</div>
                        </div>
                      ) : (
                        <div className="text-sm">-</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Improved legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2">Score Scale:</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span>Excellent (1.0-1.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#84cc16' }}></div>
            <span>Good (1.5-2.0)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
            <span>Fair (2.0-2.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
            <span>Poor (2.5-3.0)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Bad (3.0-3.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
            <span>Critical (3.5+)</span>
          </div>
        </div>
      </div>
    </div>
  )
} 