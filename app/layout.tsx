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
  keywords: [
    'book reviews', 'reading', 'literature', 'book recommendations', 'book blog', 
    'reading community', 'book recommendations 2024', 'book reviews 2024', 'best books', 
    'book club', 'book discussion', 'novel reviews', 'fiction reviews', 'non-fiction books',
    'bestselling books', 'new releases', 'book ratings', 'reading list', 'what to read',
    'book genre reviews', 'mystery books', 'thriller books', 'romance books', 'fantasy books',
    'sci-fi books', 'horror books', 'biography books', 'self-help books', 'history books',
    'classic literature', 'contemporary fiction', 'young adult books', 'children books',
    'audiobook reviews', 'ebook recommendations', 'indie books', 'debut novels',
    'award winning books', 'book awards', 'book influencers', 'booktubers', 'bookstagram',
    'reading challenges', 'bookish', 'literary fiction', 'page turner', 'must read',
  ],
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
