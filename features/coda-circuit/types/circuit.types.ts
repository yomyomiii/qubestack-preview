// Design Ref: §3.1 — B안 전용 도메인 타입 (채팅 메시지 + Notebook 내보내기)

import type { CodaOutputFormat, CodaMode } from '@/features/coda-notebook/types/coda.types'

export type { CodaMode }

export interface PipelineStage {
  id: string
  label: string
  status: 'pending' | 'running' | 'done'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  format?: CodaOutputFormat
  mode?: CodaMode
  timestamp: string
  isStreaming?: boolean
  hasError?: boolean
  errorMessage?: string
}

export type ChatStatus = 'idle' | 'streaming' | 'done' | 'error'

export type JobStatus = 'idle' | 'submitting' | 'queued' | 'running' | 'complete'

export interface NotebookExport {
  nbformat: 4
  nbformat_minor: 5
  metadata: {
    kernelspec: {
      display_name: string
      language: string
      name: string
    }
    language_info: { name: string }
  }
  cells: Array<{
    cell_type: 'code' | 'markdown'
    source: string[]
    metadata: Record<string, unknown>
    outputs: []
    execution_count: null
  }>
}

export interface ExportNotebookRequest {
  code: string
  format: CodaOutputFormat
  filename?: string
}
