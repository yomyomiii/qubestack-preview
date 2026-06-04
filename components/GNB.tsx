'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

function IconBuilder() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="2" fill="currentColor" />
      <circle cx="2.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="2.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="3.8" y1="4.6" x2="6.2" y2="6.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="11.2" y1="4.6" x2="8.8" y2="6.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="3.8" y1="10.4" x2="6.2" y2="8.5" stroke="currentColor" strokeWidth="1.1" />
      <line x1="11.2" y1="10.4" x2="8.8" y2="8.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function IconEditor() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 5.5L6.5 7.5L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="9.5" x2="11" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconExtension() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9.5 11H13M11 9.5V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ITEMS = [
  { label: 'Learner/Builder', href: '/circuit-builder/demo', icon: <IconBuilder />, preview: true },
  { label: 'Editor', href: '/edit', icon: <IconEditor />, preview: true },
  { label: 'Server', href: '/extension', icon: <IconExtension />, preview: false },
]

export function GNB() {
  const pathname = usePathname()
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  return (
    <aside className="flex w-48 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* 브랜드 */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#635ADC" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 2V22M3 7L21 17M21 7L3 17" stroke="#635ADC" strokeWidth="0.9" strokeLinejoin="round" opacity="0.35"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <p className="text-base font-bold tracking-tight text-gray-900">QubeStack</p>
            <p className="text-xs font-semibold text-gray-400">2.0</p>
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-gray-100" />

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-0.5 p-2 pt-3 flex-1">
        {NAV_ITEMS.map(({ label, href, icon, preview }) => {
          const active = pathname === href || (href === '/extension' && pathname === '/')
          const baseClass = `flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left ${
            active
              ? 'bg-[#635ADC] text-white'
              : 'text-gray-500 hover:bg-[#EEEDFB] hover:text-[#635ADC]'
          }`
          return preview ? (
            <button
              key={href}
              type="button"
              onClick={() => setPendingHref(href)}
              className={baseClass}
            >
              {icon}
              {label}
            </button>
          ) : (
            <Link key={href} href={href} className={baseClass}>
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* 미리보기 확인 모달 */}
      {pendingHref && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
          onClick={() => setPendingHref(null)}
        >
          <div
            className="w-76 rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1.5 text-sm font-semibold text-gray-900">개발 미확정 기능</p>
            <p className="mb-5 text-xs leading-relaxed text-gray-500">
              이 기능은 아직 개발하기로 확정되지 않았습니다. 그래도 둘러보시겠습니까?
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  router.push(pendingHref)
                  setPendingHref(null)
                }}
                className="w-full rounded-lg bg-[#635ADC] px-3 py-2 text-xs font-medium text-white hover:bg-[#5249C5] transition-colors"
              >
                그래도 둘러볼래요
              </button>
              <button
                type="button"
                onClick={() => setPendingHref(null)}
                className="w-full rounded-lg px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                알겠어요, 안 둘러볼래요
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
