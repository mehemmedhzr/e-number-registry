import { create } from 'zustand'
import { clearAuth, getStoredRole, getToken, saveAuth } from '@/api/client'
import type { UserRole } from '@/api/types'

interface AuthState {
  token: string
  role: UserRole | null
  isAuthenticated: boolean

  initialize: () => void
  setAuth: (token: string, role: UserRole) => void
  logout: () => void

  // Permission helpers
  canCreate: () => boolean
  canEdit: () => boolean
  canDelete: () => boolean
  canSubmit: () => boolean
  canExport: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: '',
  role: null,
  isAuthenticated: false,

  initialize() {
    const token = getToken()
    const role = getStoredRole() as UserRole | null
    if (token && role) {
      set({ token, role, isAuthenticated: true })
    } else {
      set({ token: '', role: null, isAuthenticated: false })
    }
  },

  setAuth(token, role) {
    saveAuth(token, role)
    set({ token, role, isAuthenticated: true })
  },

  logout() {
    clearAuth()
    set({ token: '', role: null, isAuthenticated: false })
  },

  // IKTA can do everything; RINN is read-only
  canCreate: () => get().role === 'icta',
  canEdit: () => get().role === 'icta',
  canDelete: () => get().role === 'icta',
  canSubmit: () => get().role === 'icta',
  canExport: () => true, // both roles can view/export
}))
