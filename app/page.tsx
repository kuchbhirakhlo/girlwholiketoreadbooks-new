import { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import PageViewTracker from '@/components/page-view-tracker';
import Link from 'next/link';
import { BookOpen, Users, Star, TrendingUp, Book, Heart, MessageSquare, Award, Zap, Globe } from 'lucide-react';

// Force dynamic rendering since we fetch posts on each request
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'girlwholiketoreadbooks - Discover Thoughtful Book Reviews, Literary Critiques & Reading Community',
    template: '%s | girlwholiketoreadbooks'
  },
  description: 'Explore curated book reviews, connect with fellow readers, and discover your next great read. Join our community of passionate book lovers sharing honest literary critiques, author interviews, and reading recommendations.',
  keywords: [
    'book reviews',
    'literary reviews',
    'book recommendations',
    'reading community',
    'book blog',
    'book critique',
    'novel reviews',
    'fiction reviews',
    'book lover community',
    'book rating',
    'author interviews',
    'reading tips',
    'book club',
    'literary discussion',
    'book analysis',
    'book summary',
    'reading journey',
    'book enthusiast',
    'bibliophile',
    'book recommendations 2024',
    'best book reviews',
    'honest book reviews',
    'detailed book analysis',
    'book community online',
    'fiction book reviews',
    'romance book reviews',
    'mystery book reviews',
    'fantasy book reviews',
    'sci-fi book reviews',
    'thriller book reviews'
  ],
  authors: [{ name: 'girlwholiketoreadbooks' }],
  creator: 'girlwholiketoreadbooks',
  publisher: 'girlwholiketoreadbooks',
  robots: {
    index: true,
    follow: true,
    notranslate: true,
    nosnippet: false,
    noimageindex: false,
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
    url: 'https://girlwholiketoreadbooks.in/',
    siteName: 'girlwholiketoreadbooks',
    title: 'girlwholiketoreadbooks - Discover Thoughtful Book Reviews & Literary Critiques',
    description: 'Explore curated book reviews, connect with fellow readers, and discover your next great read.',
    images: [
      {
        url: '/book-reading.jpeg',
        width: 1200,
        height: 630,
        alt: 'Person reading a book',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'girlwholiketoreadbooks - Discover Thoughtful Book Reviews',
    description: 'Explore curated book reviews, connect with fellow readers, and discover your next great read.',
    images: ['/book-reading.jpeg'],
    creator: '@girlwholiketoreadbooks',
  },
  alternates: {
    canonical: 'https://girlwholiketoreadbooks.in/',
  },
  category: 'Books & Literature',
  other: {
    'p:domain_verify': 'your-pinterest-domain-verify-code',
    'rating': 'general',
    'language': 'en',
  },
};

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

interface HomeStats {
  totalReviews: number;
  activeUsers: number;
  averageRating: string;
  totalGenres: number;
  topGenres: { name: string; count: number }[];
}

export default async function HomePage() {
  // Fetch posts for featured reviews
  let posts: Post[] = [];
  let stats: HomeStats = {
    totalReviews: 0,
    activeUsers: 0,
    averageRating: '4.9',
    totalGenres: 0,
    topGenres: [],
  };
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    // Fetch posts for featured reviews
    const response = await fetch(`${baseUrl}/api/posts/get?limit=6&sortBy=latest`, {
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      posts = data.posts || [];
    }
    
    // Fetch homepage stats
    const statsResponse = await fetch(`${baseUrl}/api/stats/home`, {
      cache: 'no-store'
    });
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      stats = statsData.stats || stats;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Use default stats values on error
  }

  // JSON-LD Structured Data for Organization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'girlwholiketoreadbooks',
    url: 'https://girlwholiketoreadbooks.in/',
    description: 'Discover thoughtful book reviews and connect with fellow readers.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://girlwholiketoreadbooks.in/browse?search={search_term}'
      },
      'query-input': 'required name=search_term'
    }
  };

  // JSON-LD for BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://girlwholiketoreadbooks.in/'
      }
    ]
  };

  // JSON-LD for Organization
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'girlwholiketoreadbooks',
    url: 'https://girlwholiketoreadbooks.in/',
    logo: 'https://girlwholiketoreadbooks.in/favicon.ico',
    sameAs: [
      'https://www.instagram.com/girlwholiketoreadbooks',
      'https://www.goodreads.com/girlwholiketoreadbooks',
      'https://www.threads.net/@girlwholiketoreadbooks',
      'https://x.com/gwltoreadbooks'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: 'https://girlwholiketoreadbooks.in/contact'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <Header />
      <PageViewTracker />

      {/* Hero Section with Full Image */}
      <section className="relative px-4 md:px-8 py-16 md:py-24 border-b border-border overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Discover Thoughtful Book Reviews
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-balance leading-relaxed">
              Explore curated literary critiques, connect with fellow readers, and discover your next great read. 
              Join our community of book lovers who share honest, in-depth reviews that help you make informed reading choices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/browse">
                <span className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                  Browse Reviews
                </span>
              </Link>
            </div>
          </div>
          <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="/book-reading.jpeg"
              alt="Person reading a book in a cozy setting - discover your next favorite read"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              style={{ objectFit: 'cover' }}
              className="object-cover"
              priority={true}
            />
            {/* Social Media Links */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex justify-center gap-4">
                <a 
                  href="https://www.instagram.com/girlwholiketoreadbooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  title="Follow us on Instagram"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.goodreads.com/girlwholiketoreadbooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  title="Follow us on Goodreads"
                  aria-label="Goodreads"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.01 2.625c-1.196-.003-2.427.264-3.535.77-2.22 1.015-3.83 3.025-4.44 5.37-.153.588-.2 1.19-.14 1.795-.596-.135-1.168-.14-1.695-.01-.88.217-1.58.61-2.065 1.12-.493.518-.7 1.137-.615 1.78.11.825.58 1.51 1.305 1.9.35.188.735.31 1.13.36.218-1.028.52-2.01 1.02-2.9.32-.57.7-1.06 1.225-1.445.215-.157.45-.285.705-.38.135.78.37 1.515.735 2.18.53.965 1.27 1.78 2.28 2.395.945.578 2.015.87 3.107.845 1.093-.025 2.14-.37 3.045-1.005.88-.617 1.53-1.45 1.875-2.41.11-.31.18-.63.21-.955.06-.65-.01-1.31-.2-1.96-.32-1.08-.96-2.01-1.8-2.61-.88-.63-1.92-.93-3-.87-1.08.05-2.07.51-2.8 1.31-.71.78-1.08 1.79-1.05 2.86.01.28.04.56.08.83-.19.06-.385.11-.585.14-.66.11-1.305-.06-1.84-.48-.535-.42-.86-1.01-.93-1.68-.02-.19-.02-.38-.01-.57.05-.6.31-1.15.73-1.55.88-.84 2.11-1.29 3.35-1.225.615.03 1.22.18 1.78.44.18-.53.27-1.09.27-1.66 0-2.76-2.24-5-5-5z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.threads.net/@girlwholiketoreadbooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  title="Follow us on Threads"
                  aria-label="Threads"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.177-3.507C2.35 18.44 1.5 15.586 1.461 12.01v-.02c.04-3.578.89-6.43 2.547-8.48 1.843-2.302 4.596-3.528 8.177-3.552h.02c2.413-.02 4.837.635 6.997 1.89 2.06 1.195 3.636 2.977 4.543 5.134l-2.2 1.267c-1.42-3.34-3.883-4.82-7.15-4.868-2.543-.036-4.893.65-6.437 1.879-1.19.946-1.902 2.303-2.057 3.918-.18 1.867.39 3.5 1.74 4.99 1.27 1.4 3.01 2.15 5.15 2.215 2.4.07 4.717-.75 6.19-2.187l1.843 1.74c-1.93 2.12-4.72 3.228-7.95 3.158v.002z"/>
                  </svg>
                </a>
                <a 
                  href="https://x.com/gwltoreadbooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  title="Follow us on X (Twitter)"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-8 py-16 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <BookOpen className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {stats.totalReviews > 0 ? `${stats.totalReviews}+` : '0'}
            </h3>
            <p className="text-muted-foreground">Book Reviews</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Users className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {stats.activeUsers > 0 ? `${(stats.activeUsers / 1000).toFixed(stats.activeUsers >= 1000 ? 1 : 0)}K+` : '0'}
            </h3>
            <p className="text-muted-foreground">Active Readers</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Star className="w-8 h-8 text-accent" aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{stats.averageRating}</h3>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {stats.totalGenres > 0 ? `${stats.totalGenres}+` : '0'}
            </h3>
            <p className="text-muted-foreground">Genres</p>
          </div>
        </div>
      </section>

      {/* Featured Reviews */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground">Latest Book Reviews</h2>
            <Link href="/browse">
              <span className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer">
                View All Reviews →
              </span>
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post) => (
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
              <p className="text-muted-foreground mb-4">No reviews yet. Check back soon for new literary critiques!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Book Reviews - SEO Section */}
      <section className="px-4 md:px-8 py-16 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4 text-center">Why Readers Trust Our Reviews</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto leading-relaxed">
            Our book reviews go beyond surface-level summaries to provide meaningful insights that help you choose your next great read.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <Award className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-semibold text-foreground mb-2">Honest Opinions</h3>
              <p className="text-sm text-muted-foreground">Unbiased, candid reviews that tell you what really works and what doesn't in each book.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <Zap className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-semibold text-foreground mb-2">Quick Insights</h3>
              <p className="text-sm text-muted-foreground">Get the essence of each book quickly with our concise yet comprehensive reviews.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <Globe className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-semibold text-foreground mb-2">Diverse Genres</h3>
              <p className="text-sm text-muted-foreground">From romance to thrillers, we cover a wide range of genres for every reader.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-semibold text-foreground mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">Join thousands of readers sharing their thoughts and recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Genres */}
      <section className="px-4 md:px-8 py-16 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4 text-center">Explore Books by Genre</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover books across your favorite genres. From thrilling mysteries to heartwarming romances, 
            find your next great read among our carefully curated reviews.
          </p>
          <nav className="grid md:grid-cols-4 gap-4" aria-label="Browse by genre">
            {stats.topGenres.length > 0 ? (
              stats.topGenres.map((genre) => (
                <Link 
                  key={genre.name} 
                  href={`/browse?genre=${encodeURIComponent(genre.name)}`}
                  className="p-6 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition">{genre.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{genre.count} reviews</p>
                </Link>
              ))
            ) : (
              // Fallback genres when no data available
              [
                { name: 'Fiction', count: 0 },
                { name: 'Mystery', count: 0 },
                { name: 'Romance', count: 0 },
                { name: 'Science Fiction', count: 0 },
                { name: 'Fantasy', count: 0 },
                { name: 'Biography', count: 0 },
                { name: 'Self-Help', count: 0 },
                { name: 'Thriller', count: 0 },
              ].map((genre) => (
                <Link 
                  key={genre.name} 
                  href={`/browse?genre=${encodeURIComponent(genre.name)}`}
                  className="p-6 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition">{genre.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{genre.count} reviews</p>
                </Link>
              ))
            )}
          </nav>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-6">About girlwholiketoreadbooks</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            girlwholiketoreadbooks is your trusted destination for honest, thoughtful book reviews. 
            Our community of passionate readers shares their genuine opinions to help you discover your next favorite book. 
            Whether you love fiction, non-fiction, mystery, romance, or any other genre, our detailed reviews provide 
            valuable insights to guide your reading journey.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-secondary/30">
              <Book className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-semibold text-foreground mb-2">Quality Content</h3>
              <p className="text-sm text-muted-foreground">Detailed, thoughtful reviews that go beyond surface-level summaries.</p>
            </div>
            <div className="p-6 rounded-lg bg-secondary/30">
              <Heart className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-semibold text-foreground mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">Built by readers, for readers. Join thousands of book lovers.</p>
            </div>
            <div className="p-6 rounded-lg bg-secondary/30">
              <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-semibold text-foreground mb-2">Open Discussion</h3>
              <p className="text-sm text-muted-foreground">Engage with reviewers and share your own perspectives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Our Readers Say - Testimonials Section */}
      <section className="px-4 md:px-8 py-16 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4 text-center">What Our Readers Say</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied readers who trust our reviews to discover their next favorite book.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-background border border-border">
              <p className="text-muted-foreground mb-4 italic">"This site helped me discover so many amazing books I never would have found otherwise. The reviews are detailed and honest!"</p>
              <p className="font-semibold text-foreground">- Sarah M., Book Enthusiast</p>
            </div>
            <div className="p-6 rounded-lg bg-background border border-border">
              <p className="text-muted-foreground mb-4 italic">"Finally, a book review site that gives you the real story behind each book. Highly recommended for anyone who loves reading!"</p>
              <p className="font-semibold text-foreground">- James R., Avid Reader</p>
            </div>
            <div className="p-6 rounded-lg bg-background border border-border">
              <p className="text-muted-foreground mb-4 italic">"The community here is amazing. I've connected with so many fellow readers who share my passion for great books."</p>
              <p className="font-semibold text-foreground">- Emily K., Book Club Organizer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-4 md:px-8 py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Stay Updated with New Book Reviews</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg leading-relaxed">
            Subscribe to our newsletter and get the latest book reviews delivered straight to your inbox. 
            Be the first to discover new releases and hidden gems.
          </p>
          <form 
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" 
            action="#" 
            method="POST"
            aria-label="Newsletter subscription form"
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input 
              id="newsletter-email"
              type="email" 
              name="email"
              placeholder="Enter your email address" 
              aria-label="Email address for newsletter subscription"
              className="flex-1 px-4 py-3 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground"
              required
              autoComplete="email"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-primary-foreground/60 mt-4">
            We respect your privacy. Your email will never be shared. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* AdSense Placeholder - Top of Footer */}
      <section className="px-4 md:px-8 py-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
            <div className="h-32 bg-secondary/50 rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Google AdSense Ad Unit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif font-bold text-foreground mb-4">girlwholiketoreadbooks</h3>
              <p className="text-sm text-muted-foreground">Discover thoughtful book reviews from readers worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="text-muted-foreground hover:text-primary transition">Browse All Reviews</Link></li>
                <li><Link href="/genres" className="text-muted-foreground hover:text-primary transition">Browse by Genre</Link></li>
                <li><Link href="/gallery" className="text-muted-foreground hover:text-primary transition">Book Gallery</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition">Contact for Review</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Review Guidelines</a></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} girlwholiketoreadbooks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
