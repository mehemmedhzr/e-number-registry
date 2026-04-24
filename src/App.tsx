import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RegistrationsPage } from '@/pages/RegistrationsPage'
import { RegistrationFormPage } from '@/pages/RegistrationFormPage'
import { RegistrationDetailPage } from '@/pages/RegistrationDetailPage'
import { DraftsPage } from '@/pages/DraftsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Registrations */}
          <Route path="/registrations" element={<RegistrationsPage />} />
          <Route path="/registrations/:id" element={<RegistrationDetailPage />} />

          {/* IKTA-only */}
          <Route
            path="/registrations/create"
            element={
              <ProtectedRoute roles={['icta']}>
                <RegistrationFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrations/:id/edit"
            element={
              <ProtectedRoute roles={['icta']}>
                <RegistrationFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrations/drafts"
            element={
              <ProtectedRoute roles={['icta']}>
                <DraftsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
