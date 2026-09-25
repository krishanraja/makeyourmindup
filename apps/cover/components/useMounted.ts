'use client'

import { useEffect, useState } from 'react'

/** False on the server and during hydration, true straight after. */
export function useMounted() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}
