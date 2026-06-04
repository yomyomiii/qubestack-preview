type BannerStatus = 'submitting' | 'queued' | 'running'

interface StatusBannerProps {
  status: BannerStatus
  jobId?: string
  queuePosition?: number
}

const STATUS_CLASSES: Record<BannerStatus, string> = {
  submitting: 'border-[#D8D5F7] bg-[#EEEDFB] text-[#635ADC]',
  queued:     'border-[#D8D5F7] bg-[#EEEDFB] text-[#635ADC]',
  running:    'border-[#D8D5F7] bg-[#EEEDFB] text-[#635ADC]',
}

export function StatusBanner({ status, jobId, queuePosition }: StatusBannerProps) {
  return (
    <div className={`border-t px-4 py-2.5 text-xs ${STATUS_CLASSES[status]}`}>
      {status === 'submitting' && <span>Job Engine에 제출하고 있습니다...</span>}
      {status === 'queued' && (
        <span>
          <span className="font-medium">{jobId}</span> — 대기열에 등록되었습니다.
          현재 대기 {queuePosition}번째
        </span>
      )}
      {status === 'running' && (
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#635ADC]" />
          <span>
            <span className="font-medium">{jobId}</span> — QPU 연산 중...
          </span>
        </span>
      )}
    </div>
  )
}
