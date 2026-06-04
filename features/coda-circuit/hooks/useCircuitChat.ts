'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage, ChatStatus, PipelineStage, CodaMode } from '../types/circuit.types'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'
import { getSampleCode, getSampleLearnText } from '../data/sampleCircuits'

const CHAT_KEY = 'qurekaChatHistory'

let _chatLoadHandled = false

function loadInitialMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    if (!_chatLoadHandled) {
      _chatLoadHandled = true
      const navType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type
      if (navType === 'reload') {
        sessionStorage.removeItem(CHAT_KEY)
        return []
      }
    }
    const raw = sessionStorage.getItem(CHAT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChatMessage[]
    return parsed.map((m) => ({ ...m, isStreaming: false }))
  } catch {
    return []
  }
}

// v1 기획 §3 Build 모드 4단계 생성 파이프라인
const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'generate', label: '1차 코드 생성', status: 'pending' },
  { id: 'lint',     label: '문법 검사',     status: 'pending' },
  { id: 'validate', label: '3가지 검증',    status: 'pending' },
  { id: 'finalize', label: '최종 코드 확정', status: 'pending' },
]

const STAGE_DELAYS = [600, 400, 500, 300]

const INITIAL_STAGES = PIPELINE_STAGES

interface UseCircuitChatReturn {
  messages: ChatMessage[]
  chatStatus: ChatStatus
  pipelineStages: PipelineStage[]
  isPipelineVisible: boolean
  send: (prompt: string, format: CodaOutputFormat, mode: CodaMode) => void
  clearHistory: () => void
}

export function useCircuitChat(): UseCircuitChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(loadInitialMessages)
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle')
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_STAGES)
  const [isPipelineVisible, setIsPipelineVisible] = useState(false)
  const abortedRef = useRef(false)

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  const send = useCallback(
    (prompt: string, format: CodaOutputFormat, mode: CodaMode) => {
      if (chatStatus === 'streaming') return

      abortedRef.current = false

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setChatStatus('streaming')

      setPipelineStages(PIPELINE_STAGES.map((s) => ({ ...s, status: 'pending' as const })))
      setIsPipelineVisible(mode === 'build')

      if (mode === 'build') {
        let cumulative = 0
        STAGE_DELAYS.forEach((delay, idx) => {
          cumulative += delay
          setTimeout(() => {
            if (abortedRef.current) return
            setPipelineStages((prev) =>
              prev.map((s, i) => (i === idx ? { ...s, status: 'done' as const } : s))
            )
          }, cumulative)
        })
      }

      const total =
        mode === 'build' ? STAGE_DELAYS.reduce((a, b) => a + b, 0) + 300 : 1000

      setTimeout(() => {
        if (abortedRef.current) return

        const content =
          mode === 'learn' ? getSampleLearnText() : getSampleCode(format)

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content,
          format: mode === 'build' ? format : undefined,
          mode,
          timestamp: new Date().toISOString(),
          isStreaming: false,
        }

        setMessages((prev) => [...prev, assistantMsg])
        setChatStatus('done')
        setIsPipelineVisible(false)
      }, total)
    },
    [chatStatus]
  )

  const clearHistory = useCallback(() => {
    abortedRef.current = true
    setMessages([])
    setChatStatus('idle')
    setPipelineStages(INITIAL_STAGES.map((s) => ({ ...s, status: 'pending' as const })))
    setIsPipelineVisible(false)
    try { sessionStorage.removeItem(CHAT_KEY) } catch {}
  }, [])

  return { messages, chatStatus, pipelineStages, isPipelineVisible, send, clearHistory }
}
