import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    default: 'Browse Book Reviews - Find Your Next Great Read | girlwholiketoreadbooks',
    template: '%s | girlwholiketoreadbooks'
  },
  description: 'Browse our extensive collection of honest book reviews. Filter by genre, search by title or author, and discover your next favorite book today.',
  keywords: [
    'browse book reviews',
    'book review search',
    'find book reviews',
    'book recommendations',
    'read reviews',
    'book database',
    'review database',
    'literary reviews'
  ],
  authors: [{ name: 'girlwholiketoreadbooks' }],
  creator: 'girlwholiketoreadbooks',
  publisher: 'girlwholiketoreadbooks',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://girlwholiketoreadbooks.in/browse',
    siteName: 'girlwholiketoreadbooks',
    title: 'Browse Book Reviews - Find Your Next Great Read',
    description: 'Browse our extensive collection of honest book reviews. Filter by genre, search by title or author.',
    images: [
      {
        url: '/book-reading.jpeg',
        width: 1200,
        height: 630,
        alt: 'Browse book reviews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Book Reviews - girlwholiketoreadbooks',
    description: 'Browse our extensive collection of honest book reviews and find your next favorite read.',
    images: ['/book-reading.jpeg'],
  },
  alternates: {
    canonical: 'https://girlwholiketoreadbooks.in/browse',
  },
  category: 'Books & Literature',
};

const GENRES = [
  'Fiction',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Non-Fiction',
  'Biography',
  'History',
  'Self-Help',
  'Poetry',
];

interface Post {
  id: string;
  title: string;
  author: string;
  bookCover?: string;
  rating: number;
  review: string;
  genre: string;
  userId: string;
  userName?: string;
  comments: number;
  likes: number;
  createdAt: Date | string;
  getYourBookLink?: string;
  publishedYear?: string;
}

interface BrowsePageProps {
  searchParams: Promise<{ 
    genre?: string; 
    search?: string;
    sortBy?: 'latest' | 'popular';
  }>;
}

async function getPosts(sortBy: 'latest' | 'popular' = 'latest'): Promise<Post[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const response = await fetch(`${baseUrl}/api/posts/get?limit=100&sortBy=${sortBy}`, {
      cache: 'no-store'
    });
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

function BrowseSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-64 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
        </div>
      ))}
    </div>
  );
}

function GenreFilter({ selectedGenre }: { selectedGenre: string | null }) {
  return (
    <nav className="mb-8" aria-label="Genre filters">
      <h3 className="font-serif font-bold text-foreground mb-4">Filter by Genre</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedGenre === null ? 'default' : 'outline'}
          className={`${
            selectedGenre === null
              ? 'bg-primary text-primary-foreground'
              : 'border-border text-foreground hover:bg-secondary'
          }`}
          asChild
        >
          <a href="/browse">All Genres</a>
        </Button>
        {GENRES.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? 'default' : 'outline'}
            className={`${
              selectedGenre === genre
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:bg-secondary'
            }`}
            asChild
          >
            <a href={`/browse?genre=${encodeURIComponent(genre)}`}>{genre}</a>
          </Button>
        ))}
      </div>
    </nav>
  );
}

function SortFilter({ sortBy }: { sortBy: string }) {
  return (
    <div className="mb-8">
      <h3 className="font-serif font-bold text-foreground mb-4">Sort Reviews</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortBy === 'latest' ? 'default' : 'outline'}
          className={`${
            sortBy === 'latest'
              ? 'bg-primary text-primary-foreground'
              : 'border-border text-foreground hover:bg-secondary'
          }`}
          asChild
        >
          <a href="/browse?sortBy=latest">Latest First</a>
        </Button>
        <Button
          variant={sortBy === 'popular' ? 'default' : 'outline'}
          className={`${
            sortBy === 'popular'
              ? 'bg-primary text-primary-foreground'
              : 'border-border text-foreground hover:bg-secondary'
          }`}
          asChild
        >
          <a href="/browse?sortBy=popular">Most Popular</a>
        </Button>
      </div>
    </div>
  );
}

async function BrowseContent({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const selectedGenre = params.genre || null;
  const searchTerm = params.search || '';
  const sortBy = params.sortBy || 'latest';

  const posts = await getPosts(sortBy as 'latest' | 'popular');
  
  // Filter posts
  let filteredPosts = posts;
  
  if (selectedGenre) {
    filteredPosts = filteredPosts.filter((post) => post.genre === selectedGenre);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(term) ||
        post.author.toLowerCase().includes(term) ||
        post.review.toLowerCase().includes(term)
    );
  }

  const pageTitle = selectedGenre 
    ? `${selectedGenre} Book Reviews` 
    : searchTerm 
      ? `Search Results for "${searchTerm}"`
      : 'All Book Reviews';

  return (
    <>
      {/* Search Bar */}
      <section className="px-4 md:px-8 py-8 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <form action="/browse" method="GET" className="relative mb-6">
            {selectedGenre && <input type="hidden" name="genre" value={selectedGenre} />}
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" aria-hidden="true" />
            <Input
              type="text"
              name="search"
              placeholder="Search books, authors, or reviews..."
              defaultValue={searchTerm}
              className="pl-12 bg-background border-border text-foreground placeholder-muted-foreground"
              aria-label="Search books, authors, or reviews"
            />
          </form>
        </div>
      </section>

      <div className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <GenreFilter selectedGenre={selectedGenre} />
              <SortFilter sortBy={sortBy} />
            </aside>

            {/* Reviews Grid */}
            <main className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-8">{pageTitle}</h1>
              
              {filteredPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6" role="list" aria-label="Book reviews">
                  {filteredPosts.map((post) => (
                    <ReviewCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      author={post.author}
                      bookCover={post.bookCover}
                      rating={post.rating}
                      review={post.review}
                      genre={post.genre}
                      userName={post.userName || 'Anonymous'}
                      comments={post.comments}
                      likes={post.likes}
                      createdAt={post.createdAt}

                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg mb-2">No reviews found</p>
                  <p className="text-muted-foreground mb-6">
                    {selectedGenre 
                      ? `No reviews found in the ${selectedGenre} genre.` 
                      : searchTerm 
                        ? `No results found for "${searchTerm}". Try a different search term.`
                        : 'No reviews available at the moment.'}
                  </p>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary bg-transparent"
                    asChild
                  >
                    <a href="/browse">Clear Filters</a>
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default function BrowsePage({ searchParams }: BrowsePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseContent searchParams={searchParams} />
      </Suspense>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} girlwholiketoreadbooks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
