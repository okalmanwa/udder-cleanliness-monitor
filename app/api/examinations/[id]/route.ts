import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { score, position, images } = await request.json()

    if (!id || (!score && !position && !images)) {
      return NextResponse.json({ error: 'Invalid update data' }, { status: 400 })
    }

    const updates: any = {}
    if (score !== undefined) updates.score = score
    if (position !== undefined) updates.position = position
    if (images !== undefined) updates.images = images

    const { data, error } = await supabase
      .from('examinations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
} 