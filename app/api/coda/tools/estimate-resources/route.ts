export const dynamic = 'force-static'
import { NextRequest, NextResponse } from 'next/server'
import { RESOURCE_ESTIMATION } from '@/features/coda-circuit/data/sampleCircuits'

export async function POST(_request: NextRequest): Promise<NextResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return NextResponse.json({ estimation: RESOURCE_ESTIMATION })
}
