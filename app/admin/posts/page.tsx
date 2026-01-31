'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { FileText, Plus, Filter, Search, MoreVertical, Edit, Trash2, Eye, CheckCircle, Clock, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  status: 'draft' | 'review' | 'published';
  genre: string;
  rating: number;
  createdAt: any;
  updatedAt: any;
}

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'review', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!isFirebaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const dbInstance = await getDbInstance();
        if (!dbInstance) return;

        const postsQuery = query(
          collection(dbInstance, 'posts'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(postsQuery);

        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];

        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter;
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                          post.authorName?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePublish = async (postId: string) => {
    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) return;

      await updateDoc(doc(dbInstance, 'posts', postId), {
        status: 'published',
        updatedAt: Timestamp.now(),
      });

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, status: 'published', updatedAt: new Date() } : p
      ));
    } catch (err) {
      console.error('Error publishing post:', err);
    }
  };

  const handleUnpublish = async (postId: string) => {
    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) return;

      await updateDoc(doc(dbInstance, 'posts', postId), {
        status: 'draft',
        updatedAt: Timestamp.now(),
      });

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, status: 'draft', updatedAt: new Date() } : p
      ));
    } catch (err) {
      console.error('Error unpublishing post:', err);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) return;

      await deleteDoc(doc(dbInstance, 'posts', postId));
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-gray-100 text-gray-600',
      review: 'bg-amber-100 text-amber-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[#6F6F6F]">
          <div className="w-6 h-6 border-2 border-[#8B5E3C]/30 border-t-[#8B5E3C] rounded-full animate-spin" />
          <span>Loading posts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2B2B2B]">Posts</h1>
          <p className="text-[#6F6F6F] mt-1">Manage all book reviews</p>
        </div>
        <Button 
          onClick={() => router.push('/editor/new')}
          className="bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border-[#E6E1DA]">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6F6F]" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#E6E1DA] focus:border-[#8B5E3C]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {statusFilters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={filter === f.value ? 'bg-[#8B5E3C] text-white' : 'border-[#E6E1DA]'}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span className="ml-1 text-xs opacity-70">
                    ({posts.filter(p => p.status === f.value).length})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Posts Table */}
      <Card className="bg-white border-[#E6E1DA] overflow-hidden">
        {filteredPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6E1DA] bg-[#FAF8F5]">
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F]">Title</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F] hidden md:table-cell">Author</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F] hidden lg:table-cell">Genre</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F]">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F] hidden sm:table-cell">Date</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-[#6F6F6F]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1DA]">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {post.rating && (
                          <span className="text-amber-500">{'★'.repeat(Math.round(post.rating))}</span>
                        )}
                        <span className="font-medium text-[#2B2B2B]">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6F6F6F] hidden md:table-cell">
                      {post.authorName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6F6F6F] hidden lg:table-cell">
                      {post.genre || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6F6F6F] hidden sm:table-cell">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {post.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(post.id)}
                            className="text-green-600 hover:bg-green-50"
                            title="Submit for review"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        {post.status === 'review' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(post.id)}
                            className="text-green-600 hover:bg-green-50"
                            title="Publish"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {post.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnpublish(post.id)}
                            className="text-amber-600 hover:bg-amber-50"
                            title="Unpublish"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/reviews/${post.id}`)}
                          className="text-[#6F6F6F] hover:bg-[#FAF8F5]"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/editor/edit/${post.id}`)}
                          className="text-[#6F6F6F] hover:bg-[#FAF8F5]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-[#E6E1DA]" />
            <h3 className="text-lg font-medium text-[#2B2B2B] mb-1">No posts found</h3>
            <p className="text-[#6F6F6F]">
              {search ? 'Try adjusting your search' : 'Get started by writing your first review'}
            </p>
            {!search && (
              <Button
                onClick={() => router.push('/editor/new')}
                className="mt-4 bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Review
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
