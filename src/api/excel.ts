import { apiClient, getToken, getApiBaseUrl } from './client'
import type { NumberRegistration } from './types'

// ─── Excel Export ─────────────────────────────────────────────────────────────
// The sample project doesn't define a specific export endpoint, so we implement
// a client-side CSV export using existing list data as a fallback.
// If the backend exposes a download endpoint, wire it here.

export function exportToCsv(registrations: NumberRegistration[], filename = 'reyestr.csv') {
  const headers = [
    'VÖEN',
    'Hüquqi ad',
    'Nömrə resursu',
    'Nömrə resursunun təyinatı',
    'Operator',
    'Lisenziya nömrəsi',
    'Lisenziya tarixi',
    'Status',
    'İstifadə səviyyəsi',
    'Ayrılma tarixi',
    'İstifadə müddəti',
    'Birdəfəlik ödəniş',
    'İllik ödəniş',
    'Müqavilə nömrəsi',
    'Müqavilə tarixi',
    'Təsdiq tarixi',
  ]

  const escape = (v: string | null | undefined) => {
    const s = v == null ? '' : String(v)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const rows = registrations.map((r) => [
    r.assigned_company_voen,
    r.assigned_company_legal_name,
    r.registered_number,
    r.number_assignment,
    r.operator,
    r.license_number,
    r.license_date,
    r.status?.name || r.status?.slug || '',
    r.usage_level,
    r.given_period,
    r.usage_period,
    r.one_time_payment_status,
    r.annual_payment_status,
    r.contract_number,
    r.contract_date,
    r.submitted_at,
  ].map(escape).join(','))

  const bom = '\uFEFF'
  const csv = bom + [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Excel Import ─────────────────────────────────────────────────────────────
// If the backend provides an import endpoint, use it here.
// The sample project doesn't define one, so this is a placeholder that can be
// wired when the backend endpoint is available.

export interface ExcelImportResponse {
  success: boolean
  message: string
  payload: {
    imported?: number
    errors?: Array<{ row: number; field: string; message: string }>
  }
}

export async function importFromExcel(file: File): Promise<ExcelImportResponse> {
  const excel_file = new FormData()
  excel_file.append('excel_file', file)
  const { data } = await apiClient.post<ExcelImportResponse>(
    '/icta/importNumberRegistrationsFromExcel',
    excel_file,
  )
  return data
}

// ─── Server-side export (if available) ───────────────────────────────────────

export async function downloadExcelFromServer(): Promise<void> {
  const token = getToken()
  const base = getApiBaseUrl()
  const url = `${base}/icta/exportNumberRegistrations`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  if (!res.ok) throw new Error(`Export uğursuz oldu (${res.status})`)

  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = 'reyestr.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(objectUrl)
}
