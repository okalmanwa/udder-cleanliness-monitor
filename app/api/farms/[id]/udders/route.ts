import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const { data, error } = await supabase
    .from('udders')
    .select('*')
    .eq('farm_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const { numCows } = await request.json()
  const farmId = id

  if (!numCows || numCows < 1) {
    return NextResponse.json({ error: 'numCows is required and must be >= 1' }, { status: 400 })
  }

  // Get the farm code
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('code')
    .eq('id', farmId)
    .single()

  if (farmError || !farm) {
    return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
  }

  // Find the current max cow_number for this farm
  const { data: udders, error: uddersError } = await supabase
    .from('udders')
    .select('cow_number')
    .eq('farm_id', farmId)
    .order('cow_number', { ascending: false })

  let startCow = 1
  if (udders && udders.length > 0) {
    const maxCow = Math.max(...udders.map(u => u.cow_number || 1))
    startCow = maxCow + 1
  }

  // Generate udders for each new cow
  const positions = ['LF', 'RF', 'LR', 'RR']
  const newUdders = []
  for (let cow = startCow; cow < startCow + numCows; cow++) {
    for (let posIdx = 0; posIdx < 4; posIdx++) {
      newUdders.push({
        farm_id: farmId,
        identifier: `${farm.code}-C${cow}-${positions[posIdx]}`,
        position: positions[posIdx],
        cow_number: cow,
      })
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('udders')
    .insert(newUdders)
    .select()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(inserted)
} 