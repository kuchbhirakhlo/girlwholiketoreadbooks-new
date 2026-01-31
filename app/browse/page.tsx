'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

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
}

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

export default function BrowsePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/posts/get?limit=100&sortBy=${sortBy}`);
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sortBy]);

  useEffect(() => {
    let filtered = posts;

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter((post) => post.genre === selectedGenre);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.author.toLowerCase().includes(term) ||
          post.review.toLowerCase().includes(term)
      );
    }

    setFilteredPosts(filtered);
  }, [posts, selectedGenre, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Search Bar */}
      <section className="px-4 md:px-8 py-8 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search books, authors, or reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-background border-border text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              {/* Genre Filter */}
              <div className="mb-8">
                <h3 className="font-serif font-bold text-foreground mb-4">Genres</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedGenre === null ? 'default' : 'outline'}
                    className={`w-full justify-start ${
                      selectedGenre === null
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedGenre(null)}
                  >
                    All Genres
                  </Button>
                  {GENRES.map((genre) => (
                    <Button
                      key={genre}
                      variant={selectedGenre === genre ? 'default' : 'outline'}
                      className={`w-full justify-start ${
                        selectedGenre === genre
                          ? 'bg-primary text-primary-foreground'
                          : 'border-border text-foreground hover:bg-secondary'
                      }`}
                      onClick={() => setSelectedGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <h3 className="font-serif font-bold text-foreground mb-4">Sort By</h3>
                <div className="space-y-2">
                  <Button
                    variant={sortBy === 'latest' ? 'default' : 'outline'}
                    className={`w-full justify-start ${
                      sortBy === 'latest'
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-secondary'
                    }`}
                    onClick={() => setSortBy('latest')}
                  >
                    Latest
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    className={`w-full justify-start ${
                      sortBy === 'popular'
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-secondary'
                    }`}
                    onClick={() => setSortBy('popular')}
                  >
                    Most Popular
                  </Button>
                </div>
              </div>
            </aside>

            {/* Reviews Grid */}
            <main className="flex-1">
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-64 w-full bg-muted" />
                      <Skeleton className="h-4 w-3/4 bg-muted" />
                      <Skeleton className="h-4 w-1/2 bg-muted" />
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
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
                  <p className="text-muted-foreground text-lg">No reviews found</p>
                  <p className="text-muted-foreground mb-6">Try adjusting your search filters</p>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary bg-transparent"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedGenre(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
