'use client'

import type { PipelineStage, JobStatus } from '../types/circuit.types'
import { RESOURCE_ESTIMATION } from '../data/sampleCircuits'

interface PipelineStatusProps {
  stages: PipelineStage[]
  visible: boolean
  jobStatus?: JobStatus
}

const QPU_STAGES: Array<{ id: Exclude<JobStatus, 'idle'>; label: string }> = [
  { id: 'submitting', label: 'QPU 제출 중' },
  { id: 'queued', label: '대기열 등록' },
  { id: 'running', label: 'QPU 연산 중' },
  { id: 'complete', label: '연산 완료' },
]

const JOB_ORDER: JobStatus[] = ['idle', 'submitting', 'queued', 'running', 'complete']

function getQpuStatus(stageId: JobStatus, current: JobStatus): 'done' | 'running' | 'pending' {
  const stageIdx = JOB_ORDER.indexOf(stageId)
  const currentIdx = JOB_ORDER.indexOf(current)
  if (stageIdx < currentIdx) return 'done'
  if (stageIdx === currentIdx) return 'running'
  return 'pending'
}

function StageRow({ status, label }: { status: 'done' | 'running' | 'pending'; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-center text-xs">
        {status === 'done' ? '✓' : status === 'running' ? '⋯' : '○'}
      </span>
      <span
        className={`text-xs ${
          status === 'done'
            ? 'text-[#635ADC]'
            : status === 'running'
            ? 'text-[#4F48C9] font-medium'
            : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export function PipelineStatus({ stages, visible, jobStatus = 'idle' }: PipelineStatusProps) {
  const hasQpu = jobStatus !== 'idle'
  const showPipeline = visible || hasQpu

  if (!showPipeline) return null

  const allGenerationDone = stages.every((s) => s.status === 'done')

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      {/* 생성 파이프라인 */}
      {visible && (
        <>
          <p className="mb-2 text-xs font-medium text-gray-500">파이프라인 진행</p>
          <div className="flex flex-col gap-1.5">
            {stages.map((stage) => (
              <StageRow
                key={stage.id}
                status={stage.status === 'done' ? 'done' : stage.status === 'running' ? 'running' : 'pending'}
                label={stage.label}
              />
            ))}
          </div>

          {allGenerationDone && (
            <div className="mt-3 border-t border-gray-200 pt-2">
              <p className="mb-1 text-xs font-medium text-gray-500">리소스 추정</p>
              <div className="flex gap-3 text-xs text-gray-600">
                <span>큐비트 {RESOURCE_ESTIMATION.qubits}</span>
                <span>깊이 {RESOURCE_ESTIMATION.depth}</span>
                <span>게이트 {RESOURCE_ESTIMATION.gates}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* QPU 파이프라인 — 제출 후 연장 */}
      {hasQpu && (
        <div className={visible ? 'mt-3 border-t border-gray-200 pt-3' : ''}>
          <p className="mb-2 text-xs font-medium text-[#635ADC]">QPU Job 파이프라인</p>
          <div className="flex flex-col gap-1.5">
            {QPU_STAGES.map((stage) => {
              const status = getQpuStatus(stage.id, jobStatus)
              return (
                <div key={stage.id} className="flex items-center gap-2">
                  <span className="w-4 text-center text-xs">
                    {status === 'done' ? '✓' : status === 'running' ? '⋯' : '○'}
                  </span>
                  <span
                    className={`text-xs ${
                      status === 'done'
                        ? 'text-[#635ADC]'
                        : status === 'running'
                        ? 'text-[#4F48C9] font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    {stage.label}
                    {stage.id === 'queued' && status === 'running' && (
                      <span className="ml-1 text-gray-400">(대기 3번째)</span>
                    )}
                    {stage.id === 'running' && status === 'running' && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#635ADC] align-middle" />
                    )}
                  </span>
                </div>
              )
            })}
          </div>
          {jobStatus === 'complete' && (
            <p className="mt-2 text-xs text-[#635ADC] font-medium">
              ✓ JOB-2847 연산 완료 — 결과는 아래에서 확인하세요
            </p>
          )}
        </div>
      )}
    </div>
  )
}
