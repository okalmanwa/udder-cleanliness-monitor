import ProtectedRoute from '../components/ProtectedRoute'
import Analytics from '@/app/components/Analytics'

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  )
} 