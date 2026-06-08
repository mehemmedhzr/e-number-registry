import { useState, useEffect, useCallback } from 'react'
import { useDigitalLoginStore } from '@/store/authStore'
import {
  getAllRegistrationsIkta,
  getAllRegistrationsRinn,
  getRegistrationIkta,
  getRegistrationRinn,
  isRegistrationDraft,
} from '@/api/registrations'
import { formatApiError } from '@/api/client'
import type { NumberRegistration } from '@/api/types'

export function useRegistrationsList() {
  const { companyType } = useDigitalLoginStore()
  const [data, setData] = useState<NumberRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = companyType === 'rinn'
        ? await getAllRegistrationsRinn()
        : await getAllRegistrationsIkta()
      if (!res.success) {
        setError(res.message || 'Məlumatlar yüklənmədi')
        setData([])
      } else {
        setData(Array.isArray(res.payload) ? res.payload : [])
      }
    } catch (e) {
      setError(formatApiError(e))
      setData([])
    } finally {
      setLoading(false)
    }
  }, [companyType])

  useEffect(() => {
    load()
  }, [load])

  const drafts = data.filter((r) => isRegistrationDraft(r))

  return { data, drafts, loading, error, refetch: load }
}

export function useRegistrationDetail(encId: string | null) {
  const { companyType } = useDigitalLoginStore()
  const [data, setData] = useState<NumberRegistration | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!encId) return
    setLoading(true)
    setError(null)
    try {
      const res = companyType === 'rinn'
        ? await getRegistrationRinn(encId)
        : await getRegistrationIkta(encId)
      if (!res.success || !res.payload) {
        setError(res.message || 'Qeydiyyat yüklənmədi')
      } else {
        setData(res.payload)
      }
    } catch (e) {
      setError(formatApiError(e))
    } finally {
      setLoading(false)
    }
  }, [encId, companyType])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refetch: load }
}
