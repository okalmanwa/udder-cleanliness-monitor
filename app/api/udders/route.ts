import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { farmId, identifier, position } = await request.json()

  if (!farmId || !identifier || !position) {
    return NextResponse.json(
      { error: 'Farm ID, identifier, and position are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('udders')
    .insert([{ farm_id: farmId, identifier, position }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

type Examination = {
  score: number
  exam_timestamp: string
}

export async function GET(request: NextRequest) {
  try {
  const { searchParams } = new URL(request.url)
  const farmId = searchParams.get('farmId')
    const dateFilter = searchParams.get('dateFilter')
    const includeLatest = searchParams.get('includeLatest') === 'true'

  if (!farmId) {
      return NextResponse.json({ error: 'farmId is required' }, { status: 400 })
  }

  let query = supabase
    .from('udders')
      .select('*')
    .eq('farm_id', farmId)

    const { data: udders, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

    if (!includeLatest) {
      return NextResponse.json(udders)
    }

    // Efficiently fetch latest examination for each udder
    const uddersWithLatest = await Promise.all(
      udders.map(async (udder) => {
        const { data: latestExam } = await supabase
          .from('examinations')
          .select('score, exam_timestamp')
          .eq('udder_id', udder.id)
          .order('exam_timestamp', { ascending: false })
          .limit(1)
          .single()

        return {
    ...udder,
          latest_score: latestExam?.score,
          latest_exam_date: latestExam?.exam_timestamp,
        }
      })
    )

    return NextResponse.json(uddersWithLatest)
  } catch (err) {
    console.error('Error in udders API:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 