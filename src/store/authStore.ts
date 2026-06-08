import { create } from 'zustand'
import { saveAuth } from '@/api/client'
import type { UserRole } from '@/api/types'
import axios from 'axios'

interface UserData {
  name: string
  surname: string
  father_name: string
  voen: string
  pin: string
  is_legal: boolean
  has_stamp: boolean
  gender: string
  birth_date: string
  position: string | null
  phone: string | null
  email: string | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
  company: CompanyData
}

interface CompanyData {
  id: number
  name: string
  voen: string
  action_scope: string | null
  legal_address: string
  actual_address: string | null
  stasionar_phone: string | null
  contact_number: string | null
  email_address: string | null
  type: string
  created_at: string
  updated_at: string
}

interface DigitalLoginState {
  authToken: string,
  companyType: string,
  userData: UserData | null,

  initialize: () => void,
  setAuth: (a: string, b: UserRole) => void
  getAuthToken: () => string | null,
  getUserData: () => UserData | null,
  getCompanyType: () => string | null,
  logout: () => void,

  // Permission helpers
  canCreate: () => boolean
  canEdit: () => boolean
  canDelete: () => boolean
  canSubmit: () => boolean
  canApprove: () => boolean
  canExport: () => boolean

}

export const useDigitalLoginStore = create<DigitalLoginState>((set, get) => ({
  authToken: '',
  companyType: '',
  userData: null,

  initialize() {
    console.log(0)
    const authToken = localStorage.getItem('e_number_auth_token')

    const companyType = localStorage.getItem('e_number_company_type')

    if (companyType) set({ companyType })


    if (authToken && !get().userData) {
      set({ authToken })

      axios.post(`${import.meta.env.VITE_API_URL}/getUser`, {}, {
        headers: {
          "Authorization-key": "1234567890",
          "Authorization": `Bearer ${authToken}`
        }
      }).then(res => {
        console.log(res.data)
        set({ userData: res.data.payload.user })
      }).catch(err => {
        console.log(err)
      })
    }
  },

  setAuth(authToken, companyType) {
    saveAuth(authToken, companyType);
    set({ authToken, companyType });
  },

  logout() {
    localStorage.removeItem('e_number_auth_token')
    localStorage.removeItem('e_number_company_type')
    set({ authToken: '', companyType: '', userData: null })
  },

  getAuthToken: () => get().authToken,
  getUserData: () => get().userData,
  getCompanyType: () => get().companyType,

  canCreate: () => get().companyType === 'icta',
  canEdit: () => get().companyType === 'icta',
  canDelete: () => get().companyType === 'icta',
  canSubmit: () => get().companyType === 'icta',
  canApprove: () => get().companyType === 'icta',
  canExport: () => true,
}))