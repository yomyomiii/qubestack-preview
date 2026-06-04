// 프리뷰 전용 모의(Mock) Coda 클라이언트
// 실제 API 없이 SSE 스트리밍 동작을 시뮬레이션합니다.

import type { CodaOutputFormat, CodaStatusResponse } from '@/features/coda-notebook/types/coda.types'

const MOCK_CUDA_Q = `import cudaq
from cudaq import spin

@cudaq.kernel
def ghz(n: int):
    qubits = cudaq.qvector(n)
    h(qubits[0])
    for i in range(n - 1):
        cx(qubits[i], qubits[i + 1])
    mz(qubits)

# 3큐비트 GHZ 상태 실행
result = cudaq.sample(ghz, 3, shots_count=1000)
print(result)
`

const MOCK_OPENQASM3 = `OPENQASM 3.0;
include "stdgates.inc";

qubit[3] q;
bit[3] c;

// GHZ 상태 준비
h q[0];
cx q[0], q[1];
cx q[1], q[2];

// 측정
c = measure q;
`

function getMockCode(format: CodaOutputFormat): string {
  // 모든 포맷에 대해 CUDA-Q 샘플 반환 (프로토타입 — 실제 구현은 개발팀)
  void format
  return MOCK_CUDA_Q
}

export async function callCodaAgentsStream(
  prompt: string,
  format: CodaOutputFormat
): Promise<ReadableStream<Uint8Array>> {
  const code = getMockCode(format)
  const lines = code.split('\n')
  const encoder = new TextEncoder()

  // SSE 형식으로 한 줄씩 스트리밍
  return new ReadableStream({
    async start(controller) {
      await delay(300) // 초기 지연

      for (const line of lines) {
        const chunk: { type: string; content: string } = {
          type: 'text',
          content: line + '\n',
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
        )
        await delay(80) // 타이핑 효과
      }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      )
      controller.close()
    },
  })
}

export async function checkCodaStatus(): Promise<CodaStatusResponse> {
  await delay(100)
  return { available: true, latencyMs: 120 }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
