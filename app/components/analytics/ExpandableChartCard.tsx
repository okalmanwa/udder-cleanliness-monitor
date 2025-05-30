import { useState } from 'react'
import { FaExpand, FaTimes } from 'react-icons/fa'

export default function ExpandableChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:bg-white/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-green-900">{title}</h3>
        <button
          onClick={() => setExpanded(true)}
          className="p-2 rounded-full bg-white/80 text-green-700 hover:bg-green-100 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Expand chart"
        >
          <FaExpand />
        </button>
      </div>
      <div className="transition-all duration-300">{children}</div>
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-4xl w-full mx-4 animate-fade-in">
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-gray-700 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Close expanded chart"
            >
              <FaTimes />
            </button>
            <h3 className="text-2xl font-bold text-green-900 mb-6 text-center">{title}</h3>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center">
              {children}
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
        </div>
      )}
    </div>
  )
} 