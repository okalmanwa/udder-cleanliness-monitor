import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from '@/app/components/Dashboard'

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
} 