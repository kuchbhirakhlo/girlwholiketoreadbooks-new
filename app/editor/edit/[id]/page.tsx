'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuthInstance, getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2, BookOpen, Save, ArrowLeft, Link as LinkIcon, Quote, Plus, X, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';

type UserRole = 'admin' | 'editor' | 'reader';

interface AuthUser extends User {
  role?: UserRole;
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
  'Thriller',
  'Horror',
  'Romantasy',
  'Contemporary',
  'Historical Fiction',
];

interface ReviewFormData {
  title: string;
  author: string;
  genre: string;
  rating: number;
  review: string;
  bookCover?: string;
  publicationYear?: number;
  getYourBookLink?: string;
}

interface PostData {
  id: string;
  title: string;
  bookTitle: string;
  authorName: string;
  authorId: string;
  content: string;
  genre: string[];
  rating: number;
  coverImage?: string;
  publicationYear?: number;
  status: 'draft' | 'review' | 'published';
  quotes?: string[];
  tropes?: string[];
  getYourBookLink?: string;
}

export default function EditPostPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [post, setPost] = useState<PostData | null>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [newQuote, setNewQuote] = useState('');
  const [tropes, setTropes] = useState<string[]>([]);
  const [newTrope, setNewTrope] = useState('');
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<ReviewFormData>({
    defaultValues: {
      title: '',
      author: '',
      genre: 'Fiction',
      rating: 5,
      review: '',
      publicationYear: new Date().getFullYear(),
      getYourBookLink: '',
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isFirebaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const authInstance = await getAuthInstance();
        const dbInstance = await getDbInstance();

        if (!authInstance || !dbInstance) {
          router.push('/login');
          return;
        }

        const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
          if (!firebaseUser) {
            router.push('/login');
            return;
          }

          const userDoc = await getDoc(doc(dbInstance, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          const role = userData?.role as UserRole | undefined;

          if (!role || (role !== 'admin' && role !== 'editor')) {
            router.push('/login');
            return;
          }

          setUser({
            ...firebaseUser,
            role,
          });

          // Fetch the post data
          if (postId) {
            const postSnap = await getDoc(doc(dbInstance, 'posts', postId));
            if (postSnap.exists()) {
              const data = postSnap.data();
              const postData: PostData = {
                id: postSnap.id,
                title: data.title || '',
                bookTitle: data.bookTitle || '',
                authorName: data.authorName || '',
                authorId: data.authorId || '',
                content: data.content || '',
                genre: data.genre || [],
                rating: data.rating || 5,
                coverImage: data.coverImage || '',
                publicationYear: data.publicationYear || null,
                status: data.status || 'draft',
                quotes: data.quotes || [],
                tropes: data.tropes || [],
                getYourBookLink: data.getYourBookLink || '',
              };
              setPost(postData);
              setSelectedRating(postData.rating || 5);
              setQuotes(postData.quotes || []);
              setTropes(postData.tropes || []);
              setValue('title', postData.title);
              setValue('author', postData.bookTitle);
              setValue('genre', Array.isArray(postData.genre) ? postData.genre[0] : postData.genre || 'Fiction');
              setValue('rating', postData.rating || 5);
              setValue('review', postData.content);
              setValue('bookCover', postData.coverImage || '');
              setValue('publicationYear', typeof postData.publicationYear === 'number' ? postData.publicationYear : new Date().getFullYear());
              setValue('getYourBookLink', postData.getYourBookLink || '');
            }
          }

          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, postId, setValue]);

  const handleAddQuote = () => {
    if (newQuote.trim()) {
      setQuotes([...quotes, newQuote.trim()]);
      setNewQuote('');
    }
  };

  const handleRemoveQuote = (index: number) => {
    setQuotes(quotes.filter((_, i) => i !== index));
  };

  const handleAddTrope = () => {
    if (newTrope.trim() && !tropes.includes(newTrope.trim())) {
      setTropes([...tropes, newTrope.trim()]);
      setNewTrope('');
    }
  };

  const handleRemoveTrope = (index: number) => {
    setTropes(tropes.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!user || !postId) return;

    setSubmitting(true);
    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) return;

      await updateDoc(doc(dbInstance, 'posts', postId), {
        title: data.title,
        bookTitle: data.author,
        authorName: post?.authorName || data.author,
        content: data.review,
        excerpt: (data.review || '').substring(0, 297) + '...',
        genre: [data.genre],
        coverImage: data.bookCover || null,
        publicationYear: data.publicationYear || null,
        rating: selectedRating,
        updatedAt: Timestamp.now(),
        quotes: quotes,
        tropes: tropes,
        getYourBookLink: data.getYourBookLink || null,
      });

      router.push('/admin/posts');
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user || !postId) return;

    setSubmitting(true);
    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) return;

      await updateDoc(doc(dbInstance, 'posts', postId), {
        title: watch('title'),
        bookTitle: watch('author'),
        authorName: post?.authorName || watch('author'),
        content: watch('review'),
        excerpt: (watch('review') || '').substring(0, 297) + '...',
        genre: [watch('genre')],
        coverImage: watch('bookCover') || null,
        publicationYear: watch('publicationYear') || null,
        rating: selectedRating,
        updatedAt: Timestamp.now(),
        quotes: quotes,
        tropes: tropes,
        getYourBookLink: watch('getYourBookLink') || null,
      });

      router.push('/admin/posts');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[#6F6F6F]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading editor...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/posts')}
          className="mb-4 text-[#6F6F6F] hover:text-[#2B2B2B]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Posts
        </Button>
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B]">Edit Review</h1>
        <p className="text-[#6F6F6F] mt-1">Update your book review</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Main Editor Area */}
        <Card className="bg-white border-[#E6E1DA]">
          <CardContent className="pt-8">
            <div className="space-y-6">
              {/* Book Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#2B2B2B] font-medium">
                  Book Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter the book title"
                  {...register('title', { required: 'Book title is required' })}
                  className="border-[#E6E1DA] focus:border-[#8B5E3C] text-lg"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author" className="text-[#2B2B2B] font-medium">
                  Author *
                </Label>
                <Input
                  id="author"
                  placeholder="Enter the author's name"
                  {...register('author', { required: 'Author name is required' })}
                  className="border-[#E6E1DA] focus:border-[#8B5E3C]"
                />
                {errors.author && (
                  <p className="text-sm text-red-500">{errors.author.message}</p>
                )}
              </div>

              {/* Review Content */}
              <div className="space-y-2">
                <Label htmlFor="review" className="text-[#2B2B2B] font-medium">
                  Your Review *
                </Label>
                <textarea
                  id="review"
                  placeholder="Write your detailed review here. Share your thoughts, insights, and recommendations about the book..."
                  rows={15}
                  {...register('review', {
                    required: 'Review is required',
                    minLength: { value: 50, message: 'Review must be at least 50 characters' },
                    maxLength: { value: 10000, message: 'Review must be less than 10,000 characters' },
                  })}
                  className="w-full px-4 py-3 border border-[#E6E1DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] resize-none font-serif text-base leading-relaxed"
                />
                <div className="flex items-center justify-between text-sm">
                  <p className="text-[#6F6F6F]">
                    {watch('review')?.length || 0}/10,000 characters (min 50)
                  </p>
                  {errors.review && (
                    <p className="text-red-500">{errors.review.message}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta Panel */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Book Details */}
          <Card className="bg-white border-[#E6E1DA]">
            <CardContent className="pt-6 space-y-6">
              <h3 className="font-semibold text-[#2B2B2B] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#8B5E3C]" />
                Book Details
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#2B2B2B]">Genre *</Label>
                  <select
                    {...register('genre')}
                    className="w-full px-4 py-2 border border-[#E6E1DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] bg-white"
                  >
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#2B2B2B]">Publication Year</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 2024"
                    {...register('publicationYear', { valueAsNumber: true })}
                    className="border-[#E6E1DA] focus:border-[#8B5E3C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#2B2B2B]">Cover Image URL</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    {...register('bookCover')}
                    className="border-[#E6E1DA] focus:border-[#8B5E3C]"
                  />
                  <p className="text-xs text-[#6F6F6F]">Provide a direct URL to the book cover image</p>
                </div>

                {/* Get Your Book Link */}
                <div className="space-y-2">
                  <Label htmlFor="getYourBookLink" className="text-[#2B2B2B] flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Get Your Book Link
                  </Label>
                  <Input
                    id="getYourBookLink"
                    type="url"
                    placeholder="https://amazon.com/your-book"
                    {...register('getYourBookLink')}
                    className="border-[#E6E1DA] focus:border-[#8B5E3C]"
                  />
                  <p className="text-xs text-[#6F6F6F]">Add a link where readers can purchase or get the book</p>
                </div>

                {/* Tropes */}
                <div className="space-y-2">
                  <Label className="text-[#2B2B2B] flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tropes
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a trope (e.g., Enemies to Lovers)"
                      value={newTrope}
                      onChange={(e) => setNewTrope(e.target.value)}
                      className="border-[#E6E1DA] focus:border-[#8B5E3C]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTrope();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTrope}
                      disabled={!newTrope.trim() || tropes.includes(newTrope.trim())}
                      className="bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {tropes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tropes.map((trope, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-[#FAF8F5] text-[#2B2B2B] hover:bg-[#FAF8F5] px-3 py-1"
                        >
                          {trope}
                          <button
                            type="button"
                            onClick={() => handleRemoveTrope(index)}
                            className="ml-2 text-[#6F6F6F] hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[#6F6F6F]">
                    Add tropes to help readers find books with similar themes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating & Status */}
          <Card className="bg-white border-[#E6E1DA]">
            <CardContent className="pt-6 space-y-6">
              <h3 className="font-semibold text-[#2B2B2B]">Rating</h3>

              {/* Star Rating */}
              <div className="space-y-2">
                <Label className="text-[#2B2B2B]">Your Rating *</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setSelectedRating(star);
                        setValue('rating', star);
                      }}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= selectedRating
                            ? 'fill-[#8B5E3C] text-[#8B5E3C]'
                            : 'text-[#E6E1DA]'
                        }`}
                      />
                    </button>
                  ))}
                  <Badge variant="secondary" className="ml-2 bg-[#FAF8F5] text-[#2B2B2B]">
                    {selectedRating.toFixed(1)}/5
                  </Badge>
                </div>
              </div>

              {post && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E6E1DA] rounded-lg">
                  <h4 className="font-medium text-[#2B2B2B] mb-2">Current Status</h4>
                  <p className="text-sm text-[#6F6F6F]">
                    This review is currently: <strong className="capitalize">{post.status}</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quotes Section */}
        <Card className="bg-white border-[#E6E1DA]">
          <CardContent className="pt-6 space-y-6">
            <h3 className="font-semibold text-[#2B2B2B] flex items-center gap-2">
              <Quote className="w-5 h-5 text-[#8B5E3C]" />
              Book Quotes
            </h3>

            {/* Add New Quote */}
            <div className="flex gap-2">
              <textarea
                placeholder="Add a memorable quote from the book..."
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                className="flex-1 px-4 py-3 border border-[#E6E1DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] resize-none"
                rows={2}
              />
              <Button
                type="button"
                onClick={handleAddQuote}
                disabled={!newQuote.trim()}
                className="bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Quotes List */}
            {quotes.length > 0 && (
              <div className="space-y-3">
                <Label className="text-[#2B2B2B]">Added Quotes ({quotes.length})</Label>
                <div className="space-y-2">
                  {quotes.map((quote, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-[#FAF8F5] border border-[#E6E1DA] rounded-lg"
                    >
                      <Quote className="w-4 h-4 text-[#8B5E3C] mt-1 flex-shrink-0" />
                      <p className="flex-1 text-[#2B2B2B] italic">"{quote}"</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuote(index)}
                        className="text-[#6F6F6F] hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-[#6F6F6F]">
              Add memorable quotes from the book to share with readers
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={submitting}
            className="border-[#E6E1DA] text-[#2B2B2B] hover:bg-[#FAF8F5]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button
            type="submit"
            disabled={submitting || !isValid}
            className="bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save & Exit
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
