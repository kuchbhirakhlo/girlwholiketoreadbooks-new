import React from "react"
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from 'next-themes'
import { FirebaseProvider } from '@/components/firebase-provider'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'girlwholiketoreadbooks',
  description: 'A curated collection of thoughtful book reviews and literary insights for readers of all genres.',
  generator: 'v0.app',
  keywords: ['book reviews', 'reading', 'literature', 'book recommendations', 'book blog', 'book recommendations', 'reading community'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'girlwholiketoreadbooks',
    description: 'A curated collection of thoughtful book reviews and literary insights',
    type: 'website',
    siteName: 'girlwholiketoreadbooks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'girlwholiketoreadbooks',
    description: 'A curated collection of thoughtful book reviews and literary insights',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <FirebaseProvider>
            {children}
          </FirebaseProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
