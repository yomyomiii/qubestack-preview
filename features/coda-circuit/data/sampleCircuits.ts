import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'

export const SAMPLE_CIRCUITS: Record<CodaOutputFormat, string> = {
  'cuda-q': `import cudaq

@cudaq.kernel
def ghz_state():
    q = cudaq.qvector(3)
    h(q[0])
    cx(q[0], q[1])
    cx(q[0], q[2])

result = cudaq.sample(ghz_state)
result.dump()
# 샘플 출력: {'000': 498, '111': 502}`,

  'qiskit': `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(0, 2)
qc.measure([0, 1, 2], [0, 1, 2])

simulator = AerSimulator()
result = simulator.run(qc, shots=1000).result()
counts = result.get_counts()
print(counts)
# 샘플 출력: {'000': 498, '111': 502}`,

  'pennylane': `import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=3)

@qml.qnode(dev)
def ghz_circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    qml.CNOT(wires=[0, 2])
    return qml.probs(wires=[0, 1, 2])

probs = ghz_circuit()
print(probs)
# [0.5 0. 0. 0. 0. 0. 0. 0.5]
# |000⟩: 50%, |111⟩: 50%`,

  'pyquil': `from pyquil import get_qc, Program
from pyquil.gates import H, CNOT, MEASURE

p = Program()
p += H(0)
p += CNOT(0, 1)
p += CNOT(0, 2)

ro = p.declare("ro", "BIT", 3)
p += MEASURE(0, ro[0])
p += MEASURE(1, ro[1])
p += MEASURE(2, ro[2])
p.wrap_in_numshots_loop(1000)

qc = get_qc("3q-qvm")
result = qc.run(p)
print(result.get_register_map()["ro"])
# [[0,0,0], [1,1,1], ...]`,
}

export const RESOURCE_ESTIMATION = {
  qubits: 3,
  depth: 4,
  gates: 'H×1, CX×2',
}

export interface ResultCount {
  state: string
  count: number
  isNoise?: boolean
}

export interface QuantumResult {
  shots: number
  counts: ResultCount[]
}

export const SIMULATION_RESULT: QuantumResult = {
  shots: 1000,
  counts: [
    { state: '|000⟩', count: 498 },
    { state: '|111⟩', count: 502 },
  ],
}

export const QPU_RESULT: QuantumResult = {
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
}

const LEARN_TEXT = `**GHZ(Greenberger–Horne–Zeilinger) 상태**란 3개 이상의 큐비트가 최대 얽힘(entanglement) 상태에 있는 다중 큐비트 양자 상태입니다.

**수식:** |GHZ⟩ = (|000⟩ + |111⟩) / √2

**구성 원리**
1. **H 게이트** → 첫 번째 큐비트를 중첩 상태로 전환: |0⟩ → (|0⟩+|1⟩)/√2
2. **CNOT** → 두 번째 큐비트와 얽힘 생성
3. **CNOT** → 세 번째 큐비트와 얽힘 확장

**리소스:** 큐비트 3개, 깊이 4, 게이트 3개 (H×1, CX×2)

**측정 결과:** |000⟩ 또는 |111⟩이 각 50% 확률로 나타납니다. 한 큐비트를 측정하면 나머지 큐비트의 상태가 즉시 결정됩니다.

**활용 분야:** 양자 비밀 공유, 양자 오류 수정, 양자 네트워크 프로토콜`

export function getSampleCode(format: CodaOutputFormat): string {
  return SAMPLE_CIRCUITS[format] ?? SAMPLE_CIRCUITS['cuda-q']
}

export function getSampleLearnText(): string {
  return LEARN_TEXT
}
