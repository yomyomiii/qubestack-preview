// Design Ref: §3.2 — localStorage 키: 'qurekaCodaConsent' / CodaConsentState
// Design Ref: §1.2 — MVP는 DB 없이 localStorage만 사용, 추후 서버 동의 관리로 전환 가능

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { CodaConsentState } from '../types/coda.types'

const CONSENT_KEY = 'qurekaCodaConsent'

function readConsent(): CodaConsentState {
  if (typeof window === 'undefined') return { given: false, givenAt: null }
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return { given: false, givenAt: null }
    return JSON.parse(raw) as CodaConsentState
  } catch {
    return { given: false, givenAt: null }
  }
}

function writeConsent(state: CodaConsentState): void {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
}

export function useCodaConsent() {
  const [consent, setConsent] = useState<CodaConsentState>({ given: false, givenAt: null })

  // SSR 안전: 마운트 후 localStorage 읽기
  useEffect(() => {
    setConsent(readConsent())
  }, [])

  const giveConsent = useCallback(() => {
    const next: CodaConsentState = { given: true, givenAt: new Date().toISOString() }
    writeConsent(next)
    setConsent(next)
  }, [])

  const revokeConsent = useCallback(() => {
    const next: CodaConsentState = { given: false, givenAt: null }
    writeConsent(next)
    setConsent(next)
  }, [])

  return {
    consentGiven: consent.given,
    consentGivenAt: consent.givenAt,
    giveConsent,
    revokeConsent,
  }
}
