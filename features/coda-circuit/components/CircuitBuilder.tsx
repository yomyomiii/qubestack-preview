'use client'

import { useState, useCallback } from 'react'
import { CircuitMessageList } from './CircuitMessageList'
import { CircuitInputBar } from './CircuitInputBar'
import { useCircuitChat } from '../hooks/useCircuitChat'
import type { CodaMode } from '../types/circuit.types'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'
import { Button } from '@/components/ui/Button'

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
          variant="secondary"
          type="button"
          onClick={clearHistory}
          disabled={messages.length === 0}
        >
          초기화
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
