export const dynamic = 'force-static'
import { NextRequest, NextResponse } from 'next/server'
import { callCodaAgentsStream } from '@/lib/coda/coda.client'
import type { CodaGenerateRequest } from '@/features/coda-notebook/types/coda.types'

export async function POST(request: NextRequest): Promise<NextResponse | Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: '요청 파싱 실패' } }, { status: 400 })
  }

  const { prompt, format } = body as Partial<CodaGenerateRequest>

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'prompt 필드가 필요합니다.' } }, { status: 400 })
  }
  const VALID_FORMATS = ['cuda-q', 'qiskit', 'pennylane', 'pyquil']
  if (!format || !VALID_FORMATS.includes(format)) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'format이 잘못되었습니다.' } }, { status: 400 })
  }

  const upstream = await callCodaAgentsStream(prompt.trim(), format)

  return new Response(upstream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
