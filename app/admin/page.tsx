'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { FileText, Eye, CheckCircle, Clock, Users, PenTool, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftsPending: number;
  totalUsers: number;
  editorUsers: number;
  publishedThisMonth: number;
  recentPosts: Array<{
    id: string;
    title: string;
    status: string;
    authorName: string;
    createdAt: any;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isFirebaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const dbInstance = await getDbInstance();
        if (!dbInstance) return;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get all posts
        const postsSnapshot = await getDocs(collection(dbInstance, 'posts'));
        const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const publishedPosts = posts.filter((p: any) => p.status === 'published');
        const draftsPending = posts.filter((p: any) => p.status === 'draft' || p.status === 'review');
        const publishedThisMonth = publishedPosts.filter((p: any) => {
          if (!p.createdAt) return false;
          const createdAt = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
          return createdAt >= startOfMonth;
        });

        // Get recent posts
        const recentPostsQuery = query(
          collection(dbInstance, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentPostsSnapshot = await getDocs(recentPostsQuery);

        // Get users
        const usersSnapshot = await getDocs(collection(dbInstance, 'users'));
        const users = usersSnapshot.docs.map(doc => doc.data());
        const editorUsers = users.filter((u: any) => u.role === 'editor' || u.role === 'admin');

        setStats({
          totalPosts: posts.length,
          publishedPosts: publishedPosts.length,
          draftsPending: draftsPending.length,
          totalUsers: users.length,
          editorUsers: editorUsers.length,
          publishedThisMonth: publishedThisMonth.length,
          recentPosts: recentPostsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || 'Untitled',
            status: doc.data().status || 'unknown',
            authorName: doc.data().authorName || doc.data().userName || 'Unknown',
            createdAt: doc.data().createdAt,
          })),
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[#6F6F6F]">
          <div className="w-6 h-6 border-2 border-[#8B5E3C]/30 border-t-[#8B5E3C] rounded-full animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: 'text-[#8B5E3C]',
      bgColor: 'bg-[#8B5E3C]/10',
    },
    {
      title: 'Published',
      value: stats?.publishedPosts || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Review',
      value: stats?.draftsPending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Published This Month',
      value: stats?.publishedThisMonth || 0,
      icon: TrendingUp,
      color: 'text-[#8B5E3C]',
      bgColor: 'bg-[#8B5E3C]/10',
    },
    {
      title: 'Active Editors',
      value: stats?.editorUsers || 0,
      icon: PenTool,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2B2B2B]">Dashboard</h1>
          <p className="text-[#6F6F6F] mt-1">Overview of your book review platform</p>
        </div>
        <Link href="/editor/new">
          <Button className="bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90">
            <PenTool className="w-4 h-4 mr-2" />
            New Review
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-white border-[#E6E1DA]">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#6F6F6F]">{stat.title}</p>
                  <p className="text-3xl font-bold text-[#2B2B2B] mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-[#E6E1DA]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E1DA]">
              <h2 className="font-semibold text-[#2B2B2B]">Recent Reviews</h2>
              <Link href="/admin/posts">
                <Button variant="ghost" size="sm" className="text-[#8B5E3C] hover:bg-[#8B5E3C]/10">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-[#E6E1DA]">
              {stats?.recentPosts && stats.recentPosts.length > 0 ? (
                stats.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#FAF8F5] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2B2B2B] truncate">{post.title}</p>
                      <p className="text-sm text-[#6F6F6F]">
                        by {post.authorName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${post.status === 'published' ? 'bg-green-100 text-green-700' : ''}
                        ${post.status === 'draft' ? 'bg-gray-100 text-gray-600' : ''}
                        ${post.status === 'review' ? 'bg-amber-100 text-amber-700' : ''}
                      `}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-[#6F6F6F]">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="bg-white border-[#E6E1DA]">
            <div className="px-6 py-4 border-b border-[#E6E1DA]">
              <h2 className="font-semibold text-[#2B2B2B]">Quick Actions</h2>
            </div>
            <CardContent className="pt-6 space-y-3">
              <Link href="/editor/new" className="block">
                <Button variant="outline" className="w-full justify-start border-[#E6E1DA] text-[#2B2B2B] hover:bg-[#FAF8F5]">
                  <PenTool className="w-4 h-4 mr-2" />
                  Write New Review
                </Button>
              </Link>
              <Link href="/admin/posts" className="block">
                <Button variant="outline" className="w-full justify-start border-[#E6E1DA] text-[#2B2B2B] hover:bg-[#FAF8F5]">
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Posts
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start border-[#E6E1DA] text-[#2B2B2B] hover:bg-[#FAF8F5]">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/settings" className="block">
                <Button variant="outline" className="w-full justify-start border-[#E6E1DA] text-[#2B2B2B] hover:bg-[#FAF8F5]">
                  <Eye className="w-4 h-4 mr-2" />
                  View Site
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
