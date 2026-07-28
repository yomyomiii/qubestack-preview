// Design Ref: §5.2 — 동의 모달 UI 및 5.4 동의 모달 체크리스트 전체 구현

'use client'

interface CodaConsentModalProps {
  onConsent: () => void
  onCancel: () => void
}

export function CodaConsentModal({ onConsent, onCancel }: CodaConsentModalProps) {
  return (
    // 배경 오버레이
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      {/* 모달 본문 */}
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coda-consent-title"
      >
        <h2 id="coda-consent-title" className="text-lg font-semibold text-gray-900">
          AI 회로 생성 기능 사용 전 안내
        </h2>

        <hr className="my-3 border-gray-200" />

        {/* 안내 문구 */}
        <p className="text-sm text-gray-600">
          이 기능을 사용하면 입력하신 내용이 외부 서비스(Conductor Quantum Coda)로
          전송됩니다.
        </p>

        {/* 전송 정보 목록 */}
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>
            <span className="font-medium text-gray-800">전송 데이터:</span> 자연어 입력
            텍스트
          </li>
          <li>
            <span className="font-medium text-gray-800">저장 여부:</span> QubeStack 2.0 서버
            미저장
          </li>
          <li>
            <span className="font-medium text-gray-800">기능 끄기:</span> 언제든 설정에서
            기능을 끌 수 있습니다
          </li>
        </ul>

        {/* 버튼 영역 */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConsent}
            className="rounded-lg bg-[#635ADC] px-4 py-2 text-sm font-medium text-white hover:bg-[#4F48C9]"
          >
            동의하고 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
