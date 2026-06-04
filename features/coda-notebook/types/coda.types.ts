// Design Ref: §3.1 — 도메인 레이어 타입 정의 (Coda Agents API 스트리밍 + 로그 + 동의 상태)

export type CodaOutputFormat = 'cuda-q' | 'qiskit' | 'pennylane' | 'pyquil'

export type CodaMode = 'build' | 'learn'

export interface CodaGenerateRequest {
  prompt: string
  format: CodaOutputFormat
}

// SSE 스트리밍 청크 단위 응답
export interface CodaGenerateChunk {
  type: 'text' | 'done' | 'error'
  content?: string
  error?: string
}

// 폴백: SSE 불가 시 단순 JSON 응답
export interface CodaGenerateFallbackResponse {
  code: string
  format: CodaOutputFormat
}

// 기존 QubeStack 2.0 로그 시스템에 추가되는 이벤트 타입
export interface CodaCallLog {
  eventType: 'coda_call'
  userId: string
  callType: 'agents' | 'status'
  format?: CodaOutputFormat
  timestamp: string       // ISO 8601
  responseTimeMs: number
  success: boolean
  errorCode?: string
}

// localStorage 키: 'qurekaCodaConsent'
export interface CodaConsentState {
  given: boolean
  givenAt: string | null  // ISO 8601
}

// Coda Agents API 요청 형식 (내부 client용)
export interface CodaAgentsRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  thread_id?: string | null
  fast?: boolean
  mode?: 'build' | 'learn'
}

// GET /api/coda/status 응답
export interface CodaStatusResponse {
  available: boolean
  latencyMs?: number
}

// 오류 응답 공통 형식
export interface CodaErrorResponse {
  error: {
    code: 'CODA_TIMEOUT' | 'CODA_API_ERROR' | 'CODA_DIRECT_QPU_BLOCKED' | 'VALIDATION_ERROR' | 'UNAUTHORIZED'
    message: string
  }
}
