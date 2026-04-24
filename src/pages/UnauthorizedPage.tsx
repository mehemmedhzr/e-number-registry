import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4 p-8 text-center bg-slate-50">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
        <ShieldOff className="h-10 w-10 text-red-400" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">İcazəniz yoxdur</h1>
        <p className="text-slate-500 mt-2">Bu səhifəyə daxil olmaq üçün lazımi icazəniz yoxdur.</p>
      </div>
      <Button asChild variant="outline">
        <Link to="/dashboard">Ana səhifəyə qayıt</Link>
      </Button>
    </div>
  )
}
