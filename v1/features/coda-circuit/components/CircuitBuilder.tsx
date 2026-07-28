'use client'

import { useState, useCallback } from 'react'
import { CircuitMessageList } from './CircuitMessageList'
import { CircuitInputBar } from './CircuitInputBar'
import { useCircuitChat } from '../hooks/useCircuitChat'
import type { CodaMode } from '../types/circuit.types'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'
import { Button } from '@/components/ui/Button'

function IconReset() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

interface CircuitBuilderProps {
  variant?: 'default' | 'panel'
}

export function CircuitBuilder({ variant = 'default' }: CircuitBuilderProps) {
  const context = variant === 'panel' ? 'panel' : 'chat'
  const [mode, setMode] = useState<CodaMode>('build')
  const { messages, chatStatus, pipelineStages, isPipelineVisible, send, clearHistory } =
    useCircuitChat()

  const handleSend = useCallback(
    (prompt: string, format: CodaOutputFormat) => {
      send(prompt, format, mode)
    },
    [send, mode]
  )

  const handleModeChange = useCallback(
    (newMode: CodaMode) => {
      if (chatStatus === 'streaming') return
      setMode(newMode)
    },
    [chatStatus]
  )

  const isStreaming = chatStatus === 'streaming'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 헤더 */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <span className="text-sm font-semibold text-gray-800">Learner/Builder</span>
        <Button
          variant="icon"
          type="button"
          onClick={clearHistory}
          disabled={messages.length === 0}
          title="초기화"
        >
          <IconReset />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CircuitMessageList
          messages={messages}
          mode={mode}
          context={context}
          pipelineStages={pipelineStages}
          isPipelineVisible={isPipelineVisible}
        />
      </div>

      <CircuitInputBar
        disabled={isStreaming}
        isStreaming={isStreaming}
        mode={mode}
        onModeChange={handleModeChange}
        onSend={handleSend}
      />
    </div>
  )
}
