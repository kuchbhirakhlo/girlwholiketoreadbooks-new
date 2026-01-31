'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import ReviewCard from '@/components/review-card';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user) {
      const fetchUserPosts = async () => {
        try {
          const response = await fetch(`/api/posts/get?userId=${user.uid}`);
          const data = await response.json();
          setUserPosts(data.posts || []);
        } catch (error) {
          console.error('Error fetching user posts:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserPosts();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <Skeleton className="h-32 w-full bg-muted mb-8" />
          <Skeleton className="h-12 w-1/3 bg-muted mb-8" />
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
        {/* Profile Header */}
        <Card className="bg-card border-border mb-12">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-primary-foreground">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                  {user.displayName || user.email?.split('@')[0] || 'Anonymous'}
                </h1>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold text-foreground">{userPosts.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {userPosts.reduce((sum, post) => sum + post.likes, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Comments</p>
                    <p className="text-2xl font-bold text-foreground">
                      {userPosts.reduce((sum, post) => sum + post.comments, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/editor">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Write New Review
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* User Reviews */}
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8">My Reviews</h2>

          {userPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {userPosts.map((post) => (
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
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4 text-lg">You haven't written any reviews yet</p>
                <p className="text-muted-foreground mb-8">Start sharing your thoughts on books you've read!</p>
                <Link href="/editor">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Write Your First Review
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
