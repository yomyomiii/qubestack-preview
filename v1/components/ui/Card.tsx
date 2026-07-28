import React from 'react'

type CardVariant =
  | 'default'
  | 'code'
  | 'result-ideal'
  | 'result-qpu'
  | 'resource'
  | 'error'

interface CardProps {
  variant?: CardVariant
  className?: string
  children: React.ReactNode
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  'default':      'overflow-hidden rounded-xl border border-gray-200 bg-white',
  'code':         'overflow-hidden rounded-xl border border-gray-200 bg-white',
  'result-ideal': 'border-t border-[#D8D5F7] bg-[#EEEDFB] px-4 py-3',
  'result-qpu':   'border-t border-[#D8D5F7] bg-[#EEEDFB] px-4 py-3',
  'resource':     'border-t border-[#EDE9FB] bg-[#FAF9FF] px-4 py-3',
  'error':        'rounded-xl border border-[#D8D5F7] bg-[#EEEDFB] p-4',
}

export function Card({ variant = 'default', className = '', children }: CardProps) {
  const base = VARIANT_CLASSES[variant]
  const finalClass = [base, className].filter(Boolean).join(' ')
  return <div className={finalClass}>{children}</div>
}
