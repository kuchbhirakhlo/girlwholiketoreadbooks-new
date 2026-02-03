'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Star, MessageCircle, ThumbsUp, Copy, Check, Heart, Bookmark, Quote, Tag } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import { getDbInstance } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, onSnapshot as onCommentsSnapshot } from 'firebase/firestore';

interface Post {
  id: string;
  title: string;
  author: string;
  bookCover?: string;
  rating: number;
  review: string;
  content?: string;
  genre: string;
  userId: string;
  userName?: string;
  comments: number;
  likes: number;
  createdAt: Date | string;
  getYourBookLink?: string;
  quotes?: string[];
  tropes?: string[];
  publicationYear?: number;
}

interface Comment {
  id: string;
  content: string;
  userName: string;
  userId: string;
  likes: number;
  createdAt: Date | string;
}

interface ReviewPageClientProps {
  slug: string;
  bookInfo: {
    title: string;
    author: string;
    year: string;
    genre: string;
    id?: string;
  } | null;
}

export default function ReviewPageClient({ slug, bookInfo }: ReviewPageClientProps) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = post 
    ? `Check out this review: ${post.title} by ${post.author}` 
    : bookInfo 
      ? `Check out this book review of ${bookInfo.title} by ${bookInfo.author}`
      : 'Check out this book review';

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  // Generate JSON-LD for Book Review
  useEffect(() => {
    if (post) {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Review',
        headline: `Book Review: ${post.title} by ${post.author}`,
        description: post.review.substring(0, 160) + '...',
        datePublished: post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date(post.createdAt).toISOString(),
        author: {
          '@type': 'Person',
          name: post.userName || 'Anonymous Reviewer'
        },
        publisher: {
          '@type': 'Organization',
          name: 'girlwholiketoreadbooks'
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: post.rating,
          bestRating: '5',
          worstRating: '1'
        },
        itemReviewed: {
          '@type': 'Book',
          name: post.title,
          author: {
            '@type': 'Person',
            name: post.author
          },
          genre: post.genre,
          datePublished: post.publicationYear ? String(post.publicationYear) : 'Unknown'
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [post]);

  // Real-time post listener
  useEffect(() => {
    const fetchPostRealTime = async () => {
      try {
        const db = await getDbInstance();
        if (!db || !bookInfo?.id) {
          // Fallback to API fetch if Firestore not available
          fetchPostViaAPI();
          return;
        }
        
        const searchId = bookInfo.id.toLowerCase();
        const postRef = doc(db, 'posts', searchId);
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(postRef, (docSnap) => {
          if (docSnap.exists()) {
            const postData = { id: docSnap.id, ...docSnap.data() } as Post;
            setPost(postData);
            setLoading(false);
            
            // Set up real-time comments listener for this post
            const commentsQuery = query(
              collection(db, 'comments'),
              where('postId', '==', postData.id),
              orderBy('createdAt', 'desc')
            );
            
            const commentsUnsubscribe = onCommentsSnapshot(commentsQuery, (commentsSnap) => {
              const commentsData = commentsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Comment[];
              setComments(commentsData);
            });
            
            // Store unsubscribe function for cleanup
            return () => {
              commentsUnsubscribe();
            };
          } else {
            // Post not found, try API fallback
            fetchPostViaAPI();
          }
        }, (error) => {
          console.error('Error in real-time listener:', error);
          fetchPostViaAPI();
        });
        
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up real-time listener:', error);
        fetchPostViaAPI();
      }
    };
    
    fetchPostRealTime();
  }, [slug, bookInfo]);
  
  // Fallback API fetch for when Firestore is not available
  const fetchPostViaAPI = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/get?limit=100`);
      const data = await response.json();
      
      let foundPost: Post | undefined;
      
      if (bookInfo?.id) {
        const searchId = bookInfo.id.toLowerCase();
        foundPost = data.posts?.find((p: Post) => p.id.toLowerCase() === searchId);
        
        if (!foundPost) {
          foundPost = data.posts?.find((p: Post) => slug.includes(p.id));
        }
      } else if (bookInfo) {
        foundPost = data.posts?.find((p: Post) => {
          const titleMatch = p.title.toLowerCase() === bookInfo.title.toLowerCase();
          const authorMatch = p.author.toLowerCase() === bookInfo.author.toLowerCase();
          return titleMatch && authorMatch;
        });
      } else {
        foundPost = data.posts?.find((p: Post) => p.id === slug);
        if (!foundPost) {
          foundPost = data.posts?.find((p: Post) => slug.includes(p.id));
        }
      }
      
      if (!foundPost && data.posts?.length > 0) {
        foundPost = data.posts[0];
      }
      
      setPost(foundPost || null);
      
      if (foundPost) {
        const commentsRes = await fetch(`/api/posts/comments?postId=${foundPost.id}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      }
    } catch (error) {
      console.error('Error fetching post via API:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, bookInfo]);

  // Fetch user's favorites when logged in
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }
      try {
        const favRes = await fetch(`/api/favorites?userId=${user.uid}`);
        const favData = await favRes.json();
        const favIds = (favData.favorites || []).map((f: any) => f.postId);
        setFavorites(favIds);
        if (post) {
          setIsLiked(favIds.includes(post.id));
          setIsSaved(favIds.includes(post.id));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [user, post]);

  const handleLike = async () => {
    if (!user) {
      router.push('/auth/reader-login');
      return;
    }
    if (!post) return;

    try {
      if (isLiked) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: post.id, userId: user.uid }),
        });
        setIsLiked(false);
        setPost((prev) => prev ? { ...prev, likes: Math.max(0, (prev.likes || 0) - 1) } : null);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: post.id, userId: user.uid }),
        });
        setIsLiked(true);
        setPost((prev) => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/auth/reader-login');
      return;
    }
    if (!post) return;

    try {
      if (isSaved) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: post.id, userId: user.uid }),
        });
        setIsSaved(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: post.id, userId: user.uid }),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !post) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0],
          content: newComment,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          <Skeleton className="h-96 w-full bg-muted mb-8" />
          <Skeleton className="h-12 w-3/4 bg-muted mb-4" />
          <Skeleton className="h-6 w-1/2 bg-muted" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Review Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {bookInfo 
              ? `The review for "${bookInfo.title}" by ${bookInfo.author} could not be found.`
              : 'The review you are looking for could not be found.'}
          </p>
          <Link href="/browse">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Browse All Reviews
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const date = post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-muted-foreground">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link href="/browse" className="hover:text-primary transition-colors">Browse</Link></li>
            <li>/</li>
            <li><Link href={`/browse?genre=${encodeURIComponent(post.genre)}`} className="hover:text-primary transition-colors">{post.genre}</Link></li>
            <li>/</li>
            <li className="text-foreground">{post.title}</li>
          </ol>
        </nav>

        {/* Book Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {post.bookCover ? (
            <img
              src={post.bookCover || "/placeholder.svg"}
              alt={`Cover of ${post.title}`}
              className="w-48 h-72 object-cover rounded-lg shadow-lg flex-shrink-0"
              width="192"
              height="288"
            />
          ) : (
            <div className="w-48 h-72 bg-muted rounded-lg shadow-lg flex items-center justify-center flex-shrink-0">
              <span className="text-muted-foreground">No Cover</span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">{post.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">by {post.author}</p>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Genre</p>
                <Link 
                  href={`/browse?genre=${encodeURIComponent(post.genre)}`}
                  className="text-foreground font-medium hover:text-primary transition-colors"
                >
                  {post.genre}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Published</p>
                <p className="text-foreground font-medium">{post.publicationYear || bookInfo?.year || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(post.rating) ? 'fill-accent text-accent' : 'text-border'}`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-2 text-foreground font-medium">{post.rating.toFixed(1)}/5</span>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Reviewed by</p>
              <p className="text-foreground font-medium mb-1">Priya Singh</p>
            </div>

            {/* Engagement */}
            <div className="flex gap-4 flex-wrap">
              <Button 
                variant="outline" 
                className={`border-border hover:bg-secondary bg-transparent ${isLiked ? 'text-red-500 border-red-500' : 'text-foreground'}`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
                {post.likes} Likes
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                {comments.length} Comments
              </Button>
              <Button 
                variant="outline" 
                className={`border-border hover:bg-secondary bg-transparent ${isSaved ? 'text-primary border-primary' : 'text-foreground'}`}
                onClick={handleSave}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>

            {/* Social Media Share */}
            <div className="flex gap-2 mt-4">
              <span className="text-sm text-muted-foreground mr-2 self-center">Share:</span>
              <Button
                variant="outline"
                size="icon"
                className="border-border text-foreground hover:bg-secondary bg-transparent h-9 w-9"
                onClick={() => handleShare('twitter')}
                title="Share on X (Twitter)"
                aria-label="Share on Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-border text-foreground hover:bg-secondary bg-transparent h-9 w-9"
                onClick={() => handleShare('facebook')}
                title="Share on Facebook"
                aria-label="Share on Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-border text-foreground hover:bg-secondary bg-transparent h-9 w-9"
                onClick={() => handleShare('linkedin')}
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-border text-foreground hover:bg-secondary bg-transparent h-9 w-9"
                onClick={() => handleShare('whatsapp')}
                title="Share on WhatsApp"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`border-border ${copied ? 'text-green-500 border-green-500' : 'text-foreground hover:bg-secondary'} bg-transparent h-9 w-9`}
                onClick={() => {
                  handleShare('copy');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                title="Copy Link"
                aria-label="Copy link to this review"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* Get Your Book Link */}
            {post.getYourBookLink && (
              <a
                href={post.getYourBookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mt-6"
              >
                <span>
                  📖
                </span>
                <span>Get Your Book</span>
              </a>
            )}
          </div>
        </div>

        {/* Tropes Section - Now appears after metadata/engagement, before review content */}
        {post.tropes && post.tropes.length > 0 && (
          <Card className="bg-card border-border mb-12">
            <CardHeader>
              <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <Tag className="w-6 h-6 text-primary" aria-hidden="true" />
                Tropes
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Book tropes">
                {post.tropes.map((trope, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-secondary/50 border border-border rounded-full text-foreground"
                    role="listitem"
                  >
                    {trope}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Content */}
        <Card className="bg-card border-border mb-12">
          <CardHeader>
            <h2 className="text-2xl font-serif font-bold text-foreground">Review</h2>
          </CardHeader>
          <CardContent>
            <article className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">{post.content || post.review}</p>
            </article>
          </CardContent>
        </Card>

        {/* Book Quotes Section - Elegant Design */}
        {post.quotes && post.quotes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center flex items-center justify-center gap-3">
              <Quote className="w-7 h-7 text-amber-500" aria-hidden="true" />
              Notable Quotes
            </h2>
            
            {/* Elegant divider */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-600"></div>
              <div className="w-2 h-2 rotate-45 border border-amber-400 dark:border-amber-500"></div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-600"></div>
            </div>
            
            <div className="grid gap-6">
              {post.quotes.map((quote, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  {/* Main card with glassmorphism effect */}
                  <div className="relative bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-rose-50/40 dark:from-amber-950/30 dark:via-orange-900/20 dark:to-rose-900/20 rounded-2xl p-8 shadow-lg border border-amber-100/50 dark:border-amber-800/30 overflow-hidden">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-rose-100/30 dark:from-amber-900/20 dark:to-rose-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Decorative corner elements */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-300/60 dark:border-amber-600/50 rounded-tl-lg"></div>
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-300/60 dark:border-amber-600/50 rounded-tr-lg"></div>
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-300/60 dark:border-amber-600/50 rounded-bl-lg"></div>
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-300/60 dark:border-amber-600/50 rounded-br-lg"></div>
                    
                    {/* Large decorative quote mark */}
                    <div className="absolute -top-2 -left-2 text-6xl font-serif text-amber-200/50 dark:text-amber-700/30 select-none leading-none">
                      "
                    </div>
                    
                    {/* Quote content */}
                    <div className="relative z-10">
                      <p className="text-xl md:text-lg text-foreground italic leading-relaxed font-serif pl-4">
                        <span className="text-amber-500 dark:text-amber-400 mr-1">"</span>
                        {quote}
                        <span className="text-amber-500 dark:text-amber-400 ml-1">"</span>
                      </p>
                    </div>
                    
                    {/* Decorative line */}
                    <div className="absolute bottom-4 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-200/40 dark:via-amber-700/30 to-transparent"></div>
                    
                    {/* Bottom decorative element */}
                    <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-tl from-amber-100/50 to-transparent dark:from-amber-800/30 rounded-tr-2xl"></div>
                  </div>
                  
                  {/* Subtle glow on hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-300/20 via-rose-300/20 to-amber-300/20 dark:from-amber-600/20 dark:via-rose-600/20 dark:to-amber-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10"></div>
                </div>
              ))}
            </div>
            
            {/* Bottom decorative element */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="w-1 h-1 rounded-full bg-amber-400 dark:bg-amber-500"></div>
              <div className="w-2 h-2 rotate-45 border border-amber-400 dark:border-amber-500"></div>
              <div className="w-1 h-1 rounded-full bg-amber-400 dark:bg-amber-500"></div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
            Comments ({comments.length})
          </h2>

          {user ? (
            <Card className="bg-card border-border mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleAddComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this review..."
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                    rows={4}
                    aria-label="Your comment"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{newComment.length}/1000</p>
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border mb-8">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">Sign in to leave a comment</p>
                <Link href="/auth/reader-login">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign In with Google
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4" role="list" aria-label="Comments">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">{comment.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.createdAt instanceof Date
                            ? comment.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <ThumbsUp className="w-4 h-4 mr-1" aria-hidden="true" />
                        {comment.likes}
                      </Button>
                    </div>
                    <p className="text-foreground">{comment.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} girlwholiketoreadbooks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
