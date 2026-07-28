'use client'

import { useEffect, useRef } from 'react'
import React from 'react'
import { CircuitCodeBlock } from './CircuitCodeBlock'
import type { ChatMessage, CodaMode, PipelineStage } from '../types/circuit.types'
import { Card } from '@/components/ui/Card'

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*\n]+?\*\*|`[^`\n]+?`|\*[^*\n]+?\*)/g)
  return tokens.map((token, i) => {
    const k = `${keyPrefix}-${i}`
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={k}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={k} className="rounded bg-[#EEEDFB] px-1 py-0.5 font-mono text-xs text-[#4F48C9]">
          {token.slice(1, -1)}
        </code>
      )
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={k}>{token.slice(1, -1)}</em>
    }
    return <React.Fragment key={k}>{token}</React.Fragment>
  })
}

function MarkdownText({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="flex flex-col gap-0.5">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return (
            <p key={i} className="mt-2 font-semibold text-sm text-gray-900">
              {parseInline(line.slice(4), `${i}`)}
            </p>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <p key={i} className="mt-3 font-bold text-sm text-gray-900">
              {parseInline(line.slice(3), `${i}`)}
            </p>
          )
        }
        if (line.match(/^[-*] /)) {
          return (
            <div key={i} className="flex gap-2 text-sm leading-relaxed text-gray-800">
              <span className="shrink-0 text-gray-400 select-none">•</span>
              <span>{parseInline(line.slice(2), `${i}`)}</span>
            </div>
          )
        }
        if (line.trim() === '') {
          return <div key={i} className="h-1.5" />
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-gray-800">
            {parseInline(line, `${i}`)}
          </p>
        )
      })}
    </div>
  )
}

interface CircuitMessageListProps {
  messages: ChatMessage[]
  mode: CodaMode
  context?: 'chat' | 'panel'
  pipelineStages?: PipelineStage[]
  isPipelineVisible?: boolean
}

export function CircuitMessageList({ messages, mode, context = 'chat', pipelineStages, isPipelineVisible }: CircuitMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.content])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="mb-3 text-3xl">{mode === 'learn' ? '📖' : '🔨'}</div>
        <p className="text-xs font-medium text-gray-700">
          {mode === 'learn'
            ? '양자 컴퓨팅 개념을 물어보세요'
            : '자연어로 원하는 양자 회로를 설명해보세요'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto px-4 py-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'user' ? (
            <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-[#635ADC] px-4 py-2.5">
              <p className="text-sm text-white">{msg.content}</p>
            </div>
          ) : msg.mode === 'learn' ? (
            <div className={context === 'panel' ? 'w-[90%]' : 'w-[60%]'}>
              <div className="rounded-xl border border-[#D8D5F7] bg-[#EEEDFB] px-4 py-3">
                <p className="mb-1.5 text-xs font-medium text-[#635ADC]">Quda</p>
                <MarkdownText content={msg.content} />
              </div>
            </div>
          ) : (
            <div className={context === 'panel' ? 'w-[90%]' : 'w-[60%]'}>
              <p className="mb-1.5 text-xs font-medium text-gray-500">Quda</p>
              {msg.hasError ? (
                <Card variant="error">
                  <p className="text-sm text-[#635ADC]">
                    {msg.errorMessage ?? '회로 생성 중 오류가 발생했습니다.'}
                  </p>
                </Card>
              ) : (
                <CircuitCodeBlock
                  code={msg.content}
                  format={msg.format ?? 'cuda-q'}
                  isStreaming={msg.isStreaming}
                  context={context}
                />
              )}
            </div>
          )}
        </div>
      ))}
      {/* 파이프라인 진행 버블 — 생성 중일 때만 표시 */}
      {isPipelineVisible && pipelineStages && (
        <div className="flex justify-start">
          <div className={context === 'panel' ? 'max-w-[90%]' : 'max-w-6xl'}>
            <p className="mb-1.5 text-xs font-medium text-gray-500">Quda</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex flex-col gap-2">
                {pipelineStages.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-2">
                    <span className="w-4 shrink-0 text-center text-xs">
                      {stage.status === 'done' ? '✓' : '○'}
                    </span>
                    <span
                      className={`text-xs ${
                        stage.status === 'done' ? 'text-[#635ADC]' : 'text-gray-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className={`rounded-full bg-[#EEEDFB] px-1.5 py-0.5 text-[10px] font-medium text-[#635ADC] ${stage.status !== 'done' ? 'invisible' : ''}`}>완료</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
