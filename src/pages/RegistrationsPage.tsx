import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table'
import {
  PlusCircle,
  RefreshCw,
  Search,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  ListOrdered,
} from 'lucide-react'
import { useRegistrationsList } from '@/hooks/useRegistrations'
import { useAuthStore } from '@/store/authStore'
import { isRegistrationDraft } from '@/api/registrations'
import { submitRegistration, deleteRegistration } from '@/api/registrations'
import { formatApiError } from '@/api/client'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import type { NumberRegistration } from '@/api/types'
import { exportToCsv } from '@/api/excel'
import { ExcelUploadModal } from '@/components/ExcelUploadModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

function StatusBadge({ status }: { status: NumberRegistration['status'] }) {
  if (!status) return <span className="text-slate-400">—</span>
  const slug = status.slug?.toLowerCase() || ''
  const name = status.name || status.label || status.slug || '—'
  if (slug === 'draft' || slug === 'qaralama') {
    return <Badge variant="draft">Qaralama</Badge>
  }
  return <Badge variant="success">{name}</Badge>
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  variant?: 'destructive' | 'success'
}

function ConfirmDialog({
  open,
  title,
  description,
  loading,
  onConfirm,
  onCancel,
  confirmLabel = 'Bəli',
  variant = 'destructive',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Ləğv et
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'success'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ActionType = { type: 'submit' | 'delete'; encId: string } | null

export function RegistrationsPage() {
  const navigate = useNavigate()
  const { role, canCreate, canEdit, canDelete, canSubmit } = useAuthStore()
  const { data, loading, error, refetch } = useRegistrationsList()

  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [action, setAction] = useState<ActionType>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [excelUploadOpen, setExcelUploadOpen] = useState(false)

  const handleSubmit = useCallback(
    async (encId: string) => {
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
    },
    [refetch],
  )

  const handleDelete = useCallback(
    async (encId: string) => {
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
    },
    [refetch],
  )

  const columns = useMemo<ColumnDef<NumberRegistration>[]>(
    () => [
      {
        accessorKey: 'assigned_company_voen',
        header: 'VÖEN',
        size: 120,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{String(getValue() ?? '—')}</span>
        ),
      },
      {
        accessorKey: 'assigned_company_legal_name',
        header: 'Hüquqi ad',
        cell: ({ getValue }) => (
          <span className="max-w-[200px] truncate block" title={String(getValue() ?? '')}>
            {String(getValue() ?? '—')}
          </span>
        ),
      },
      {
        accessorKey: 'registered_number',
        header: 'Nömrə resursu',
        size: 130,
      },
      {
        accessorKey: 'operator',
        header: 'Operator',
        size: 130,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        sortingFn: (a, b) => {
          const as = a.original.status?.slug || ''
          const bs = b.original.status?.slug || ''
          return as.localeCompare(bs)
        },
      },
      {
        accessorKey: 'submitted_at',
        header: 'Tarix',
        size: 110,
        cell: ({ getValue }) => (
          <span className="text-slate-500 text-xs">{formatDate(getValue() as string)}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Əməliyyatlar',
        size: 200,
        enableSorting: false,
        cell: ({ row }) => {
          const reg = row.original
          const isDraft = isRegistrationDraft(reg)
          const enc = reg.enc_id
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                title="Bax"
                onClick={() => navigate(`/registrations/${enc}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {isDraft && canEdit() && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Redaktə"
                  onClick={() => navigate(`/registrations/${enc}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {isDraft && canSubmit() && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Təsdiq et"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setAction({ type: 'submit', encId: enc })}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              {isDraft && canDelete() && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Sil"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setAction({ type: 'delete', encId: enc })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [navigate, canEdit, canSubmit, canDelete],
  )

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ümumi reyestr</h2>
          <p className="text-sm text-slate-500">
            {role === 'icta' ? 'IKTA' : 'RINN'} — Nömrə qeydiyyatları
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenilə</span>
          </Button>
          {canCreate() && (
            <Button variant="outline" size="sm" onClick={() => setExcelUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">İdxal</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            title="CSV-ə ixrac et"
            onClick={() => exportToCsv(table.getFilteredRowModel().rows.map((r) => r.original))}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">İxrac</span>
          </Button>
          {canCreate() && (
            <Button size="sm" onClick={() => navigate('/registrations/create')}>
              <PlusCircle className="h-4 w-4" />
              <span>Yeni qeydiyyat</span>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        {/* Search toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Axtarış…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-slate-500">
            {table.getFilteredRowModel().rows.length} nəticə
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50">
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted()
                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            className={`inline-flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer hover:text-slate-800' : 'cursor-default'}`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="text-slate-300">
                                {sorted === 'asc' ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
                                ) : sorted === 'desc' ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                                ) : (
                                  <ChevronsUpDown className="h-3.5 w-3.5" />
                                )}
                              </span>
                            )}
                          </button>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="text-sm">Yüklənir…</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ListOrdered className="h-8 w-8" />
                      <span className="text-sm">Heç bir qeydiyyat tapılmadı</span>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-slate-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              Səhifə {table.getState().pagination.pageIndex + 1} /{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirm Dialogs */}
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <ConfirmDialog
        open={action?.type === 'submit'}
        title="Qeydiyyatı təsdiq et"
        description="Bu qeydiyyatı təsdiq etmək istəyirsiniz? Qaralamadan çıxacaq."
        confirmLabel="Təsdiq et"
        variant="success"
        loading={actionLoading}
        onConfirm={() => action && handleSubmit(action.encId)}
        onCancel={() => { setAction(null); setActionError(null) }}
      />
      <ConfirmDialog
        open={action?.type === 'delete'}
        title="Qeydiyyatı sil"
        description="Bu qeydiyyatı silmək istəyirsiniz? Bu əməliyyat geri qaytarılmır."
        confirmLabel="Sil"
        variant="destructive"
        loading={actionLoading}
        onConfirm={() => action && handleDelete(action.encId)}
        onCancel={() => { setAction(null); setActionError(null) }}
      />

      <ExcelUploadModal
        open={excelUploadOpen}
        onClose={() => setExcelUploadOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}

