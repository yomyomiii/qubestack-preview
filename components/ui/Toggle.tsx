'use client'

interface ToggleOption<T extends string> {
  value: T
  label: string
  activeColor?: 'blue' | 'purple'
}

interface ToggleProps<T extends string> {
  value: T
  options: ToggleOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
}

export function Toggle<T extends string>({ value, options, onChange, disabled }: ToggleProps<T>) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1.5">
      {options.map((opt) => {
        const isActive = opt.value === value
        const activeColor = opt.activeColor ?? 'blue'
        const activeClass = activeColor === 'purple'
          ? 'bg-white text-[#635ADC] shadow-sm'
          : 'bg-white text-[#635ADC] shadow-sm'
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive ? activeClass : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
