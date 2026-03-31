import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Book Reviews by Genre | girlwholiketoreadbooks',
  description: 'Explore our collection of book reviews organized by genre. Find the best fiction, mystery, romance, sci-fi, fantasy, non-fiction, biography, history, self-help, and poetry book reviews.',
  keywords: [
    'book reviews by genre',
    'fiction book reviews',
    'mystery book reviews',
    'romance book reviews',
    'science fiction book reviews',
    'fantasy book reviews',
    'non-fiction book reviews',
    'biography book reviews',
    'history book reviews',
    'self-help book reviews',
    'poetry book reviews',
    'book recommendations by genre',
    'best books by genre',
    'book reviews and ratings',
    'literary book blog',
    'book reading community',
    'girl who likes to read books',
    'priya singh book reviews',
    'indian book blogger',
    'book review website'
  ],
  authors: [{ name: 'Priya Singh', url: 'https://www.instagram.com/girlwholiketoreadbooks' }],
  creator: 'girlwholiketoreadbooks',
  publisher: 'girlwholiketoreadbooks',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://girlwholiketoreadbooks.in/genres',
    siteName: 'girlwholiketoreadbooks',
    title: 'Browse Book Reviews by Genre | girlwholiketoreadbooks',
    description: 'Explore our collection of book reviews organized by genre. Find the best fiction, mystery, romance, sci-fi, fantasy, non-fiction, biography, history, self-help, and poetry book reviews.',
    images: [
      {
        url: '/book-reading.jpeg',
        width: 1200,
        height: 630,
        alt: 'Book Reviews by Genre - girlwholiketoreadbooks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Book Reviews by Genre | girlwholiketoreadbooks',
    description: 'Explore our collection of book reviews organized by genre.',
    images: ['/book-reading.jpeg'],
    creator: '@girlwholiketoreadbooks',
  },
  alternates: {
    canonical: 'https://girlwholiketoreadbooks.in/genres',
  },
  category: 'books',
  classification: 'Book Reviews and Recommendations',
};

import GenresPageClient from './genres-client';

export default function GenresPage() {
  return <GenresPageClient />;
}
