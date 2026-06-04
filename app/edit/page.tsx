'use client'

import { useEffect, useState } from 'react'
import { CircuitEditor } from '@/features/coda-edit/components/CircuitEditor'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'

const STORAGE_KEY = 'qurekaCodaEditSession'
const CHAT_KEY = 'qurekaChatHistory'

interface EditSession {
  code: string
  format: CodaOutputFormat
}

let _editLoadHandled = false

export default function EditPage() {
  const [session, setSession] = useState<EditSession | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (!_editLoadHandled) {
      _editLoadHandled = true
      const navType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type
      if (navType === 'reload') {
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(CHAT_KEY)
        return
      }
    }

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) setSession(JSON.parse(raw) as EditSession)
    } catch {}
  }, [])

  if (!mounted) return null

  if (!session) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <div className="flex shrink-0 items-center border-b border-gray-200 bg-white px-4 py-3">
          <span className="text-sm font-semibold text-gray-800">Editor</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center bg-white px-5 text-center">
          <div className="mb-3 text-3xl">✏️</div>
          <p className="text-xs font-medium text-gray-700">
            Learner/Builder에서 코드를 생성하고 에디터에 저장해보세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CircuitEditor initialCode={session.code} initialFormat={session.format} />
      </div>
    </div>
  )
}
