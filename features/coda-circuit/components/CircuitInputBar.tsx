'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'
import type { CodaMode } from '../types/circuit.types'
import { Button } from '@/components/ui/Button'
import { ModeToggle } from './ModeToggle'

interface CircuitInputBarProps {
  disabled: boolean
  isStreaming: boolean
  mode: CodaMode
  onModeChange: (mode: CodaMode) => void
  onSend: (prompt: string, format: CodaOutputFormat) => void
}

const FORMAT_OPTIONS: { value: CodaOutputFormat; label: string }[] = [
  { value: 'cuda-q', label: 'CUDA-Q' },
  { value: 'qiskit', label: 'Qiskit' },
  { value: 'pennylane', label: 'PennyLane' },
  { value: 'pyquil', label: 'PyQuil' },
]

const BUILD_PLACEHOLDER = '예) 3큐비트 벨 상태를 CUDA-Q로 만들어줘'
const LEARN_PLACEHOLDER = '예) 양자 얽힘의 원리를 설명해줘'

export function CircuitInputBar({ disabled, isStreaming, mode, onModeChange, onSend }: CircuitInputBarProps) {
  const [prompt, setPrompt] = useState('')
  const [format, setFormat] = useState<CodaOutputFormat>('cuda-q')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 1.5줄 기본 (text-sm 20px × 1.5 + 패딩 20px ≈ 50px), 최대 120px
  const MIN_H = 50
  const MAX_H = 120

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(MIN_H, Math.min(el.scrollHeight, MAX_H))}px`
  }, [prompt])

  function submit() {
    const trimmed = prompt.trim()
    if (!trimmed || disabled || isStreaming) return
    onSend(trimmed, format)
    setPrompt('')
    if (textareaRef.current) textareaRef.current.style.height = `${MIN_H}px`
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const canSend = prompt.trim().length > 0 && !disabled && !isStreaming

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-t border-gray-200 bg-white px-3 pb-3 pt-3">
      {/* 모드 토글 — 입력 박스 바로 위 왼쪽 */}
      <div className="mb-2">
        <ModeToggle mode={mode} onChange={onModeChange} disabled={disabled || isStreaming} />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-gray-300 focus-within:bg-white transition-colors">
        {/* 입력 영역 */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'learn' ? LEARN_PLACEHOLDER : BUILD_PLACEHOLDER}
          disabled={disabled || isStreaming}
          maxLength={2000}
          className="w-full resize-none bg-transparent px-3 pt-3 pb-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
        />

        {/* 하단 버튼 바 */}
        <div className="flex items-center justify-between px-3 pb-2">
          {/* 왼쪽: 포맷 드롭다운 (build 모드만) */}
          {mode === 'build' ? (
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as CodaOutputFormat)}
              disabled={disabled || isStreaming}
              className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 outline-none hover:border-gray-300 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <div />
          )}

          {/* 오른쪽: 전송/중지 버튼 */}
          <Button
            variant="primary"
            type="submit"
            disabled={!canSend}
            aria-label={isStreaming ? '중지' : '전송'}
            className="shrink-0"
          >
            {isStreaming ? '중지' : '전송'}
          </Button>
        </div>
      </div>
    </form>
  )
}
