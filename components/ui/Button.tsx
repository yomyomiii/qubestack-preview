import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'status'
type ButtonSize = 'sm' | 'md' | 'lg'
type StatusColor = 'submitting' | 'queued' | 'running' | 'complete'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  statusColor?: StatusColor
}

const STATUS_COLOR_CLASSES: Record<StatusColor, string> = {
  submitting: 'bg-[#635ADC] hover:bg-[#4F48C9] text-white',
  queued:     'bg-[#9990EB] text-white',
  running:    'bg-[#7B74E4] text-white',
  complete:   'bg-[#4F48C9] text-white',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  statusColor,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sm = size === 'sm'
  const lg = size === 'lg'
  let base: string

  if (variant === 'primary') {
    const pad = lg ? 'px-4 py-2 text-sm' : sm ? 'px-3 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
    base = `whitespace-nowrap rounded-lg bg-[#635ADC] ${pad} font-medium text-white hover:bg-[#4F48C9] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 transition-colors`
  } else if (variant === 'secondary') {
    const pad = lg ? 'px-4 py-2 text-sm' : 'px-3.5 py-1.5'
    base = `whitespace-nowrap rounded-md border border-gray-200 ${pad} text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors`
  } else if (variant === 'ghost') {
    const pad = lg ? 'px-4 py-2 text-sm' : 'px-3 py-1.5'
    base = `whitespace-nowrap rounded-md ${pad} text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors`
  } else if (variant === 'danger') {
    base = 'whitespace-nowrap rounded-md border border-[#D8D5F7] px-2.5 py-1.5 text-xs font-medium text-[#635ADC] hover:bg-[#EEEDFB] disabled:opacity-50 transition-colors'
  } else {
    const colorClass = statusColor ? STATUS_COLOR_CLASSES[statusColor] : STATUS_COLOR_CLASSES.submitting
    base = `whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors ${colorClass}`
  }

  const finalClass = [base, className].filter(Boolean).join(' ')

  return (
    <button className={finalClass} {...props}>
      {children}
    </button>
  )
}
