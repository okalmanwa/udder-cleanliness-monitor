import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type Udder = {
  id: string
  position: string
  cow_number: number
}

type Examination = {
  id: string
  score: number
  exam_timestamp: string
  udders: Udder
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = new Date(0) // Beginning of time
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Fetch all udders for the farm
    const { data: udders, error: uddersError } = await supabase
      .from('udders')
      .select('id')
      .eq('farm_id', farmId)

    if (uddersError) {
      console.error('Error fetching udders:', uddersError)
      return NextResponse.json({ error: uddersError.message }, { status: 500 })
    }
    const udderIds = udders?.map((u: { id: string }) => u.id) || []
    if (udderIds.length === 0) {
      // Return empty data structure with all possible scores initialized to 0
      return NextResponse.json({
        totalExaminations: 0,
        averageScore: 0,
        scoreDistribution: [
          { score: 1, count: 0 },
          { score: 2, count: 0 },
          { score: 3, count: 0 },
          { score: 4, count: 0 }
        ],
        positionStats: [
          { position: 'LF', averageScore: 0 },
          { position: 'RF', averageScore: 0 },
          { position: 'LR', averageScore: 0 },
          { position: 'RR', averageScore: 0 }
        ],
        scoreTrend: [],
        positionTrend: [],
        examinationsVolumeTrend: [],
        averageScoreTrend: [],
        scoreByCow: [],
        scoreHeatmapPositionMonth: []
      })
    }
    // Fetch examinations for those udders within the date range
    const { data: examinations, error } = await supabase
      .from('examinations')
      .select(`*, udders ( position, cow_number )`)
      .in('udder_id', udderIds)
      .gte('exam_timestamp', startDate.toISOString())
      .order('exam_timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching examinations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!examinations || examinations.length === 0) {
      // Return empty data structure with all possible scores initialized to 0
      return NextResponse.json({
        totalExaminations: 0,
        averageScore: 0,
        scoreDistribution: [
          { score: 1, count: 0 },
          { score: 2, count: 0 },
          { score: 3, count: 0 },
          { score: 4, count: 0 }
        ],
        positionStats: [
          { position: 'LF', averageScore: 0 },
          { position: 'RF', averageScore: 0 },
          { position: 'LR', averageScore: 0 },
          { position: 'RR', averageScore: 0 }
        ],
        scoreTrend: [],
        positionTrend: [],
        examinationsVolumeTrend: [],
        averageScoreTrend: [],
        scoreByCow: [],
        scoreHeatmapPositionMonth: []
      })
    }

    // Calculate total examinations and average score
    const totalExaminations = examinations.length
    const averageScore = examinations.reduce((acc: number, exam: Examination) => acc + exam.score, 0) / totalExaminations

    // Calculate score distribution - ensure all scores are represented
    const scoreCounts = new Map<number, number>()
    for (let i = 1; i <= 4; i++) {
      scoreCounts.set(i, 0)
    }
    examinations.forEach((exam: Examination) => {
      scoreCounts.set(exam.score, (scoreCounts.get(exam.score) || 0) + 1)
    })
    const scoreDistribution = Array.from(scoreCounts.entries()).map(([score, count]) => ({
      score,
      count
    }))

    // Calculate position statistics
    const positionStats = ['LF', 'RF', 'LR', 'RR'].map(position => {
      const positionExams = examinations.filter((exam: Examination) => exam.udders?.position === position)
      const avgScore = positionExams.length > 0 
        ? positionExams.reduce((acc: number, exam: Examination) => acc + exam.score, 0) / positionExams.length 
        : 0
      return {
        position,
        averageScore: avgScore
      }
    })

    // Calculate score trend over time
    const scoreTrend = examinations.map((exam: Examination) => ({
      date: exam.exam_timestamp,
      score: exam.score
    }))

    // Calculate position trend over time
    const positionTrend = examinations.map((exam: Examination) => ({
      date: exam.exam_timestamp,
      position: exam.udders?.position || '',
      score: exam.score
    }))

    // 1. Examinations Over Time (by month)
    const examsByMonth: { [month: string]: number } = {}
    examinations.forEach((exam: Examination) => {
      const month = exam.exam_timestamp.slice(0, 7) // YYYY-MM
      examsByMonth[month] = (examsByMonth[month] || 0) + 1
    })
    const examinationsVolumeTrend = Object.entries(examsByMonth).map(([month, count]) => ({ month, count }))

    // 2. Average Score Over Time (by month)
    const scoresByMonth: { [month: string]: number[] } = {}
    examinations.forEach((exam: Examination) => {
      const month = exam.exam_timestamp.slice(0, 7)
      if (!scoresByMonth[month]) scoresByMonth[month] = []
      scoresByMonth[month].push(exam.score)
    })
    const averageScoreTrend = Object.entries(scoresByMonth).map(([month, scores]) => ({
      month,
      average: scores.reduce((a: number, b: number) => a + b, 0) / scores.length
    }))

    // 3. Score Breakdown by Cow
    const scoresByCow: { [cow: number]: number[] } = {}
    examinations.forEach((exam: Examination) => {
      const cow = exam.udders?.cow_number
      if (cow) {
        if (!scoresByCow[cow]) scoresByCow[cow] = []
        scoresByCow[cow].push(exam.score)
      }
    })
    const scoreByCow = Object.entries(scoresByCow).map(([cow, scores]) => ({
      cow_number: Number(cow),
      average: scores.reduce((a: number, b: number) => a + b, 0) / scores.length
    }))

    // 4. Score Heatmap by Position and Month
    const heatmap: { [key: string]: number[] } = {}
    examinations.forEach((exam: Examination) => {
      const month = exam.exam_timestamp.slice(0, 7)
      const pos = exam.udders?.position || 'Unknown'
      const key = `${pos}_${month}`
      if (!heatmap[key]) heatmap[key] = []
      heatmap[key].push(exam.score)
    })
    const scoreHeatmapPositionMonth = Object.entries(heatmap).map(([key, scores]) => {
      const [position, month] = key.split('_')
      return {
        position,
        month,
        average: scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      }
    })

    return NextResponse.json({
      totalExaminations,
      averageScore,
      scoreDistribution,
      positionStats,
      scoreTrend,
      positionTrend,
      examinationsVolumeTrend,
      averageScoreTrend,
      scoreByCow,
      scoreHeatmapPositionMonth
    })
  } catch (error) {
    console.error('Error in analytics endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 