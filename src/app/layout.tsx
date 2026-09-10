import type { Metadata } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/layout/theme-provider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
})

export const metadata: Metadata = {
  title: 'ProjectHub',
  description: 'Feedbacks, newsletters et analytics de vos projets',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}
      >
        <ThemeProvider>
          <NextTopLoader color="#eb6834" showSpinner={false} height={2} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
