import { Metadata } from 'next';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import Link from 'next/link';
import { BookOpen, Users, Star, TrendingUp, Book, Heart, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    default: 'girlwholiketoreadbooks - Discover Thoughtful Book Reviews & Literary Critiques',
    template: '%s | girlwholiketoreadbooks'
  },
  description: 'Explore curated book reviews, connect with fellow readers, and discover your next great read. Join our community of passionate book lovers sharing honest literary critiques.',
  keywords: [
    'book reviews',
    'literary reviews',
    'book recommendations',
    'reading community',
    'book blog',
    'book critique',
    'novel reviews',
    'fiction reviews',
    'book lover community'
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
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://girlwholiketoreadbooks.com/',
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
    canonical: 'https://girlwholiketoreadbooks.com/',
  },
  category: 'Books & Literature',
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

export default async function HomePage() {
  // Fetch posts for featured reviews
  let posts: Post[] = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/posts/get?limit=6&sortBy=latest`, {
      cache: 'no-store'
    });
    const data = await response.json();
    posts = data.posts || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  // JSON-LD Structured Data for Organization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'girlwholiketoreadbooks',
    url: 'https://girlwholiketoreadbooks.com/',
    description: 'Discover thoughtful book reviews and connect with fellow readers.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://girlwholiketoreadbooks.com/browse?search={search_term}'
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
        item: 'https://girlwholiketoreadbooks.com/'
      }
    ]
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

      <Header />

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
              <Link href="/editor/new">
                <span className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                  Write a Review
                </span>
              </Link>
            </div>
          </div>
          <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="/book-reading.jpeg" 
              alt="Person reading a book in a cozy setting - discover your next favorite read"
              className="w-full h-full object-cover"
              width="600"
              height="500"
              loading="eager"
              fetchPriority="high"
            />
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
            <h3 className="text-3xl font-bold text-foreground mb-1">500+</h3>
            <p className="text-muted-foreground">Book Reviews</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Users className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">2K+</h3>
            <p className="text-muted-foreground">Active Readers</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Star className="w-8 h-8 text-accent" aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">4.8</h3>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">50+</h3>
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

      {/* Featured Genres */}
      <section className="px-4 md:px-8 py-16 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4 text-center">Explore Books by Genre</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover books across your favorite genres. From thrilling mysteries to heartwarming romances, 
            find your next great read among our carefully curated reviews.
          </p>
          <nav className="grid md:grid-cols-4 gap-4" aria-label="Browse by genre">
            {[
              { name: 'Fiction', count: 120, color: 'bg-blue-100 text-blue-800' },
              { name: 'Mystery', count: 85, color: 'bg-gray-100 text-gray-800' },
              { name: 'Romance', count: 72, color: 'bg-pink-100 text-pink-800' },
              { name: 'Science Fiction', count: 64, color: 'bg-purple-100 text-purple-800' },
              { name: 'Fantasy', count: 95, color: 'bg-indigo-100 text-indigo-800' },
              { name: 'Biography', count: 48, color: 'bg-amber-100 text-amber-800' },
              { name: 'Self-Help', count: 56, color: 'bg-green-100 text-green-800' },
              { name: 'Thriller', count: 89, color: 'bg-red-100 text-red-800' },
            ].map((genre) => (
              <Link 
                key={genre.name} 
                href={`/browse?genre=${encodeURIComponent(genre.name)}`}
                className="p-6 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition group"
              >
                <h3 className="font-semibold text-foreground group-hover:text-primary transition">{genre.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{genre.count} reviews</p>
              </Link>
            ))}
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

      {/* Newsletter Section */}
      <section className="px-4 md:px-8 py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Stay Updated with New Book Reviews</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg leading-relaxed">
            Subscribe to our newsletter and get the latest book reviews delivered straight to your inbox. 
            Be the first to discover new releases and hidden gems.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" action="#" method="POST">
            <input 
              type="email" 
              name="email"
              placeholder="Enter your email" 
              aria-label="Email address for newsletter subscription"
              className="flex-1 px-4 py-3 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground"
              required
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-primary-foreground/60 mt-4">
            We respect your privacy. Unsubscribe at any time.
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
