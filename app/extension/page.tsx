'use client'

import { useEffect, useState } from 'react'
import { CircuitBuilder } from '@/features/coda-circuit/components/CircuitBuilder'

type NotebookCell =
  | { id: string; type: 'markdown'; source: string }
  | { id: string; type: 'code'; execCount: number | null; source: string; output: string | null }

const INITIAL_CELLS: NotebookCell[] = [
  {
    id: 'c1',
    type: 'markdown',
    source: '## QubeStack 2.0 × Coda Demo\n3큐비트 GHZ 상태 회로를 Coda AI로 생성합니다.',
  },
  {
    id: 'c2',
    type: 'code',
    execCount: 1,
    source: 'import cudaq\n\n# Coda AI가 생성한 회로\n@cudaq.kernel\ndef ghz_state():\n    q = cudaq.qvector(3)\n    h(q[0])\n    cx(q[0], q[1])\n    cx(q[0], q[2])\n\nresult = cudaq.sample(ghz_state)\nresult.dump()',
    output: "{ '000': 498, '111': 502 }",
  },
  {
    id: 'c3',
    type: 'code',
    execCount: null,
    source: '# 다음 회로를 여기에 삽입하세요',
    output: null,
  },
]

// Jupyter Lab LNB 아이콘 목록 — chatbot이 활성 상태
const LNB_ICONS = [
  { icon: '📁', title: 'File Browser', active: false },
  { icon: '🔍', title: 'Search', active: false },
  { icon: '⬡',  title: 'Extensions', active: false },
  { icon: '💬', title: 'Quda AI', active: true },
  { icon: '⚙️', title: 'Settings', active: false },
]

function MarkdownCell({ source }: { source: string }) {
  return (
    <div className="py-1 pl-2 text-sm text-gray-800">
      {source.split('\n').map((line, i) => {
        if (line.startsWith('## '))
          return <h2 key={i} className="mb-1 text-base font-semibold">{line.slice(3)}</h2>
        return <p key={i} className="text-[13px] text-gray-600">{line}</p>
      })}
    </div>
  )
}

function CodeCell({
  execCount,
  source,
  output,
  active,
}: {
  execCount: number | null
  source: string
  output: string | null
  active?: boolean
}) {
  return (
    <div className={`mb-2 rounded border ${active ? 'border-[#635ADC]' : 'border-gray-200'}`}>
      <div className="flex">
        <div className="flex w-12 shrink-0 items-start justify-end pr-2 pt-2">
          <span className="font-mono text-xs text-[#635ADC]">
            [{execCount ?? ' '}]:
          </span>
        </div>
        <pre className="flex-1 overflow-auto bg-[#f7f7f7] px-3 py-2 font-mono text-[12px] leading-relaxed text-gray-800">
          {source}
        </pre>
      </div>
      {output && (
        <div className="flex border-t border-gray-100">
          <div className="w-12 shrink-0" />
          <div className="flex-1 bg-white px-3 py-1.5 font-mono text-[12px] text-gray-700">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExtensionPage() {
  const [mounted, setMounted] = useState(false)
  const [cells, setCells] = useState<NotebookCell[]>(INITIAL_CELLS)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type !== 'QUREKA_INSERT_CIRCUIT') return
      const { code } = e.data as { code: string; format: string }
      setCells((prev) =>
        prev.map((cell) =>
          cell.id === 'c3' && cell.type === 'code'
            ? { ...cell, source: code, output: null }
            : cell
        )
      )
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

      {/* ── Jupyter 최상단 메뉴바 (전체 폭) ── */}
      <div className="flex shrink-0 items-center gap-4 border-b border-gray-300 bg-[#f8f8f8] px-3 py-1">
        <span className="text-[13px] font-semibold text-[#635ADC]">◈ Jupyter</span>
        {['File', 'Edit', 'View', 'Run', 'Kernel', 'Settings', 'Help'].map((item) => (
          <button key={item} type="button" className="text-[12px] text-gray-600 hover:text-gray-900">
            {item}
          </button>
        ))}
      </div>

      {/* ── 메뉴바 아래 본문 영역 ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── Jupyter Lab LNB 아이콘 스트립 ── */}
        <div className="flex w-10 shrink-0 flex-col items-center border-r border-gray-300 bg-[#f0f0f0] py-1">
          {LNB_ICONS.map((item) => (
            <div
              key={item.title}
              title={item.title}
              className={`relative flex h-10 w-full cursor-pointer items-center justify-center text-base ${
                item.active
                  ? 'bg-white text-[#635ADC]'
                  : 'text-gray-500 hover:bg-[#e8e8e8] hover:text-gray-700'
              }`}
            >
              {/* 활성 아이콘 좌측 파란 강조선 */}
              {item.active && (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-[#635ADC]" />
              )}
              <span className="text-[15px]">{item.icon}</span>
            </div>
          ))}
        </div>

        {/* ── Quda AI 패널 (LNB 챗봇 클릭으로 열린 형태) ── */}
        <div className="flex w-72 shrink-0 flex-col border-r border-gray-300 bg-white">
          <CircuitBuilder variant="panel" />
        </div>

        {/* ── Jupyter Notebook 메인 영역 ── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f5]">

          {/* 탭 바 */}
          <div className="flex shrink-0 items-end border-b border-gray-300 bg-[#eeeeee] px-2 pt-1">
            <div className="-mb-px flex items-center gap-1.5 rounded-t-sm border border-b-0 border-gray-300 bg-white px-3 py-1.5">
              <span className="text-[12px] text-gray-700">qureka_coda_demo.ipynb</span>
              <span className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">×</span>
            </div>
          </div>

          {/* 툴바 */}
          <div className="flex shrink-0 items-center gap-1 border-b border-gray-200 bg-white px-3 py-1">
            {['💾', '➕', '✂️', '📋', '▶'].map((icon, i) => (
              <button key={i} type="button" className="rounded px-2 py-0.5 text-[13px] text-gray-600 hover:bg-gray-100">
                {icon}
              </button>
            ))}
            <div className="mx-2 h-4 w-px bg-gray-300" />
            <select className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-700">
              <option>Code</option>
              <option>Markdown</option>
            </select>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500">Python 3 (ipykernel)</span>
              <span className="h-2 w-2 rounded-full bg-[#635ADC]" />
            </div>
          </div>

          {/* 노트북 셀 목록 */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="mx-auto max-w-3xl">
              {cells.map((cell, i) => (
                <div key={cell.id} className="mb-2">
                  {cell.type === 'markdown' ? (
                    <div className="rounded border border-gray-200 bg-white px-4 py-3">
                      <MarkdownCell source={cell.source} />
                    </div>
                  ) : (
                    <CodeCell
                      execCount={cell.execCount}
                      source={cell.source}
                      output={cell.output ?? null}
                      active={i === cells.length - 1}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
