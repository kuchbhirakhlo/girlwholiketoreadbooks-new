'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { BookOpen, Users, Star, TrendingUp, Book, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [envReady, setEnvReady] = useState(true);

  useEffect(() => {
    // Check if Firebase env vars are available
    const firebaseReady = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
    
    if (!firebaseReady) {
      setEnvReady(false);
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts/get?limit=6&sortBy=latest');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (!envReady) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">Setup Required</h2>
            <p className="text-amber-800 mb-4">
              Please add your Firebase environment variables to get started. Click "Vars" in the left sidebar to configure them.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Full Image */}
      <section className="relative px-4 md:px-8 py-16 md:py-24 border-b border-border overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Discover Thoughtful Book Reviews
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Explore curated literary critiques, connect with fellow readers, and discover your next great read. Join our community of book lovers today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/browse">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Browse Reviews
                </Button>
              </Link>
              {user && (
                <Link href="/editor/new">
                  <Button size="lg" variant="outline">
                    Write a Review
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="/book-reading.jpeg" 
              alt="Person reading a book" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-8 py-16 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">500+</h3>
            <p className="text-muted-foreground">Book Reviews</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">2K+</h3>
            <p className="text-muted-foreground">Active Readers</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Star className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">4.8</h3>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-primary" />
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
            <h2 className="font-serif text-3xl font-bold text-foreground">Latest Reviews</h2>
            <Link href="/browse">
              <Button variant="ghost" className="text-primary hover:bg-secondary">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-64 w-full bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
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
                  getYourBookLink={post.getYourBookLink}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No reviews yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Genres */}
      <section className="px-4 md:px-8 py-16 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4 text-center">Explore by Genre</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Discover books across your favorite genres. From thrilling mysteries to heartwarming romances, find your next great read.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
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
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-6">About girlwholiketoreadbooks</h2>
          <p className="text-lg text-muted-foreground mb-8">
            girlwholiketoreadbooks is your trusted destination for honest, thoughtful book reviews. Our community of passionate readers shares their genuine opinions to help you discover your next favorite book.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-secondary/30">
              <Book className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Quality Content</h3>
              <p className="text-sm text-muted-foreground">Detailed, thoughtful reviews that go beyond surface-level summaries.</p>
            </div>
            <div className="p-6 rounded-lg bg-secondary/30">
              <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">Built by readers, for readers. Join thousands of book lovers.</p>
            </div>
            <div className="p-6 rounded-lg bg-secondary/30">
              <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Open Discussion</h3>
              <p className="text-sm text-muted-foreground">Engage with reviewers and share your own perspectives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-4 md:px-8 py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Stay Updated with New Reviews</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Subscribe to our newsletter and get the latest book reviews delivered straight to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground"
            />
            <Button size="lg" variant="secondary" className="text-foreground font-semibold">
              Subscribe
            </Button>
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
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif font-bold text-foreground mb-4">girlwholiketoreadbooks</h3>
              <p className="text-sm text-muted-foreground">Discover thoughtful book reviews from readers worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="text-muted-foreground hover:text-primary transition">Browse</Link></li>
                <li><Link href="/genres" className="text-muted-foreground hover:text-primary transition">Genres</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition">Contact for Review</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Guidelines</a></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 girlwholiketoreadbooks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
