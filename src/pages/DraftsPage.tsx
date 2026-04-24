import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, CheckCircle, Trash2, RefreshCw, ClipboardCheck } from 'lucide-react'
import { useRegistrationsList } from '@/hooks/useRegistrations'
import { useAuthStore } from '@/store/authStore'
import { submitRegistration, deleteRegistration } from '@/api/registrations'
import { formatApiError } from '@/api/client'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import type { NumberRegistration } from '@/api/types'

type ActionType = { type: 'submit' | 'delete'; encId: string } | null

export function DraftsPage() {
  const navigate = useNavigate()
  const { canEdit, canSubmit, canDelete } = useAuthStore()
  const { drafts, loading, error, refetch } = useRegistrationsList()

  const [action, setAction] = useState<ActionType>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (encId: string) => {
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await submitRegistration(encId)
      if (res.success) {
        setAction(null)
        refetch()
      } else {
        setActionError(res.message || 'Təsdiq alınmadı')
      }
    } catch (e) {
      setActionError(formatApiError(e))
    } finally {
      setActionLoading(false)
    }
  }, [refetch])

  const handleDelete = useCallback(async (encId: string) => {
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await deleteRegistration(encId)
      if (res.success) {
        setAction(null)
        refetch()
      } else {
        setActionError(res.message || 'Silmə alınmadı')
      }
    } catch (e) {
      setActionError(formatApiError(e))
    } finally {
      setActionLoading(false)
    }
  }, [refetch])

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Qaralamalar</h2>
          <p className="text-sm text-slate-500">Gözləyən qeydiyyatlar — təsdiq tələb edir</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenilə
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
            <ClipboardCheck className="h-10 w-10" />
            <p className="text-sm">Heç bir qaralama tapılmadı</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {drafts.map((reg: NumberRegistration) => (
              <div
                key={reg.enc_id}
                className="flex items-start sm:items-center justify-between gap-4 p-4 hover:bg-slate-50 transition-colors flex-col sm:flex-row"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">
                      {reg.assigned_company_legal_name || '—'}
                    </span>
                    <Badge variant="draft">Qaralama</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-mono">{reg.assigned_company_voen}</span>
                    {reg.registered_number && (
                      <span>Nömrə: {reg.registered_number}</span>
                    )}
                    {reg.operator && <span>Op: {reg.operator}</span>}
                    <span>{formatDate(reg.submitted_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Bax"
                    onClick={() => navigate(`/registrations/${reg.enc_id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEdit() && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Redaktə"
                      onClick={() => navigate(`/registrations/${reg.enc_id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canSubmit() && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Təsdiq et"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => setAction({ type: 'submit', encId: reg.enc_id })}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete() && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Sil"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setAction({ type: 'delete', encId: reg.enc_id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirm submit */}
      <Dialog open={action?.type === 'submit'} onOpenChange={(v) => !v && setAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Qeydiyyatı təsdiq et</DialogTitle>
            <DialogDescription>
              Bu qeydiyyatı təsdiq etmək istəyirsiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={actionLoading}>
              Ləğv et
            </Button>
            <Button
              variant="success"
              onClick={() => action && handleSubmit(action.encId)}
              loading={actionLoading}
            >
              Təsdiq et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={action?.type === 'delete'} onOpenChange={(v) => !v && setAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Qeydiyyatı sil</DialogTitle>
            <DialogDescription>
              Bu əməliyyat geri qaytarılmır. Davam etmək istəyirsiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={actionLoading}>
              Ləğv et
            </Button>
            <Button
              variant="destructive"
              onClick={() => action && handleDelete(action.encId)}
              loading={actionLoading}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
