'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Post {
  id: string;
  rating: number;
  genre: string;
  createdAt: Date | string;
}

const COLORS = ['#1e40af', '#dc2626', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#eab308'];

export default function StatsPage() {
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
          const response = await fetch(`/api/posts/get?userId=${user.uid}&limit=1000`);
          const data = await response.json();
          setUserPosts(data.posts || []);
        } catch (error) {
          console.error('Error fetching posts:', error);
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
          <Skeleton className="h-96 w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate statistics
  const totalReviews = userPosts.length;
  const averageRating = totalReviews > 0 
    ? (userPosts.reduce((sum, post) => sum + post.rating, 0) / totalReviews).toFixed(1)
    : '0';

  const genreStats = userPosts.reduce((acc: Record<string, number>, post) => {
    const genre = post.genre || 'Unknown';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const genreData = Object.entries(genreStats).map(([name, value]) => ({
    name,
    value,
  }));

  // Monthly stats
  const monthlyStats: Record<string, number> = {};
  userPosts.forEach((post) => {
    const date = post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
  });

  const monthlyData = Object.entries(monthlyStats)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-6)
    .map(([month, count]) => ({ month, count }));

  // Get achievements
  const achievements = [];
  if (totalReviews >= 1) achievements.push({ name: 'First Review', icon: '📝' });
  if (totalReviews >= 5) achievements.push({ name: 'Prolific Reviewer', icon: '✍️' });
  if (totalReviews >= 10) achievements.push({ name: 'Book Enthusiast', icon: '📚' });
  if (parseFloat(averageRating) >= 4.5) achievements.push({ name: 'Positive Critic', icon: '⭐' });
  if (genreData.length >= 5) achievements.push({ name: 'Genre Explorer', icon: '🌍' });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Your Reading Stats</h1>
          <p className="text-muted-foreground">Track your reading journey and achievements</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <h3 className="text-sm text-muted-foreground">Total Reviews</h3>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{totalReviews}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <h3 className="text-sm text-muted-foreground">Average Rating</h3>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">{averageRating}/5</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <h3 className="text-sm text-muted-foreground">Genres Explored</h3>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{genreData.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Stats */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Monthly Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <h2 className="font-serif text-xl font-bold text-foreground">Review Activity</h2>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#1e40af" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No activity yet</p>
              )}
            </CardContent>
          </Card>

          {/* Genre Distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <h2 className="font-serif text-xl font-bold text-foreground">Genres</h2>
            </CardHeader>
            <CardContent>
              {genreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <h2 className="font-serif text-xl font-bold text-foreground">Achievements</h2>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.name} className="text-center">
                    <div className="text-5xl mb-2">{achievement.icon}</div>
                    <Badge variant="secondary" className="w-full text-center justify-center">
                      {achievement.name}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
