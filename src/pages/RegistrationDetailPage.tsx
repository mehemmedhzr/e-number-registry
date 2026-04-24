import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle,
  ExternalLink,
  FileText,
  Building2,
  Phone,
  BarChart3,
  FileCheck,
  ClipboardList,
  RefreshCw,
} from 'lucide-react'
import { useRegistrationDetail } from '@/hooks/useRegistrations'
import { useAuthStore } from '@/store/authStore'
import { isRegistrationDraft, submitRegistration, deleteRegistration } from '@/api/registrations'
import { formatApiError, buildFileUrl } from '@/api/client'
import { formatDate, formatDateTime, formatUserLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string | null | React.ReactNode }) {
  const empty = !value || value === '—' || value === ''
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <dt className="sm:w-52 flex-shrink-0 text-sm text-slate-500 font-medium">{label}</dt>
      <dd className={`text-sm ${empty ? 'text-slate-400 italic' : 'text-slate-900'}`}>
        {empty ? 'Daxil edilməyib' : value}
      </dd>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-blue-500">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-3 pb-4">
        <dl>{children}</dl>
      </CardContent>
    </Card>
  )
}

// ─── File Link ────────────────────────────────────────────────────────────────

function FileLink({ path, label }: { path: string | null | undefined; label: string }) {
  const url = buildFileUrl(path || null)
  if (!url) return <span className="text-slate-400 italic text-sm">Fayl yoxdur</span>
  const name = (path || '').split('/').pop() || label
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
    >
      <FileText className="h-4 w-4 flex-shrink-0" />
      <span className="truncate max-w-xs">{name}</span>
      <ExternalLink className="h-3 w-3 flex-shrink-0 text-blue-400" />
    </a>
  )
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusDisplay({ status }: { status?: { slug?: string; name?: string; label?: string } }) {
  if (!status) return <Badge variant="default">—</Badge>
  const slug = status.slug?.toLowerCase() || ''
  const name = status.name || status.label || status.slug || '—'
  if (slug === 'draft' || slug === 'qaralama') {
    return <Badge variant="draft">Qaralama</Badge>
  }
  return <Badge variant="success">{name}</Badge>
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ConfirmType = 'submit' | 'delete' | null

export function RegistrationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { canEdit, canSubmit, canDelete } = useAuthStore()
  const { data, loading, error, refetch } = useRegistrationDetail(id || null)

  const [confirm, setConfirm] = useState<ConfirmType>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isDraft = data ? isRegistrationDraft(data) : false

  async function handleSubmit() {
    if (!id) return
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await submitRegistration(id)
      if (res.success) {
        setConfirm(null)
        refetch()
      } else {
        setActionError(res.message || 'Təsdiq alınmadı')
      }
    } catch (e) {
      setActionError(formatApiError(e))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await deleteRegistration(id)
      if (res.success) {
        navigate('/registrations', { replace: true })
      } else {
        setActionError(res.message || 'Silmə alınmadı')
      }
    } catch (e) {
      setActionError(formatApiError(e))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Yüklənir…</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto space-y-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Qeydiyyat tapılmadı'}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">
                {data.assigned_company_legal_name || 'Qeydiyyat detalları'}
              </h2>
              <StatusDisplay status={data.status} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              VÖEN: <span className="font-mono">{data.assigned_company_voen}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        {isDraft && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEdit() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/registrations/${id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Redaktə</span>
              </Button>
            )}
            {canSubmit() && (
              <Button
                variant="success"
                size="sm"
                onClick={() => setConfirm('submit')}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Təsdiq et</span>
              </Button>
            )}
            {canDelete() && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirm('delete')}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Sil</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Non-draft notice */}
      {!isDraft && (
        <Alert variant="info">
          <AlertDescription>
            Bu qeydiyyat təsdiq edilib — redaktə və silmə mümkün deyil.
          </AlertDescription>
        </Alert>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Company */}
        <DetailSection title="Şirkət" icon={<Building2 className="h-4 w-4" />}>
          <DetailRow label="Şirkətin VÖEN kodu" value={data.assigned_company_voen} />
          <DetailRow label="Şirkətin hüquqi adı" value={data.assigned_company_legal_name} />
        </DetailSection>

        {/* Number & License */}
        <DetailSection title="Nömrə və lisenziya" icon={<Phone className="h-4 w-4" />}>
          <DetailRow label="Nömrə resursu" value={data.registered_number} />
          <DetailRow label="Nömrə resursunun təyinatı" value={data.number_assignment} />
          <DetailRow label="Operator" value={data.operator} />
          <DetailRow label="Lisenziya nömrəsi" value={data.license_number} />
          <DetailRow label="Lisenziya tarixi" value={formatDate(data.license_date)} />
        </DetailSection>

        {/* Status & Usage */}
        <DetailSection title="Status və istifadə" icon={<BarChart3 className="h-4 w-4" />}>
          <DetailRow label="Status" value={data.current_status} />
          <DetailRow label="İstifadə səviyyəsi" value={data.usage_level} />
          <DetailRow label="Ayrılma tarixi" value={data.given_period} />
          <DetailRow label="İstifadə müddəti" value={data.usage_period} />
          <DetailRow label="Birdəfəlik ödəniş" value={data.one_time_payment_status} />
          <DetailRow label="İllik ödəniş" value={data.annual_payment_status} />
        </DetailSection>

        {/* Contract */}
        <DetailSection title="Müqavilə" icon={<FileCheck className="h-4 w-4" />}>
          <DetailRow label="Müqavilənin nömrəsi" value={data.contract_number} />
          <DetailRow label="Müqavilənin tarixi" value={formatDate(data.contract_date)} />
          <DetailRow
            label="Müqavilə faylı"
            value={<FileLink path={data.contract_file} label="Müqavilə" />}
          />
          <DetailRow
            label="Ərizə faylı"
            value={<FileLink path={data.application_file} label="Ərizə" />}
          />
          <DetailRow
            label="Bölüşdürmə planı"
            value={
              <FileLink
                path={data.number_resource_allocation_plan_file}
                label="Bölüşdürmə planı"
              />
            }
          />
        </DetailSection>

        {/* Metadata */}
        <div className="lg:col-span-2">
          <DetailSection title="Qeyd" icon={<ClipboardList className="h-4 w-4" />}>
            <DetailRow
              label="İş axını statusu"
              value={
                <StatusDisplay status={data.status} />
              }
            />
            <DetailRow label="Təsdiq tarixi" value={formatDateTime(data.submitted_at)} />
            <DetailRow
              label="Təsdiq edən"
              value={formatUserLabel(data.submitted_by_user || data.submittedByUser)}
            />
          </DetailSection>
        </div>
      </div>

      {/* Confirm submit */}
      <Dialog open={confirm === 'submit'} onOpenChange={(v) => !v && setConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Qeydiyyatı təsdiq et</DialogTitle>
            <DialogDescription>
              Bu qeydiyyatı təsdiq etmək istəyirsiniz? Qaralamadan çıxacaq.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={actionLoading}>
              Ləğv et
            </Button>
            <Button variant="success" onClick={handleSubmit} loading={actionLoading}>
              Təsdiq et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={confirm === 'delete'} onOpenChange={(v) => !v && setConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Qeydiyyatı sil</DialogTitle>
            <DialogDescription>
              Bu qeydiyyatı silmək istəyirsiniz? Bu əməliyyat geri qaytarılmır.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={actionLoading}>
              Ləğv et
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={actionLoading}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
