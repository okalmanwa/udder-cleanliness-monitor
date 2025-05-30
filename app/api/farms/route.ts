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

    // Create the farm
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .insert([{ name, code }])
      .select()
      .single()

    if (farmError) {
      console.error('Error creating farm:', farmError)
      return NextResponse.json({ error: farmError.message }, { status: 500 })
    }

    if (!farm) {
      console.error('No farm data returned after creation')
      return NextResponse.json({ error: 'Failed to create farm' }, { status: 500 })
    }

    // Generate udders for each cow (4 per cow: LF, RF, LR, RR)
    const positions = ['LF', 'RF', 'LR', 'RR']
    const udders = []
    for (let cow = 1; cow <= numCows; cow++) {
      for (let posIdx = 0; posIdx < 4; posIdx++) {
        udders.push({
          farm_id: farm.id,
          identifier: `${code}-C${cow}-${positions[posIdx]}`,
          position: positions[posIdx],
          cow_number: cow,
        })
      }
    }

    // Insert udders
    const { error: uddersError } = await supabase
      .from('udders')
      .insert(udders)

    if (uddersError) {
      console.error('Error creating udders:', uddersError)
      return NextResponse.json({ error: uddersError.message }, { status: 500 })
    }

    return NextResponse.json(farm)
  } catch (error) {
    console.error('Unexpected error in POST /api/farms:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 