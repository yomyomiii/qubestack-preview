'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'
import { getSampleCode } from '../data/sampleCircuits'
import { analyzeCircuit } from '../data/circuitAnalyzer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

function IconCopy() {
  return (
    <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="8" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3 10H2.5A1.5 1.5 0 0 1 1 8.5v-7A1.5 1.5 0 0 1 2.5 0h7A1.5 1.5 0 0 1 11 1.5V2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2.5 7.5L6 11L12.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 2v8M4.5 7.5L7.5 10.5L10.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IconSave() {
  return (
    <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="4" y="1.5" width="7" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="3" y="8" width="9" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

function IconInsert() {
  return (
    <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 1.5v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 6.5L7.5 9L10 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="1.5" y="10" width="12" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

const EDIT_STORAGE_KEY = 'qurekaCodaEditSession'

interface CircuitCodeBlockProps {
  code: string
  format: CodaOutputFormat
  isStreaming?: boolean
  context?: 'chat' | 'panel'
}

const FORMAT_LABELS: Record<CodaOutputFormat, string> = {
  'cuda-q': 'CUDA-Q',
  'qiskit': 'Qiskit',
  'pennylane': 'PennyLane',
  'pyquil': 'PyQuil',
}

const FORMAT_OPTIONS = Object.entries(FORMAT_LABELS) as [CodaOutputFormat, string][]

const BAR_MAX = 12

function ResultBar({ count, maxCount, isNoise }: {
  count: number
  maxCount: number
  isNoise?: boolean
}) {
  const filled = Math.max(1, Math.round((count / maxCount) * BAR_MAX))
  return (
    <span className={`min-w-0 overflow-hidden ${isNoise ? 'text-[#9990EB]' : 'text-[#635ADC]'}`}>
      {'█'.repeat(filled)}
    </span>
  )
}

function ResultsPanel({ result, title, className, contentClassName }: {
  result: { shots: number; counts: { state: string; count: number; isNoise?: boolean }[] }
  title: string
  className?: string
  contentClassName?: string
}) {
  const maxCount = Math.max(...result.counts.map((r) => r.count))

  return (
    <Card variant="result-ideal" className={className ?? 'w-full'}>
      <p className="mb-2 text-xs font-semibold text-[#635ADC]">{title}</p>
      <div className={`flex flex-col gap-1 font-mono text-xs ${contentClassName ?? 'w-full'}`}>
        {result.counts.map((r) => (
          <div key={r.state} className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-gray-600">{r.state}</span>
            <span className="shrink-0 overflow-hidden">
              <ResultBar count={r.count} maxCount={maxCount} isNoise={r.isNoise} />
            </span>
            <span className="shrink-0 tabular-nums text-gray-700">{r.count}</span>
            <span className="shrink-0 tabular-nums text-gray-400">
              {((r.count / result.shots) * 100).toFixed(1)}%
            </span>
            {r.isNoise && <span className="shrink-0 text-xs text-[#9990EB]">노이즈</span>}
            <span className="flex-1" />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-gray-400">{result.shots} shots</p>
    </Card>
  )
}

export function CircuitCodeBlock({ code, format, isStreaming, context = 'chat' }: CircuitCodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [currentFormat, setCurrentFormat] = useState<CodaOutputFormat>(format)
  const [displayCode, setDisplayCode] = useState(code)
  const [isTranspiling, setIsTranspiling] = useState(false)
  const [insertMsg, setInsertMsg] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    setDisplayCode(code)
    setCurrentFormat(format)
  }, [code, format])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  function handleFormatChange(newFormat: CodaOutputFormat) {
    if (newFormat === currentFormat || isTranspiling) return
    setIsTranspiling(true)
    setTimeout(() => {
      setCurrentFormat(newFormat)
      setDisplayCode(getSampleCode(newFormat))
      setIsTranspiling(false)
    }, 800)
  }

  async function handleDownload() {
    try {
      const res = await fetch('/api/coda/export-notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: displayCode, format: currentFormat, filename: 'circuit' }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'circuit.ipynb'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }

  function handleSaveToEditor() {
    sessionStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify({ code: displayCode, format: currentFormat }))
    setSaveMsg('에디터에 저장되었습니다. GNB의 Editor 메뉴에서 확인하세요.')
    setTimeout(() => setSaveMsg(null), 3000)
  }

  function handleInsertToCell() {
    window.postMessage({ type: 'QUREKA_INSERT_CIRCUIT', code: displayCode, format: currentFormat }, '*')
    setInsertMsg('Jupyter Notebook 셀에 삽입됨')
    setTimeout(() => setInsertMsg(null), 2500)
  }

  const isDone = !isStreaming && code.length > 0
  const analysis = useMemo(() => analyzeCircuit(displayCode), [displayCode])

  return (
    <Card variant="code" className="w-full">
      {/* 헤더 */}
      {isDone && (
        <div className={`bg-white px-3 pt-2 pb-2 transition-all ${isScrolled ? 'border-b border-gray-200' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">생성된 회로</span>
            <div className="flex items-center gap-0.5">
              {isTranspiling && (
                <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#635ADC]" />
              )}
              <Button variant="icon" type="button" onClick={() => void handleCopy()} disabled={isTranspiling} title={copied ? '복사됨!' : '복사'}>
                {copied ? <IconCheck /> : <IconCopy />}
              </Button>
              <Button variant="icon" type="button" onClick={() => void handleDownload()} disabled={isTranspiling} title="다운로드">
                <IconDownload />
              </Button>
              {context === 'chat' ? (
                <Button variant="icon" type="button" onClick={handleSaveToEditor} disabled={isTranspiling} title="에디터에 저장">
                  <IconSave />
                </Button>
              ) : (
                <Button variant="icon" type="button" onClick={handleInsertToCell} disabled={isTranspiling} title="셀에 삽입">
                  <IconInsert />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 코드 영역 */}
      <div className="relative">
        <pre ref={preRef} onScroll={() => setIsScrolled((preRef.current?.scrollTop ?? 0) > 0)} className={`${context === 'panel' ? 'max-h-32' : 'max-h-60'} overflow-auto bg-white pt-2 px-4 pb-4 font-mono text-xs leading-relaxed text-gray-800 whitespace-pre-wrap break-words`}>
          {isTranspiling ? (
            <span className="text-gray-400">포맷 변환 중…</span>
          ) : displayCode || (
            <span className="text-gray-400">
              {isStreaming ? '회로를 생성하고 있습니다…' : ''}
            </span>
          )}
          {isStreaming && code && (
            <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-[#7B74E4] align-middle" />
          )}
        </pre>
        {/* 포맷 select — 코드 영역 우상단 floating (스크롤바 밖) */}
        <div className="absolute top-1.5 right-4 z-10">
          {isDone ? (
            <select
              value={currentFormat}
              onChange={(e) => handleFormatChange(e.target.value as CodaOutputFormat)}
              disabled={isTranspiling}
              className="rounded-md border border-gray-200 bg-white px-1.5 py-1 text-[11px] font-medium text-gray-600 outline-none cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-colors"
              aria-label="포맷 변환"
            >
              {FORMAT_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>
                  {isTranspiling && val === currentFormat ? `${label}…` : label}
                </option>
              ))}
            </select>
          ) : (
            <Badge variant="format">{FORMAT_LABELS[format] ?? format}</Badge>
          )}
        </div>
      </div>

      {/* 리소스 추정 — Plan v1: 리소스 먼저 */}
      {isDone && (
        <Card variant="resource" className="w-full">
          <p className="mb-2 text-xs font-semibold text-gray-500">리소스 추정</p>
          <div className={`flex justify-between gap-y-1.5 font-mono text-xs ${context === 'panel' ? 'w-full' : 'w-[40%]'}`}>
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-400">큐비트</span>
              <span className="font-semibold text-gray-700">{analysis.resourceEstimation.qubits}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-400">깊이</span>
              <span className="font-semibold text-gray-700">{analysis.resourceEstimation.depth}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-400">게이트</span>
              <span className="font-semibold text-gray-700">{analysis.resourceEstimation.gates}</span>
            </div>
          </div>
        </Card>
      )}

      {/* 시뮬레이션 결과 — Plan v1: 리소스 다음 */}
      {isDone && (
        <div className="w-full">
          <ResultsPanel
            result={analysis.simulationResult}
            title="시뮬레이션 결과 (클래식 이상적)"
            className="w-full"
            contentClassName={context === 'panel' ? 'w-full' : 'w-[40%]'}
          />
        </div>
      )}

      {/* 에디터 저장 피드백 */}
      {saveMsg && (
        <div className="border-t border-[#D8D5F7] bg-[#EEEDFB] px-4 py-2 text-xs text-[#4F48C9]">
          {saveMsg}
        </div>
      )}

      {/* 셀 삽입 피드백 */}
      {insertMsg && (
        <div className="border-t border-[#D8D5F7] bg-[#EEEDFB] px-4 py-2 text-xs text-[#4F48C9]">
          {insertMsg}
        </div>
      )}
    </Card>
  )
}
