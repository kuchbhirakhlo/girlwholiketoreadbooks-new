'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';

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

interface Favorite {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date | string;
}

export default function MyListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          // Fetch all posts
          const postsRes = await fetch('/api/posts/get?limit=1000');
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);

          // Fetch user's favorites
          const favRes = await fetch(`/api/favorites?userId=${user.uid}`);
          const favData = await favRes.json();
          setFavorites(favData.favorites || []);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user, authLoading, router]);

  const favoritePostIds = new Set(favorites.map((f) => f.postId));
  const favoritePostsArray = posts.filter((p) => favoritePostIds.has(p.id));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <Skeleton className="h-32 w-full bg-muted mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="w-8 h-8 text-primary" />
            <h1 className="font-serif text-4xl font-bold text-foreground">My Reading List</h1>
          </div>
          <p className="text-muted-foreground">
            {favoritePostsArray.length} {favoritePostsArray.length === 1 ? 'review' : 'reviews'} saved
          </p>
        </div>

        {/* Reviews Grid */}
        {favoritePostsArray.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {favoritePostsArray.map((post) => (
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
          <Card className="bg-card border-border">
            <CardContent className="py-12">
              <div className="text-center">
                <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Your reading list is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add reviews to your list to keep track of books you want to read or have enjoyed.
                </p>
                <Link href="/browse">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Explore Reviews
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
