import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { udderId, score, position, images } = await request.json()

    // Log the received data
    console.log('Received examination data:', { udderId, score, position, images })

    if (!udderId || !score || score < 1 || score > 4 || !position) {
      console.error('Invalid examination data:', { udderId, score, position })
      return NextResponse.json(
        { error: 'Invalid examination data' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('examinations')
      .insert([{ 
        udder_id: udderId, 
        score, 
        position,
        images: images || [] 
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error in examinations API:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 