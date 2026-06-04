'use client'

import { Toggle } from '@/components/ui/Toggle'
import type { CodaMode } from '../types/circuit.types'

interface ModeToggleProps {
  mode: CodaMode
  onChange: (mode: CodaMode) => void
  disabled?: boolean
}

const MODE_OPTIONS = [
  { value: 'learn' as CodaMode, label: '📖 Learn', activeColor: 'purple' as const },
  { value: 'build' as CodaMode, label: '🔨 Build', activeColor: 'purple' as const },
]

export function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  return (
    <Toggle
      value={mode}
      options={MODE_OPTIONS}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
