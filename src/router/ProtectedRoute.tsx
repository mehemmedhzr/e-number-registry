import { Navigate } from 'react-router-dom'
import { useDigitalLoginStore } from '@/store/authStore'
import type { UserRole } from '@/api/types'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}


export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { companyType, getAuthToken } = useDigitalLoginStore();
  const { initialize } = useDigitalLoginStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if(!getAuthToken()) {
    return <Navigate to="/login" replace />
  }

  if (roles && companyType && !roles.includes(companyType as UserRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}