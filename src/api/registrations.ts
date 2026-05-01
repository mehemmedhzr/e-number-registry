import { apiClient } from './client'
import type { ApiResponse, NumberRegistration, RegistrationFormData } from './types'

// ─── IKTA Endpoints ───────────────────────────────────────────────────────────

export async function getAllRegistrationsIkta(): Promise<ApiResponse<NumberRegistration[]>> {
  const { data } = await apiClient.post<ApiResponse<NumberRegistration[]>>(
    '/icta/getAllNumberRegistrations',
    {},
  )
  return data
}

export async function getRegistrationIkta(encId: string): Promise<ApiResponse<NumberRegistration>> {
  const { data } = await apiClient.post<ApiResponse<NumberRegistration>>(
    '/icta/getNumberRegistration',
    { enc_id: encId },
  )
  return data
}

export async function createRegistration(
  formData: RegistrationFormData,
): Promise<ApiResponse<NumberRegistration>> {
  const fd = buildFormData(formData, null)
  const { data } = await apiClient.post<ApiResponse<NumberRegistration>>(
    '/icta/storeNumberRegistration',
    fd,
  )
  return data
}

export async function editRegistration(
  encId: string,
  formData: RegistrationFormData,
): Promise<ApiResponse<NumberRegistration>> {
  const fd = buildFormData(formData, encId)
  const { data } = await apiClient.post<ApiResponse<NumberRegistration>>(
    '/icta/editNumberRegistration',
    fd,
  )
  return data
}

export async function submitRegistration(encId: string): Promise<ApiResponse<NumberRegistration>> {
  const { data } = await apiClient.post<ApiResponse<NumberRegistration>>(
    '/icta/submitNumberRegistration',
    { enc_id: encId },
  )
  return data
}

export async function approveRegistration(encId: string): Promise<ApiResponse<NumberRegistration>> {
  const { data } = await apiClient.post<ApiResponse<NumberRegistration>>(
    '/icta/approveNumberRegistration',
    { enc_id: encId },
  )
  return data
}

export async function deleteRegistration(encId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    '/icta/deleteNumberRegistration',
    { enc_id: encId },
  )
  return data
}

// ─── RINN Endpoints ───────────────────────────────────────────────────────────

export async function getAllRegistrationsRinn(): Promise<ApiResponse<NumberRegistration[]>> {
  const { data } = await apiClient.post<ApiResponse<NumberRegistration[]>>(
    '/rinn/getAllNumberRegistrations',
    {},
  )
  return data
}

export async function getRegistrationRinn(encId: string): Promise<ApiResponse<NumberRegistration>> {
  const { data } = await apiClient.post<ApiResponse<NumberRegistration>>(
    '/rinn/getNumberRegistration',
    { enc_id: encId },
  )
  return data
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const TEXT_FIELDS: (keyof RegistrationFormData)[] = [
  'assigned_company_voen',
  'assigned_company_legal_name',
  'registered_number',
  'number_assignment',
  'operator',
  'license_number',
  'current_status',
  'usage_level',
  'given_period',
  'usage_period',
  'one_time_payment_status',
  'annual_payment_status',
  'contract_number',
]

const DATE_FIELDS: (keyof RegistrationFormData)[] = ['license_date', 'contract_date']

const FILE_FIELDS: (keyof RegistrationFormData)[] = [
  'contract_file',
  'application_file',
  'number_resource_allocation_plan_file',
]

function buildFormData(form: RegistrationFormData, encId: string | null): FormData {
  const fd = new FormData()

  for (const name of TEXT_FIELDS) {
    fd.append(name, String(form[name] ?? '').trim())
  }

  for (const name of DATE_FIELDS) {
    const v = String(form[name] ?? '').trim()
    if (v) fd.append(name, v)
  }

  for (const name of FILE_FIELDS) {
    const file = form[name]
    if (file instanceof File) {
      fd.append(name, file)
    }
  }

  if (encId) {
    fd.append('enc_id', encId)
  }

  return fd
}

// ─── Draft detection ──────────────────────────────────────────────────────────

export function isRegistrationDraft(row: { status?: { slug?: string; name?: string } }): boolean {
  const st = row?.status
  if (st && typeof st === 'object') {
    const slug = String(st.slug || '').toLowerCase().trim()
    if (slug === 'draft' || slug === 'qaralama') return true
    const name = String(st.name || '').toLowerCase().trim()
    if (name.includes('qaralama') || name.includes('draft')) return true
  }
  return false
}

export function isRegistrationSubmitted(row: { status?: { slug?: string; name?: string } }): boolean {
  const st = row?.status
  if (st && typeof st === 'object') {
    const slug = String(st.slug || '').toLowerCase().trim()
    if (slug === 'submitted' || slug === 'təsdiq') return true
    const name = String(st.name || '').toLowerCase().trim()
    if (name.includes('Submitted') || name.includes('Təsdiq')) return true
  }
  return false
}