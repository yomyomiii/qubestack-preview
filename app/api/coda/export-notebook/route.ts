import { NextRequest, NextResponse } from 'next/server'
import type { ExportNotebookRequest, NotebookExport } from '@/features/coda-circuit/types/circuit.types'

function buildNotebook(code: string, format: string): NotebookExport {
  const headerComment =
    format === 'openqasm3'
      ? '# QubeStack 2.0 × Coda — 생성된 OpenQASM 3.0 회로\n'
      : '# QubeStack 2.0 × Coda — 생성된 CUDA-Q 회로\n'

  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
      language_info: { name: 'python' },
    },
    cells: [
      {
        cell_type: 'markdown',
        source: ['# QubeStack 2.0 × Coda 생성 회로\n', `> 포맷: ${format}`],
        metadata: {},
        outputs: [],
        execution_count: null,
      },
      {
        cell_type: 'code',
        source: [headerComment, code],
        metadata: {},
        outputs: [],
        execution_count: null,
      },
    ],
  }
}

export async function POST(request: NextRequest): Promise<NextResponse | Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 파싱 실패' } },
      { status: 400 }
    )
  }

  const { code, format, filename } = body as Partial<ExportNotebookRequest>

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'code 필드가 필요합니다.' } },
      { status: 400 }
    )
  }
  const VALID_FORMATS = ['cuda-q', 'qiskit', 'pennylane', 'pyquil']
  if (!format || !VALID_FORMATS.includes(format)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'format이 잘못되었습니다.' } },
      { status: 400 }
    )
  }

  const notebook = buildNotebook(code.trim(), format)
  const json = JSON.stringify(notebook, null, 2)
  const safeFilename = (filename ?? 'circuit').replace(/[^a-zA-Z0-9_-]/g, '_')

  return new Response(json, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFilename}.ipynb"`,
    },
  })
}
