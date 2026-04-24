import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4 p-8 text-center bg-slate-50">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
        <SearchX className="h-10 w-10 text-slate-400" />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="text-slate-500 mt-2">Axtardığınız səhifə tapılmadı.</p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Ana səhifəyə qayıt</Link>
      </Button>
    </div>
  )
}
