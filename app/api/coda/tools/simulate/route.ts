export const dynamic = 'force-static'
import { NextRequest, NextResponse } from 'next/server'
import { SIMULATION_RESULT } from '@/features/coda-circuit/data/sampleCircuits'

export async function POST(_request: NextRequest): Promise<NextResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return NextResponse.json({ result: SIMULATION_RESULT })
}
