// ─── Standard API Response Envelope ───────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  payload: T
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'icta' | 'rinn'

export interface LoginRequest {
  role: UserRole
}

export interface LoginPayload {
  authToken: string
  role: UserRole
}

// ─── Registration Status ──────────────────────────────────────────────────────
export interface RegistrationStatus {
  slug: string
  name: string
  label?: string
}

// ─── Submitted By User ────────────────────────────────────────────────────────
export interface SubmittedByUser {
  name?: string
  surname?: string
  email?: string
}

// ─── Number Registration ─────────────────────────────────────────────────────
export interface NumberRegistration {
  enc_id: string

  // Company
  assigned_company_voen: string
  assigned_company_legal_name: string

  // Number & License
  registered_number: string
  number_assignment: string
  operator: string
  license_number: string
  license_date: string | null   // "YYYY-MM-DD"
  
  // Status & Usage
  current_status: string
  usage_level: string
  given_period: string
  usage_period: string
  one_time_payment_status: string
  annual_payment_status: string

  // Contract
  contract_number: string
  contract_date: string | null  // "YYYY-MM-DD"
  contract_file: string | null
  application_file: string | null
  number_resource_allocation_plan_file: string | null

  // Metadata
  status: RegistrationStatus
  submitted_at: string | null
  submitted_by_user: SubmittedByUser | null
  submittedByUser?: SubmittedByUser | null
}

// ─── Form Data ────────────────────────────────────────────────────────────────
export interface RegistrationFormData {
  assigned_company_voen: string
  assigned_company_legal_name: string
  registered_number: string
  number_assignment: string
  operator: string
  license_number: string
  license_date: string
  current_status: string
  usage_level: string
  given_period: string
  usage_period: string
  one_time_payment_status: string
  annual_payment_status: string
  contract_number: string
  contract_date: string
  contract_file?: File | null
  application_file?: File | null
  number_resource_allocation_plan_file?: File | null
}

// ─── Request Bodies ───────────────────────────────────────────────────────────
export interface GetRegistrationRequest {
  enc_id: string
}

export interface SubmitRegistrationRequest {
  enc_id: string
}

export interface DeleteRegistrationRequest {
  enc_id: string
}
