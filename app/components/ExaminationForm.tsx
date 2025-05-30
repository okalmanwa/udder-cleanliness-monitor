'use client'

import { useState, useEffect, useRef } from 'react'
import { uploadImage, validateImage } from '@/lib/imageUpload'
import ImageGallery from './ImageGallery'
import { FaSeedling, FaStar, FaCamera, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { useFarmStore } from '../store/farmStore'

type ExaminationFormProps = {
  udderId: string
  udderIdentifier: string
  onExaminationComplete: (udderId: string, updatedExamination?: any) => void
  cardless?: boolean
  hideTitle?: boolean
  defaultPosition?: string
  defaultScore?: number
  examinationId?: string
  defaultImages?: string[]
}

const POSITIONS = ['LF', 'RF', 'LR', 'RR']

export default function ExaminationForm({ udderId, udderIdentifier, onExaminationComplete, cardless = false, hideTitle = false, defaultPosition = 'LF', defaultScore = 1, examinationId, defaultImages = [] }: ExaminationFormProps) {
  const [score, setScore] = useState<number>(defaultScore)
  const [position, setPosition] = useState<string>(defaultPosition)
  const [images, setImages] = useState<string[]>(defaultImages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [showGallery, setShowGallery] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [hasChanges, setHasChanges] = useState(false)
  const { selectedFarm, clearAnalyticsCache } = useFarmStore()

  // Remove the debounce update and useEffect for auto-updating
  const updateExamination = async () => {
    if (!examinationId) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/examinations/${examinationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, position, images })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update examination')
      }
      const updatedExamination = await response.json()
      
      // Clear analytics cache for this farm
      if (selectedFarm) {
        clearAnalyticsCache(selectedFarm.id)
      }
      
      setHasChanges(false)
      onExaminationComplete(udderId, updatedExamination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update examination. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Track changes
  useEffect(() => {
    if (examinationId) {
      const hasScoreChanged = score !== defaultScore
      const hasPositionChanged = position !== defaultPosition
      const hasImagesChanged = JSON.stringify(images) !== JSON.stringify(defaultImages)
      setHasChanges(hasScoreChanged || hasPositionChanged || hasImagesChanged)
    }
  }, [score, position, images, examinationId, defaultScore, defaultPosition, defaultImages])

  useEffect(() => {
    setScore(defaultScore)
  }, [defaultScore])

  useEffect(() => {
    setImages(defaultImages)
  }, [defaultImages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (examinationId) {
        // Update existing examination
        const response = await fetch(`/api/examinations/${examinationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score,
            position,
            images,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update examination')
        }

        const updatedExamination = await response.json()
        
        // Clear analytics cache for this farm
        if (selectedFarm) {
          clearAnalyticsCache(selectedFarm.id)
        }
        
        await onExaminationComplete(udderId, updatedExamination)
        
        // Then reset the form state
        setScore(defaultScore)
        setPosition(defaultPosition)
        setImages(defaultImages)
        setHasChanges(false)
      } else {
        // Create new examination
        const response = await fetch('/api/examinations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            udderId,
            score,
            position,
            images,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to submit examination')
        }

        const newExamination = await response.json()
        
        // Clear analytics cache for this farm
        if (selectedFarm) {
          clearAnalyticsCache(selectedFarm.id)
        }
        
        await onExaminationComplete(udderId, newExamination)
        
        // Then reset the form state
        setScore(defaultScore)
        setPosition(defaultPosition)
        setImages(defaultImages)
        setHasChanges(false)
      }
    } catch (err) {
      console.error('Examination submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit examination. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      const newImages: string[] = []
      const totalFiles = files.length
      let processedFiles = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate the image
        const validationError = validateImage(file)
        if (validationError) {
          throw new Error(validationError)
        }

        // Upload the image
        const imageUrl = await uploadImage(file, udderId)
        newImages.push(imageUrl)
        
        // Update progress
        processedFiles++
        setUploadProgress((processedFiles / totalFiles) * 100)
      }

      setImages([...images, ...newImages])
    } catch (err) {
      console.error('Image upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload images. Please try again.')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const openGallery = (index: number) => {
    setSelectedImageIndex(index)
    setShowGallery(true)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cardless
        ? 'space-y-6'
        : 'space-y-6 p-6 bg-green-50/70 border-2 border-green-200 rounded-2xl shadow-xl max-w-xl mx-auto animate-fade-in'}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50 rounded-2xl">
          <svg className="animate-spin h-10 w-10 text-green-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-green-700 text-base font-semibold">
            {examinationId ? 'Saving changes...' : 'Submitting examination...'}
          </span>
        </div>
      )}
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-2">
          <FaSeedling className="text-green-500 text-xl" />
          <h3 className="text-xl font-bold text-green-900">Examine {udderIdentifier}</h3>
        </div>
      )}
      <div>
        <label className="block text-base font-semibold text-green-800 mb-1 flex items-center gap-2">
          <FaSeedling className="text-green-400" /> Position
        </label>
        <div className="mt-1 flex gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(pos)}
              className={`px-5 py-2 rounded-full font-semibold text-base transition-all duration-200 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-green-400
                ${position === pos
                  ? 'bg-gradient-to-r from-green-400 to-blue-300 text-white border-green-400 scale-105'
                  : 'bg-white text-green-900 border-green-200 hover:bg-green-50 hover:scale-105'}`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-base font-semibold text-green-800 mb-1 flex items-center gap-2">
          <FaStar className="text-yellow-400" /> Score
        </label>
        <div className="mt-1 flex gap-2">
          {[1, 2, 3, 4].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setScore(value)}
              className={`px-5 py-2 rounded-full font-semibold text-base transition-all duration-200 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-blue-400
                ${score === value
                  ? 'bg-gradient-to-r from-blue-400 to-green-300 text-white border-blue-400 scale-105'
                  : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50 hover:scale-105'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-base font-semibold text-green-800 mb-1 flex items-center gap-2">
          <FaCamera className="text-blue-400" /> Images
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageUpload}
          className="mt-1 block w-full text-base text-green-900 bg-green-50 rounded-full border-2 border-green-200 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-green-400"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-green-700">
          Max file size: 5MB. Supported formats: JPEG, PNG, WebP
        </p>
        {uploadProgress > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
        {images.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <div 
                    className="relative w-full h-32 cursor-pointer border-2 border-blue-500 rounded-lg overflow-hidden group"
                    onClick={() => openGallery(index)}
                  >
                    <img
                      src={image}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="text-white text-sm font-medium">
                        Click to view
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-green-700 flex items-center gap-2">
              <span>{images.length} image(s) selected</span>
              <span className="text-blue-500">• Click any image to view full size</span>
              <span className="text-red-500">• Click Delete to remove an image</span>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-base font-medium">
          <FaExclamationCircle className="text-xl" />
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || (examinationId ? !hasChanges : false)}
        className="w-full px-6 py-3 text-lg font-bold rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-lg hover:from-green-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <FaCheckCircle /> {loading 
          ? 'Saving...' 
          : examinationId 
            ? hasChanges 
              ? 'Save Changes' 
              : 'No Changes'
            : 'Submit Examination'}
      </button>
      {showGallery && (
        <ImageGallery
          images={images}
          onClose={() => setShowGallery(false)}
        />
      )}
    </form>
  )
}
 