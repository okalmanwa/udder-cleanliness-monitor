import { supabase } from './supabase'
import imageCompression from 'browser-image-compression'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_WIDTH = 1920 // Maximum width for compressed images
const MAX_HEIGHT = 1080 // Maximum height for compressed images

export async function uploadImage(file: File, udderId: string): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB')
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('File must be a JPEG, PNG, or WebP image')
  }

  // Compress the image
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: Math.max(MAX_WIDTH, MAX_HEIGHT),
    useWebWorker: true,
    fileType: file.type,
  })

  // Generate a unique file name
  const fileExt = file.name.split('.').pop()
  const fileName = `${udderId}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('udder-images')
    .upload(fileName, compressedFile, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('udder-images')
    .getPublicUrl(fileName)

  return publicUrl
}

export function validateImage(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 5MB'
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'File must be a JPEG, PNG, or WebP image'
  }

  return null
} 