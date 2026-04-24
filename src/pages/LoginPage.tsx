import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PhoneCall, LogIn } from 'lucide-react'
import { login } from '@/api/auth'
import { parseLoginResponse, formatApiError } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { UserRole } from '@/api/types'

const schema = z.object({
  role: z.enum(['icta', 'rinn'] as const),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [apiError, setApiError] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'icta' },
  })

  async function onSubmit(data: FormData) {
    setApiError(null)
    try {
      const res = await login({ role: data.role })
      const { token, role } = parseLoginResponse(res as unknown as Record<string, unknown>, data.role)
      setAuth(token, role as UserRole)
      navigate(from, { replace: true })
    } catch (e) {
      setApiError(formatApiError(e))
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl mb-4">
            <PhoneCall className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">E-Nömrə Reyestri</h1>
          <p className="text-slate-400 text-sm mt-1">Nömrə ehtiyatları idarəetmə sistemi</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Daxil ol</h2>
          <p className="text-sm text-slate-500 mb-6">Kabinetinizi seçin və daxil olun</p>

          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <fieldset className="mb-6">
              <legend className="text-sm font-medium text-slate-700 mb-3">
                Kabinet / Rol seçin
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'icta', label: 'IKTA', desc: 'Tam idarəetmə', color: 'blue' },
                  { value: 'rinn', label: 'RINN', desc: 'Oxumaq/Analiz', color: 'slate' },
                ] as const).map((opt) => (
                  <label
                    key={opt.value}
                    className="relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 border-slate-200 hover:border-slate-300"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('role')}
                      className="sr-only"
                    />
                    <span className="text-base font-bold text-slate-900">{opt.label}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              {!isSubmitting && <LogIn className="h-4 w-4" />}
              {isSubmitting ? 'Daxil olunur…' : 'Daxil ol'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          İKTA — Azərbaycan Respublikası İnformasiya, Kommunikasiya Texnologiyaları Agentliyi
        </p>
      </div>
    </div>
  )
}
