import { Link } from 'react-router-dom'
import {
  ListOrdered,
  PlusCircle,
  ClipboardCheck,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useRegistrationsList } from '@/hooks/useRegistrations'

export function DashboardPage() {
  const { role, canCreate } = useAuthStore()
  const { data, drafts, loading } = useRegistrationsList()

  const stats = [
    {
      label: 'Ümumi qeydiyyat',
      value: loading ? '…' : data.length,
      icon: <ListOrdered className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50',
    },
    {
      label: 'Qaralamalar',
      value: loading ? '…' : drafts.length,
      icon: <ClipboardCheck className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50',
      hidden: role !== 'icta',
    },
    {
      label: 'Təsdiq olunmuş',
      value: loading ? '…' : data.length - drafts.length,
      icon: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
      color: 'bg-emerald-50',
    },
  ].filter((s) => !s.hidden)

  const quickLinks = [
    {
      label: 'Ümumi reyestr',
      desc: 'Bütün nömrə qeydiyyatlarına baxın',
      to: '/registrations',
      icon: <ListOrdered className="h-5 w-5" />,
    },
    canCreate() && {
      label: 'Yeni qeydiyyat',
      desc: 'Yeni nömrə resursu qeydiyyatı əlavə edin',
      to: '/registrations/create',
      icon: <PlusCircle className="h-5 w-5" />,
    },
    role === 'icta' && {
      label: 'Qaralamalar',
      desc: 'Gözləyən qeydiyyatları idarə edin',
      to: '/registrations/drafts',
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
  ].filter(Boolean) as { label: string; desc: string; to: string; icon: React.ReactNode }[]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">İdarə paneli</h2>
        <p className="text-slate-500 mt-1">
          {role === 'icta' ? 'IKTA kabineti' : 'RINN kabineti'} — Xoş gəldiniz
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tez keçidlər</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 hover:border-slate-300 transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">{link.label}</div>
                <div className="text-sm text-slate-500 truncate">{link.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
