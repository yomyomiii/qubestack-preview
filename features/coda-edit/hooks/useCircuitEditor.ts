'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'
import type { JobStatus } from '@/features/coda-circuit/types/circuit.types'
import type { QuantumResult } from '@/features/coda-circuit/data/sampleCircuits'

export interface ResourceEstimation {
  qubits: number
  depth: number
  gates: string
}

export interface UseCircuitEditorReturn {
  code: string
  format: CodaOutputFormat
  setCode: (code: string) => void
  isSimulating: boolean
  simulationResult: QuantumResult | null
  resourceEstimation: ResourceEstimation | null
  jobStatus: JobStatus
  handleJobSubmit: () => void
}

export function useCircuitEditor(
  initialCode: string,
  initialFormat: CodaOutputFormat
): UseCircuitEditorReturn {
  const [code, setCodeState] = useState(initialCode)
  const [format] = useState<CodaOutputFormat>(initialFormat)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<QuantumResult | null>(null)
  const [resourceEstimation, setResourceEstimation] = useState<ResourceEstimation | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runAnalysis = useCallback(async () => {
    setIsSimulating(true)
    try {
      const [simRes, estRes] = await Promise.all([
        fetch('/api/coda/tools/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
        fetch('/api/coda/tools/estimate-resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
      ])
      if (simRes.ok) {
        const data = (await simRes.json()) as { result: QuantumResult }
        setSimulationResult(data.result)
      }
      if (estRes.ok) {
        const data = (await estRes.json()) as { estimation: ResourceEstimation }
        setResourceEstimation(data.estimation)
      }
    } catch {
      // 프리뷰 모드: 네트워크 오류 무시
    } finally {
      setIsSimulating(false)
    }
  }, [])

  useEffect(() => {
    void runAnalysis()
  }, [runAnalysis])

  function setCode(newCode: string) {
    setCodeState(newCode)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void runAnalysis()
    }, 300)
  }

  useEffect(() => {
    if (jobStatus === 'submitting') {
      const t = setTimeout(() => setJobStatus('queued'), 800)
      return () => clearTimeout(t)
    }
    if (jobStatus === 'queued') {
      const t = setTimeout(() => setJobStatus('running'), 1400)
      return () => clearTimeout(t)
    }
    if (jobStatus === 'running') {
      const t = setTimeout(() => setJobStatus('complete'), 3000)
      return () => clearTimeout(t)
    }
  }, [jobStatus])

  function handleJobSubmit() {
    if (jobStatus !== 'idle') return
    setJobStatus('submitting')
  }

  return {
    code,
    format,
    setCode,
    isSimulating,
    simulationResult,
    resourceEstimation,
    jobStatus,
    handleJobSubmit,
  }
}
