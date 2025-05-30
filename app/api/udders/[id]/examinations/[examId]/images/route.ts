import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; examId: string }> }) {
  const { id, examId } = await params

  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Extract the file path from the URL
    const urlParts = imageUrl.split('/public/')
    if (urlParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      )
    }
    const filePath = urlParts[1]

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('udder-images')
      .remove([filePath])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      return NextResponse.json(
        { error: 'Failed to delete image from storage' },
        { status: 500 }
      )
    }

    // Update the examination record to remove the image URL
    const { data: exam, error: examError } = await supabase
      .from('examinations')
      .select('images')
      .eq('id', examId)
      .single()

    if (examError) {
      console.error('Error fetching examination:', examError)
      return NextResponse.json(
        { error: 'Failed to fetch examination' },
        { status: 500 }
      )
    }

    const updatedImages = exam.images.filter((url: string) => url !== imageUrl)

    const { error: updateError } = await supabase
      .from('examinations')
      .update({ images: updatedImages })
      .eq('id', examId)

    if (updateError) {
      console.error('Error updating examination:', updateError)
      return NextResponse.json(
        { error: 'Failed to update examination' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Image deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 