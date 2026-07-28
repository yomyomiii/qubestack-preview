'use client'

import { useCircuitEditor } from '../hooks/useCircuitEditor'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'
import type { QuantumResult } from '@/features/coda-circuit/data/sampleCircuits'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatusBanner } from '@/components/ui/StatusBanner'

const FORMAT_LABELS: Record<CodaOutputFormat, string> = {
  'cuda-q': 'CUDA-Q',
  'qiskit': 'Qiskit',
  'pennylane': 'PennyLane',
  'pyquil': 'PyQuil',
}

const JOB_STATUS_LABELS = {
  idle: 'QPU 제출',
  submitting: '제출 중…',
  queued: '대기열 등록됨',
  running: 'QPU 연산 중',
  complete: '연산 완료',
} as const

const MOCK_JOB_ID = 'JOB-2848'
const MOCK_QUEUE_POS = 2
const BAR_MAX = 12

function ResultBar({ count, maxCount, isNoise }: { count: number; maxCount: number; isNoise?: boolean }) {
  const filled = Math.max(1, Math.round((count / maxCount) * BAR_MAX))
  return (
    <span className={`min-w-0 overflow-hidden ${isNoise ? 'text-[#9990EB]' : 'text-[#635ADC]'}`}>
      {'█'.repeat(filled)}
    </span>
  )
}

function ResultsPanel({
  result,
  title,
  accent,
}: {
  result: QuantumResult
  title: string
  accent: 'blue' | 'purple'
}) {
  const maxCount = Math.max(...result.counts.map((r) => r.count))
  const variant = accent === 'purple' ? 'result-qpu' : 'result-ideal'
  const labelColor = 'text-[#635ADC]'

  return (
    <Card variant={variant}>
      <p className={`mb-2 text-xs font-semibold ${labelColor}`}>{title}</p>
      <div className="flex flex-col gap-1 font-mono text-xs">
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

interface CircuitEditorProps {
  initialCode: string
  initialFormat: CodaOutputFormat
}

export function CircuitEditor({ initialCode, initialFormat }: CircuitEditorProps) {
  const {
    code,
    format,
    setCode,
    isSimulating,
    simulationResult,
    resourceEstimation,
    jobStatus,
    handleJobSubmit,
  } = useCircuitEditor(initialCode, initialFormat)

  const isJobActive = jobStatus !== 'idle'

  const statusColorMap = {
    idle: undefined,
    submitting: 'submitting',
    queued: 'queued',
    running: 'running',
    complete: 'complete',
  } as const

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">Editor</span>
          <Badge variant="format">{FORMAT_LABELS[format]}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {isSimulating && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#635ADC]" />
              분석 중…
            </span>
          )}
          <Button
            variant="status"
            statusColor={statusColorMap[jobStatus]}
            type="button"
            onClick={handleJobSubmit}
            disabled={isJobActive}
          >
            {jobStatus === 'running' && (
              <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            )}
            {JOB_STATUS_LABELS[jobStatus]}
          </Button>
        </div>
      </div>

      {/* 편집기 + 결과 패널 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 코드 에디터 */}
        <div className="flex flex-1 flex-col border-r border-gray-200">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none bg-white p-4 font-mono text-xs leading-relaxed text-gray-800 outline-none"
            aria-label="회로 코드 에디터"
          />
        </div>

        {/* 결과 패널 */}
        <div className="w-72 shrink-0 overflow-y-auto">
          {/* 리소스 추정 */}
          {resourceEstimation && (
            <Card variant="resource" className="border-b border-gray-100">
              <p className="mb-2 text-xs font-semibold text-gray-500">리소스 추정</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400">큐비트</span>
                  <span className="font-semibold text-gray-700">{resourceEstimation.qubits}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400">깊이</span>
                  <span className="font-semibold text-gray-700">{resourceEstimation.depth}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400">게이트</span>
                  <span className="font-semibold text-gray-700">{resourceEstimation.gates}</span>
                </div>
              </div>
            </Card>
          )}

          {/* 시뮬레이션 결과 */}
          {simulationResult && (
            <ResultsPanel
              result={simulationResult}
              title="시뮬레이션 결과 (클래식 이상적)"
              accent="blue"
            />
          )}

          {/* 시뮬레이션 플레이스홀더 */}
          {!simulationResult && (
            <div className="px-4 py-6 text-center text-xs text-gray-400">
              {isSimulating ? '분석 중…' : '결과 없음'}
            </div>
          )}

          {/* Job Engine 상태 배너 */}
          {isJobActive && jobStatus !== 'complete' && (
            <StatusBanner
              status={jobStatus as 'submitting' | 'queued' | 'running'}
              jobId={MOCK_JOB_ID}
              queuePosition={MOCK_QUEUE_POS}
            />
          )}

          {/* QPU 연산 결과 */}
          {jobStatus === 'complete' && simulationResult && (
            <ResultsPanel
              result={{
                shots: 1000,
                counts: [
                  { state: '|000⟩', count: 487 },
                  { state: '|111⟩', count: 473 },
                  { state: '|001⟩', count: 12, isNoise: true },
                  { state: '|110⟩', count: 9, isNoise: true },
                  { state: '|010⟩', count: 8, isNoise: true },
                  { state: '|100⟩', count: 7, isNoise: true },
                  { state: '|011⟩', count: 4, isNoise: true },
                  { state: '|101⟩', count: 1, isNoise: true },
                ],
              }}
              title={`QPU 연산 결과 (실제 하드웨어) — ${MOCK_JOB_ID}`}
              accent="purple"
            />
          )}
        </div>
      </div>
    </div>
  )
}
