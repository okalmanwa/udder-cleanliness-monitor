'use client'

import { useRouter } from 'next/navigation'
import { GiCow } from 'react-icons/gi'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <GiCow className="text-5xl text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Registration Disabled
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This application is restricted to authorized users only.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-lg text-sm">
            Please contact your administrator for access.
          </div>

          <Link
            href="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
} 