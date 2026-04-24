import { useState, useCallback, useEffect } from 'react'

const FONT_SIZES = [14, 16, 18, 20]
const DEFAULT_INDEX = 1 // 16px
const STORAGE_KEY = 'e_number_font_size_index'

export function useFontSize() {
  const [index, setIndex] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      const n = parseInt(stored, 10)
      if (n >= 0 && n < FONT_SIZES.length) return n
    }
    return DEFAULT_INDEX
  })

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--font-size-base',
      `${FONT_SIZES[index]}px`,
    )
    localStorage.setItem(STORAGE_KEY, String(index))
  }, [index])

  const increase = useCallback(() => {
    setIndex((i) => Math.min(i + 1, FONT_SIZES.length - 1))
  }, [])

  const decrease = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setIndex(DEFAULT_INDEX)
  }, [])

  return { fontSize: FONT_SIZES[index], increase, decrease, reset }
}
