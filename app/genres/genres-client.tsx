'use client';

import Header from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

// Genre data defined locally for client component
const GENRES = [
  { name: 'Fiction', color: 'from-blue-500 to-cyan-500', icon: '📖', description: 'Thought-provoking fiction reviews', keywords: 'fiction books, novels, literary fiction, contemporary fiction' },
  { name: 'Mystery', color: 'from-purple-500 to-pink-500', icon: '🔍', description: 'Gripping mystery and thriller reviews', keywords: 'mystery books, thriller, whodunit, crime fiction' },
  { name: 'Romance', color: 'from-rose-500 to-pink-500', icon: '💕', description: 'Heartwarming romance book reviews', keywords: 'romance books, love stories, contemporary romance, romantic fiction' },
  { name: 'Science Fiction', color: 'from-cyan-500 to-blue-500', icon: '🚀', description: 'Mind-bending sci-fi reviews', keywords: 'science fiction books, sci-fi, dystopian, space opera' },
  { name: 'Fantasy', color: 'from-purple-500 to-violet-500', icon: '✨', description: 'Enchanting fantasy book reviews', keywords: 'fantasy books, magic, epic fantasy, YA fantasy' },
  { name: 'Non-Fiction', color: 'from-amber-500 to-orange-500', icon: '📚', description: 'Insightful non-fiction reviews', keywords: 'non-fiction books, memoirs, essays, informational books' },
  { name: 'Biography', color: 'from-green-500 to-emerald-500', icon: '👤', description: 'Compelling biography reviews', keywords: 'biography books, memoirs, autobiography, life stories' },
  { name: 'History', color: 'from-orange-500 to-red-500', icon: '🏛️', description: 'Fascinating history reviews', keywords: 'history books, historical non-fiction, world history, indian history' },
  { name: 'Self-Help', color: 'from-yellow-500 to-amber-500', icon: '🌱', description: 'Transformative self-help reviews', keywords: 'self-help books, personal development, self-improvement, motivation' },
  { name: 'Poetry', color: 'from-indigo-500 to-purple-500', icon: '✍️', description: 'Beautiful poetry collection reviews', keywords: 'poetry books, poems, verse, literary poetry' },
];

export default function GenresPageClient() {
  return (
    <>
      {/* JSON-LD Structured Data for Genre Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Book Reviews by Genre',
            description: 'Explore our collection of book reviews organized by genre. Find the best fiction, mystery, romance, sci-fi, fantasy, non-fiction, biography, history, self-help, and poetry book reviews.',
            url: 'https://girlwholiketoreadbooks.in/genres',
            publisher: {
              '@type': 'Organization',
              name: 'girlwholiketoreadbooks',
              url: 'https://girlwholiketoreadbooks.in',
            },
            about: GENRES.map(genre => ({
              '@type': 'Thing',
              name: genre.name,
              description: genre.description,
            })),
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: GENRES.map((genre, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: genre.name,
                url: `https://girlwholiketoreadbooks.in/browse?genre=${encodeURIComponent(genre.name)}`,
              })),
            },
          }),
        }}
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Explore by Genre</h1>
            <p className="text-lg text-muted-foreground">
              Discover thoughtful reviews across different literary genres and find your next great read.
            </p>
          </div>

          {/* Genres Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GENRES.map((genre) => (
              <Link key={genre.name} href={`/browse?genre=${encodeURIComponent(genre.name)}`}>
                <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer h-full group">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{genre.icon}</div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition">
                      {genre.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Browse all {genre.name.toLowerCase()} reviews
                    </p>
                    <Button
                      variant="ghost"
                      className="text-primary hover:bg-secondary p-0 h-auto"
                    >
                      Explore →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
