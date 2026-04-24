import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle } from 'lucide-react'
import { importFromExcel, type ExcelImportResponse } from '@/api/excel'
import { formatApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ExcelUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ExcelUploadModal({ open, onClose, onSuccess }: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExcelImportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]
    if (!allowed.includes(f.type) && !f.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Yalnız Excel (.xlsx, .xls) və ya CSV faylları qəbul edilir')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await importFromExcel(file)
      setResult(res)
      if (res.success) {
        setTimeout(() => {
          onSuccess()
          handleReset()
          onClose()
        }, 1500)
      }
    } catch (e) {
      setError(formatApiError(e))
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setFile(null)
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClose() {
    if (!loading) {
      handleReset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Excel-dən idxal
          </DialogTitle>
          <DialogDescription>
            Excel faylını yükləyin. Sistem məlumatları yoxlayıb idxal edəcək.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
              dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
              file && 'border-emerald-300 bg-emerald-50',
            )}
            onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const f = e.dataTransfer.files?.[0]
              if (f) handleFile(f)
            }}
            onClick={() => inputRef.current?.click()}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            {file ? (
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-emerald-500 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-emerald-800 text-sm truncate max-w-[250px]">
                    {file.name}
                  </div>
                  <div className="text-xs text-emerald-600 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-auto rounded p-0.5 text-emerald-400 hover:text-red-500"
                  onClick={(e) => { e.stopPropagation(); handleReset() }}
                  aria-label="Faylı sil"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Upload className="h-10 w-10" />
                <div>
                  <p className="text-sm text-slate-600">
                    Faylı buraya atın və ya{' '}
                    <span className="text-blue-600 font-medium">seçin</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Excel (.xlsx, .xls) və ya CSV</p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {/* Result */}
          {result && (
            <Alert variant={result.success ? 'success' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <p>{result.message}</p>
                {result.payload?.imported != null && (
                  <p className="mt-1 text-sm font-medium">
                    {result.payload.imported} qeydiyyat idxal edildi
                  </p>
                )}
                {result.payload?.errors && result.payload.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">Səhvlər:</p>
                    <ul className="text-xs space-y-0.5">
                      {result.payload.errors.slice(0, 10).map((e, i) => (
                        <li key={i} className="font-mono">
                          Sətir {e.row}: [{e.field}] {e.message}
                        </li>
                      ))}
                      {result.payload.errors.length > 10 && (
                        <li>…və {result.payload.errors.length - 10} daha</li>
                      )}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Ləğv et
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading} loading={loading}>
            {!loading && <Upload className="h-4 w-4" />}
            {loading ? 'Yüklənir…' : 'İdxal et'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
