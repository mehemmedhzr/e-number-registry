import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useDigitalLoginStore } from '@/store/authStore'
import type { UserRole } from '@/api/types'
import { useEffect } from 'react'
import { apiClient } from '@/api/client'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}


export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { companyType, getDigitalLogin, getAuthToken } = useDigitalLoginStore();
  const location = useLocation()
  const navigate = useNavigate();

  const { initialize } = useDigitalLoginStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  console.log(getAuthToken())
  useEffect(() => {
    console.log(getDigitalLogin())
    if(!getDigitalLogin()) {
      apiClient.post('/getDigitalLoginUrl').then(res => {
        const url = res.data.payload.loginUrl;
        // window.location.href = url;
        // console.log(23)
        window.location.href = 'http://localhost:5173/login?code=6dd2790d62c849c6afcb6e284f77ccac';
        // navigate('/login?code=eba5d988a3294469bc59ee088b59a60c');
      }).catch(err => {
        console.log(err);
        navigate('/unauthorized');
      })
    } else if (!getAuthToken()) {
      navigate('/login');
    }
  }, [getDigitalLogin()])

  if (roles && companyType && !roles.includes(companyType as UserRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}