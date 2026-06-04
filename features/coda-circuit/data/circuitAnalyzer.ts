import type { ResourceEstimation } from '@/features/coda-edit/hooks/useCircuitEditor'
import type { QuantumResult } from './sampleCircuits'

function parseQubits(code: string): number {
  const cudaqMatch = code.match(/qvector\s*\(\s*(\d+)\s*\)/)
  if (cudaqMatch) return parseInt(cudaqMatch[1])

  const qiskitMatch = code.match(/QuantumCircuit\s*\(\s*(\d+)/)
  if (qiskitMatch) return parseInt(qiskitMatch[1])

  const pennylaneMatch = code.match(/device\s*\([^)]*wires\s*=\s*(\d+)/)
  if (pennylaneMatch) return parseInt(pennylaneMatch[1])

  const pyquilMatch = code.match(/"(\d+)q-qvm"/)
  if (pyquilMatch) return parseInt(pyquilMatch[1])

  return 2
}

function parseGates(code: string): Record<string, number> {
  const gates: Record<string, number> = {}

  const patterns: [string, RegExp][] = [
    ['H',    /\bh\s*\(|\bHadamard\b/g],
    ['CX',   /\bcx\s*\(|\bCNOT\s*\(/g],
    ['X',    /(?<![A-Za-z])x\s*\(|\bPauliX\b/g],
    ['Y',    /(?<![A-Za-z])y\s*\(|\bPauliY\b/g],
    ['Z',    /(?<![A-Za-z])z\s*\(|\bPauliZ\b/g],
    ['CZ',   /\bcz\s*\(|\bCZ\s*\(/g],
    ['SWAP', /\bswap\s*\(|\bSWAP\s*\(/g],
    ['RX',   /\brx\s*\(|\bRX\s*\(/g],
    ['RY',   /\bry\s*\(|\bRY\s*\(/g],
    ['RZ',   /\brz\s*\(|\bRZ\s*\(/g],
    ['S',    /(?<![A-Za-z])s\s*\(|\bS_DAGGER\b/g],
    ['T',    /(?<![A-Za-z])t\s*\(|\bT_DAGGER\b/g],
  ]

  for (const [name, re] of patterns) {
    const count = (code.match(re) ?? []).length
    if (count > 0) gates[name] = count
  }

  return gates
}

function estimateDepth(qubits: number, gates: Record<string, number>): number {
  const total = Object.values(gates).reduce((a, b) => a + b, 0)
  if (total === 0) return 1
  return Math.max(1, Math.ceil(total / Math.max(1, qubits - 1)))
}

function formatGates(gates: Record<string, number>): string {
  if (Object.keys(gates).length === 0) return '없음'
  return Object.entries(gates)
    .map(([k, v]) => `${k}×${v}`)
    .join(', ')
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function makePrng(seed: number) {
  let s = seed
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateSimulationResult(
  code: string,
  qubits: number,
  gates: Record<string, number>
): QuantumResult {
  const shots = 1000
  const rand = makePrng(hashCode(code))
  const capQubits = Math.min(qubits, 5)

  const stateCount = 2 ** capQubits
  const allStates = Array.from({ length: stateCount }, (_, i) => {
    const bits = i.toString(2).padStart(capQubits, '0')
    return `|${bits}⟩`
  })

  const hasH = (gates['H'] ?? 0) > 0
  const hasCX = (gates['CX'] ?? 0) + (gates['CZ'] ?? 0) > 0
  const hasRotations = (gates['RX'] ?? 0) + (gates['RY'] ?? 0) + (gates['RZ'] ?? 0) > 0

  let probs: number[]

  if (hasH && hasCX) {
    // 얽힘 회로 → |000...⟩, |111...1⟩ 우세
    const jitter = (rand() - 0.5) * 0.06
    const p0 = 0.5 + jitter
    probs = allStates.map((_, i) => {
      if (i === 0) return p0
      if (i === stateCount - 1) return 1 - p0
      return rand() * 0.02
    })
  } else if (hasH && hasRotations) {
    // 임의 회전 포함 → 불균일 분포
    probs = allStates.map(() => rand() ** 0.7)
  } else if (hasH) {
    // 균일 중첩
    probs = allStates.map(() => 1 + (rand() - 0.5) * 0.3)
  } else {
    // 게이트 없거나 X류만 → |000...⟩ 혹은 특정 상태 지배
    const dominantIdx = gates['X'] ? Math.min(stateCount - 1, (gates['X'] ?? 0)) : 0
    probs = allStates.map((_, i) => (i === dominantIdx ? 0.95 + rand() * 0.05 : rand() * 0.01))
  }

  const sum = probs.reduce((a, b) => a + b, 0)
  probs = probs.map((p) => p / sum)

  let counts = probs.map((p, i) => ({
    state: allStates[i],
    count: Math.round(p * shots),
  }))

  const diff = shots - counts.reduce((a, b) => a + b.count, 0)
  counts[0].count += diff

  const maxCount = Math.max(...counts.map((c) => c.count))

  return {
    shots,
    counts: counts
      .filter((c) => c.count > 0)
      .map((c) => ({
        ...c,
        isNoise: c.count < maxCount * 0.05 ? true : undefined,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  }
}

export function analyzeCircuit(code: string): {
  resourceEstimation: ResourceEstimation
  simulationResult: QuantumResult
} {
  if (!code.trim()) {
    return {
      resourceEstimation: { qubits: 0, depth: 0, gates: '없음' },
      simulationResult: { shots: 1000, counts: [{ state: '|0⟩', count: 1000 }] },
    }
  }

  const qubits = parseQubits(code)
  const gates = parseGates(code)
  const depth = estimateDepth(qubits, gates)

  return {
    resourceEstimation: { qubits, depth, gates: formatGates(gates) },
    simulationResult: generateSimulationResult(code, qubits, gates),
  }
}
