'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ExaminationForm from './ExaminationForm'
import ImageGallery from './ImageGallery'
import * as XLSX from 'xlsx'
import { FaCheckCircle, FaExclamationTriangle, FaRegSadTear } from 'react-icons/fa'
import { GiCow } from 'react-icons/gi'
import { useFarmStore } from '../store/farmStore'

type Udder = {
  id: string
  identifier: string
  position: string
  latest_score?: number
  latest_exam_date?: string
  examinations?: Array<{
    id: string
    score: number
    exam_timestamp: string
    images: string[]
  }>
  cow_number: string
}

type UdderGridProps = {
  farmId: string
  dateFilter: string
  setExportCSVHandler: (fn: () => void) => void
  setExportExcelHandler: (fn: () => void) => void
}

const getScoreColor = (score?: number) => {
  if (!score) return 'bg-gray-100 border border-gray-200'
  switch (score) {
    case 1: return 'bg-green-100 border-2 border-green-400'
    case 2: return 'bg-yellow-100 border-2 border-yellow-400'
    case 3: return 'bg-orange-100 border-2 border-orange-400'
    case 4: return 'bg-red-100 border-2 border-red-400'
    default: return 'bg-gray-100 border border-gray-200'
  }
}

const DATE_FILTERS = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last Year', value: '1y' },
]

export default function UdderGrid({ farmId, dateFilter, setExportCSVHandler, setExportExcelHandler }: UdderGridProps) {
  const [udders, setUdders] = useState<Udder[]>([])
  const [selectedUdder, setSelectedUdder] = useState<Udder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [farmName, setFarmName] = useState('')
  const [showGallery, setShowGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const { setUddersCache, getUddersCache, clearAnalyticsCache } = useFarmStore()

  useEffect(() => {
    const fetchFarmName = async () => {
      try {
        const response = await fetch(`/api/farms/${farmId}`)
        if (!response.ok) throw new Error('Failed to fetch farm details')
        const data = await response.json()
        setFarmName(data.name)
      } catch (err) {
        console.error('Error fetching farm name:', err)
      }
    }
    fetchFarmName()
  }, [farmId])

  useEffect(() => {
    setExportCSVHandler(() => async () => {
      await exportToCSV(udders)
    })
  }, [udders, setExportCSVHandler])

  useEffect(() => {
    setExportExcelHandler(() => async () => {
      await exportToExcel(udders)
    })
  }, [udders, setExportExcelHandler])

  const fetchUdders = async () => {
    setLoading(true)
    setError('')
    try {
      const queryParams = new URLSearchParams({
        farmId,
        dateFilter,
        includeLatest: 'true' // Fetch latest examination info for cards
      })

      const response = await fetch(`/api/udders?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch udders')
      const data = await response.json()

      // Set udders with latest examination info but no detailed examinations
      // Detailed examinations will be loaded when udders are clicked
      const uddersWithBasicInfo = data.map((udder: Udder) => ({
        ...udder,
        examinations: [], // Start with empty examinations array
        // latest_score and latest_exam_date are already included from API
      }))

      setUdders(uddersWithBasicInfo)
    } catch (err) {
      console.error('Error fetching udders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch udders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUdders()
  }, [farmId, dateFilter])

  const handleUdderClick = async (udder: Udder) => {
    try {
      // Fetch detailed examination data including images
      const response = await fetch(`/api/udders/${udder.id}/examinations`)
      if (!response.ok) throw new Error('Failed to fetch examination details')
      const examinations = await response.json()
      
      // Update the udder with detailed examination data
      setSelectedUdder({
        ...udder,
        examinations: examinations.map((exam: any) => ({
          id: exam.id,
          score: exam.score,
          exam_timestamp: exam.exam_timestamp,
          images: exam.images || []
        })),
        latest_score: examinations[0]?.score,
        latest_exam_date: examinations[0]?.exam_timestamp,
      })
    } catch (err) {
      console.error('Error fetching examination details:', err)
      setSelectedUdder(udder)
    }
  }

  const handleExaminationComplete = async (udderId: string, updatedExamination?: any) => {
    setSelectedUdder(null)
    
    // Clear analytics cache for this farm when examination is completed
    clearAnalyticsCache(farmId)
    
    try {
      let examinations
      
      if (updatedExamination) {
        // If we received the updated examination data directly, use it
        const originalUdder = udders.find(u => u.id === udderId)
        if (!originalUdder) return
        
        // Update examinations list - replace the updated one or add new one
        examinations = originalUdder.examinations || []
        const existingIndex = examinations.findIndex(exam => exam.id === updatedExamination.id)
        
        if (existingIndex >= 0) {
          // Update existing examination
          examinations[existingIndex] = {
            id: updatedExamination.id,
            score: updatedExamination.score,
            exam_timestamp: updatedExamination.exam_timestamp,
            images: updatedExamination.images || []
          }
        } else {
          // Add new examination
          examinations.unshift({
            id: updatedExamination.id,
            score: updatedExamination.score,
            exam_timestamp: updatedExamination.exam_timestamp,
            images: updatedExamination.images || []
          })
        }
        
        // Sort examinations by date (newest first)
        examinations.sort((a: any, b: any) => new Date(b.exam_timestamp).getTime() - new Date(a.exam_timestamp).getTime())
      } else {
        // Fallback: Fetch the updated udder's examinations from API
        const response = await fetch(`/api/udders/${udderId}/examinations`)
        if (!response.ok) throw new Error('Failed to fetch updated udder')
        examinations = await response.json()
        examinations.sort((a: any, b: any) => new Date(b.exam_timestamp).getTime() - new Date(a.exam_timestamp).getTime())
        examinations = examinations.map((exam: any) => ({
          id: exam.id,
          score: exam.score,
          exam_timestamp: exam.exam_timestamp,
          images: exam.images || []
        }))
      }
      
      const originalUdder = udders.find(u => u.id === udderId)
      if (!originalUdder) return
      
      const updatedUdder: Udder = {
        ...originalUdder,
        examinations,
        latest_score: examinations[0]?.score,
        latest_exam_date: examinations[0]?.exam_timestamp,
      }
      
      // Update only the specific udder in state - no need to refetch all udders
      setUdders(prev => prev.map(u => u.id === udderId ? updatedUdder : u))
      
    } catch (err) {
      console.error('Error updating udder:', err)
      // If there's an error, fall back to refetching all udders
      await fetchUdders()
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No exam yet'
    return new Date(dateString).toLocaleDateString()
  }

  const calculateFarmStats = (udders: Udder[]) => {
    const stats = {
      totalUdders: udders.length,
      scoredUdders: 0,
      averageScore: 0,
      scoreDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0
      },
      totalExaminations: 0
    }

    let totalScore = 0

    udders.forEach(udder => {
      if (udder.latest_score) {
        stats.scoredUdders++
        totalScore += udder.latest_score
        stats.scoreDistribution[udder.latest_score as keyof typeof stats.scoreDistribution]++
      }
      stats.totalExaminations += udder.examinations?.length || 0
    })

    stats.averageScore = stats.scoredUdders > 0 ? totalScore / stats.scoredUdders : 0

    return stats
  }

  const fetchAllExaminations = async (udders: Udder[]): Promise<Udder[]> => {
    const updatedUdders = await Promise.all(
      udders.map(async (udder) => {
        try {
          const response = await fetch(`/api/udders/${udder.id}/examinations`);
          if (!response.ok) throw new Error('Failed to fetch examination details');
          const examinations = await response.json();
          return {
            ...udder,
            examinations: examinations.map((exam: any) => ({
              id: exam.id,
              score: exam.score,
              exam_timestamp: exam.exam_timestamp,
              images: exam.images || []
            }))
          };
        } catch (err) {
          console.error('Error fetching examination details:', err);
          return udder;
        }
      })
    );
    return updatedUdders;
  };

  const exportToCSV = async (udders: Udder[]) => {
    const uddersWithExaminations = await fetchAllExaminations(udders);
    const farmStats = calculateFarmStats(uddersWithExaminations);
    let timePeriod = 'All Time';
    const filterLabel = DATE_FILTERS.find(f => f.value === dateFilter)?.label;
    if (filterLabel) timePeriod = filterLabel;

    // Create summary section with pivoted data
    const summaryRows = [
      ['Farm Name', farmName],
      ['Time Period', timePeriod],
      [''],
      ['Metric', 'Value'],
      ['Total Udders', farmStats.totalUdders],
      ['Scored Udders', farmStats.scoredUdders],
      ['Average Score', farmStats.averageScore.toFixed(1)],
      ['Total Examinations', farmStats.totalExaminations],
      [''],
      ['Score Distribution'],
      ['Score 1', farmStats.scoreDistribution[1]],
      ['Score 2', farmStats.scoreDistribution[2]],
      ['Score 3', farmStats.scoreDistribution[3]],
      ['Score 4', farmStats.scoreDistribution[4]],
      [''],
      ['Detailed Examination Data'],
      ['']  // Empty row for separation
    ];

    // Create detailed data rows - one row per examination
    const detailRows = uddersWithExaminations.flatMap(udder =>
      (udder.examinations || [])
        .map(exam => [
          farmName,
          udder.id,
          udder.identifier,
          udder.cow_number,
          udder.position,
          exam.score,
          new Date(exam.exam_timestamp).toLocaleDateString(),
          exam.images?.join('; ') || '' // Include image URLs
        ])
    ).sort((a, b) => new Date(b[6]).getTime() - new Date(a[6]).getTime()); // Sort by exam date, newest first

    // Combine all sections
    const csvContent = [
      ...summaryRows.map(row => row.join(',')),
      'Farm Name,Udder ID,Identifier,Cow Number,Position,Score,Exam Date,Images',
      ...detailRows.map(row => row.join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `${farmName}-udder-examinations-${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async (udders: Udder[]) => {
    const uddersWithExaminations = await fetchAllExaminations(udders);
    const farmStats = calculateFarmStats(uddersWithExaminations);
    let timePeriod = 'All Time';
    const filterLabel = DATE_FILTERS.find(f => f.value === dateFilter)?.label;
    if (filterLabel) timePeriod = filterLabel;

    // Create summary worksheet with pivoted data
    const summaryData = [
      ['Farm Name', farmName],
      ['Time Period', timePeriod],
      [''],
      ['Metric', 'Value'],
      ['Total Udders', farmStats.totalUdders],
      ['Scored Udders', farmStats.scoredUdders],
      ['Average Score', farmStats.averageScore.toFixed(1)],
      ['Total Examinations', farmStats.totalExaminations],
      [''],
      ['Score Distribution'],
      ['Score 1', farmStats.scoreDistribution[1]],
      ['Score 2', farmStats.scoreDistribution[2]],
      ['Score 3', farmStats.scoreDistribution[3]],
      ['Score 4', farmStats.scoreDistribution[4]]
    ];

    // Create detailed data worksheet - one row per examination
    const detailData = [
      ['Farm Name', 'Udder ID', 'Identifier', 'Cow Number', 'Position', 'Score', 'Exam Date', 'Images'],
      ...uddersWithExaminations.flatMap(udder =>
        (udder.examinations || [])
          .map(exam => [
            farmName,
            udder.id,
            udder.identifier,
            udder.cow_number,
            udder.position,
            exam.score,
            new Date(exam.exam_timestamp).toLocaleDateString(),
            exam.images?.join('; ') || '' // Include image URLs
          ])
      ).sort((a, b) => new Date(b[6]).getTime() - new Date(a[6]).getTime()) // Sort by exam date, newest first
    ];

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    
    // Add detailed data sheet
    const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Examinations');

    // Generate Excel file with farm name in the title
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${farmName}-udder-examinations-${date}.xlsx`);
  };

  const openGallery = (images: string[], startIndex: number) => {
    setGalleryImages(images)
    setSelectedImageIndex(startIndex)
    setShowGallery(true)
  }

  const handleDeleteImage = async (examId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/udders/${selectedUdder?.id}/examinations/${examId}/images?imageUrl=${encodeURIComponent(imageUrl)}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      // Update the local state to remove the image
      if (selectedUdder) {
        setSelectedUdder({
          ...selectedUdder,
          examinations: selectedUdder.examinations?.map(exam => {
            if (exam.id === examId) {
              return {
                ...exam,
                images: exam.images.filter(url => url !== imageUrl)
              }
            }
            return exam
          })
        })
      }
    } catch (err) {
      console.error('Error deleting image:', err)
      alert('Failed to delete image. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <svg className="animate-spin h-12 w-12 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="text-green-700 text-lg font-semibold">Fetching examinations...</span>
    </div>
  )
  if (error) return <div className="text-red-500">{error}</div>

  const farmStats = calculateFarmStats(udders || [])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(udders || []).map((udder) => {
          let statusIcon = <GiCow className="text-green-400 text-2xl" />
          let statusText = 'Healthy'
          let statusColor = 'text-green-700'
          if (!udder.latest_score) {
            statusIcon = <FaRegSadTear className="text-gray-400 text-2xl" />
            statusText = 'No exam yet'
            statusColor = 'text-gray-500'
          } else if (udder.latest_score === 2) {
            statusIcon = <FaExclamationTriangle className="text-yellow-400 text-2xl" />
            statusText = 'Monitor'
            statusColor = 'text-yellow-700'
          } else if (udder.latest_score === 3) {
            statusIcon = <FaExclamationTriangle className="text-orange-400 text-2xl" />
            statusText = 'Warning'
            statusColor = 'text-orange-700'
          } else if (udder.latest_score === 4) {
            statusIcon = <FaExclamationTriangle className="text-red-400 text-2xl" />
            statusText = 'Critical'
            statusColor = 'text-red-700'
          }
          return (
            <button
              key={udder.id}
              onClick={() => handleUdderClick(udder)}
              className={`group p-5 rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-400 ${getScoreColor(udder.latest_score)}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {statusIcon}
                <span className={`font-bold text-lg ${statusColor}`}>{statusText}</span>
              </div>
              <div className="font-semibold text-green-900 text-xl mb-1">Udder {udder.identifier}</div>
              <div className="text-sm text-blue-700 mb-1 font-semibold">Cow: {udder.cow_number}</div>
              <div className="text-sm text-green-700 mb-1">Position: <span className="font-bold">{udder.position}</span></div>
              <div className="text-sm text-green-700 mb-1">
                Latest Score: <span className="font-bold">{udder.latest_score || 'No score yet'}</span>
              </div>
              <div className="text-xs text-green-600">
                Last Exam: {formatDate(udder.latest_exam_date)}
              </div>
            </button>
          )
        })}
      </div>

      {selectedUdder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-green-50/90 border-2 border-green-200 rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-0">
            <div className="flex justify-end items-center px-6 pt-6 pb-2">
              <button
                onClick={() => setSelectedUdder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 pb-6">
              {/* Show latest examination images if available */}
              {(selectedUdder.examinations ?? [])[0]?.images?.length > 0 && (
                <div className="mb-6">
                  <div className="font-semibold text-green-900 mb-2">Latest Examination Images</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedUdder.examinations ?? [])[0]?.images?.map((image, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className="relative w-full h-32 cursor-pointer border-2 border-blue-500 rounded-lg overflow-hidden group"
                          onClick={() => openGallery((selectedUdder.examinations ?? [])[0]?.images ?? [], idx)}
                        >
                          <img
                            src={image}
                            alt={`Examination image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <div className="text-white text-sm font-medium">
                              Click to view
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ExaminationForm
                udderId={selectedUdder.id}
                udderIdentifier={selectedUdder.identifier}
                onExaminationComplete={handleExaminationComplete}
                cardless
                hideTitle
                examinationId={(selectedUdder.examinations ?? [])[0]?.id}
                defaultScore={(selectedUdder.examinations ?? [])[0]?.score ?? 1}
                defaultPosition={selectedUdder.position}
                defaultImages={(selectedUdder.examinations ?? [])[0]?.images ?? []}
              />
            </div>
          </div>
        </div>
      )}

      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
          <ImageGallery
            images={galleryImages}
            onClose={() => setShowGallery(false)}
          />
        </div>
      )}
    </div>
  )
} 