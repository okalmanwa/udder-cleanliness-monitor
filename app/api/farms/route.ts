import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('farms')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const { name, code, numCows } = await request.json()

    if (!name || !code || !numCows || numCows < 1) {
      return NextResponse.json(
        { error: 'Name, code, and numCows are required' },
        { status: 400 }
      )
    }

    // Use the robust SQL function for atomic creation
    const { data, error } = await supabase
      .rpc('create_farm_with_udders', {
        farm_name: name,
        farm_code: code,
        num_cows: numCows,
      })
      .single()

    if (error) {
      console.error('Error creating farm and udders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error in POST /api/farms:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 