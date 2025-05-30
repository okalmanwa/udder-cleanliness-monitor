'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FaChartBar, FaHome, FaSignOutAlt } from 'react-icons/fa'

export default function Navigation() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-green-600 font-bold text-xl">
                UdderHygiene Monitor
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-green-600"
              >
                <FaHome className="mr-2" /> Dashboard
              </Link>
              <Link
                href="/analytics"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-green-600"
              >
                <FaChartBar className="mr-2" /> Analytics
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaSignOutAlt className="mr-2" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 