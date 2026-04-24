import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = dayjs(value)
  if (!d.isValid()) return String(value)
  return d.format('DD.MM.YYYY')
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = dayjs(value)
  if (!d.isValid()) return String(value)
  return d.format('DD.MM.YYYY HH:mm')
}

export function formatUserLabel(user: { name?: string; surname?: string; email?: string } | null | undefined): string {
  if (!user) return '—'
  const name = [user.name, user.surname].filter(Boolean).join(' ').trim()
  const email = user.email || ''
  if (name && email) return `${name} (${email})`
  if (name) return name
  if (email) return email
  return '—'
}

export function getFileNameFromPath(path: string | null | undefined): string {
  if (!path) return ''
  return path.split('/').pop() || path
}
