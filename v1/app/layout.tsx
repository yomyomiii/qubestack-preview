import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { GNB } from '@/components/GNB'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'QubeStack 2.0 × Coda Preview',
  description: 'Conductor Quantum Coda integration preview',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full">
        <GNB />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </body>
    </html>
  )
}
