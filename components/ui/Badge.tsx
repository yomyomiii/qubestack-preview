import React from 'react'

type BadgeVariant =
  | 'format'
  | 'mode-build'
  | 'mode-learn'
  | 'status-running'
  | 'status-done'
  | 'status-queued'
  | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  'format':         'rounded bg-[#EEEDFB] px-2 py-0.5 text-xs font-medium text-[#635ADC]',
  'mode-build':     'rounded bg-[#EEEDFB] px-2 py-0.5 text-xs font-medium text-[#635ADC]',
  'mode-learn':     'rounded bg-[#EEEDFB] px-2 py-0.5 text-xs font-medium text-[#635ADC]',
  'status-running': 'rounded bg-[#EEEDFB] px-2 py-0.5 text-xs font-medium text-[#635ADC]',
  'status-done':    'rounded bg-[#EEEDFB] px-2 py-0.5 text-xs font-medium text-[#635ADC]',
  'status-queued':  'rounded bg-[#EEEDFB] px-2 py-0.5 text-xs font-medium text-[#635ADC]',
  'neutral':        'rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700',
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const base = VARIANT_CLASSES[variant]
  const finalClass = [base, className].filter(Boolean).join(' ')
  return <span className={finalClass}>{children}</span>
}
