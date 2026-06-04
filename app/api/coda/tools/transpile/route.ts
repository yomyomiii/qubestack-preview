import { NextRequest, NextResponse } from 'next/server'
import { getSampleCode } from '@/features/coda-circuit/data/sampleCircuits'
import type { CodaOutputFormat } from '@/features/coda-notebook/types/coda.types'

const VALID_FORMATS = ['cuda-q', 'qiskit', 'pennylane', 'pyquil']

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 파싱 실패' } },
      { status: 400 }
    )
  }

  const { format } = body as { format?: string }
  if (!format || !VALID_FORMATS.includes(format)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'format이 잘못되었습니다.' } },
      { status: 400 }
    )
  }

  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json({ code: getSampleCode(format as CodaOutputFormat), format })
}
