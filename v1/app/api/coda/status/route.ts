export const dynamic = 'force-static'
import { NextResponse } from 'next/server'
import { checkCodaStatus } from '@/lib/coda/coda.client'

export async function GET(): Promise<NextResponse> {
  const status = await checkCodaStatus()
  return NextResponse.json(status)
}
