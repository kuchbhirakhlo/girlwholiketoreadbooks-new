'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getAuthInstance, getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'admin' | 'editor' | 'reader';

interface AuthUser extends User {
  role?: UserRole;
}

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  bookTitle: string;
  createdAt: Date;
}

export default function AdminGalleryPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newImage, setNewImage] = useState({
    imageUrl: '',
    title: '',
    description: '',
    bookTitle: '',
  });
  const { toast } = useToast();
  const router = useRouter();

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

          if (!role || role !== 'admin') {
            router.push('/login');
            return;
          }

          setUser({
            ...firebaseUser,
            role,
          });
          fetchGallery(dbInstance);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchGallery = async (dbInstance: any) => {
    try {
      const galleryQuery = query(
        collection(dbInstance, 'gallery'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(galleryQuery);
      const galleryItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setGallery(galleryItems as GalleryItem[]);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newImage.imageUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Image URL is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) {
        throw new Error('Database not initialized');
      }

      const galleryData = {
        imageUrl: newImage.imageUrl,
        title: newImage.title || '',
        description: newImage.description || '',
        bookTitle: newImage.bookTitle || '',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(dbInstance, 'gallery'), galleryData);
      toast({
        title: 'Success',
        description: 'Image added to gallery successfully',
      });
      setNewImage({ imageUrl: '', title: '', description: '', bookTitle: '' });
      fetchGallery(dbInstance);
    } catch (error) {
      console.error('Error adding to gallery:', error);
      toast({
        title: 'Error',
        description: 'Failed to add image to gallery',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) {
        throw new Error('Database not initialized');
      }

      await deleteDoc(doc(dbInstance, 'gallery', id));
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
      fetchGallery(dbInstance);
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[#6F6F6F]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading gallery...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B]">Gallery Management</h1>
        <p className="text-[#6F6F6F] mt-1">Add and manage images for the gallery page</p>
      </div>

      {/* Add New Image Form */}
      <Card className="bg-white border-[#E6E1DA]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#8B5E3C]" />
            Add New Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddImage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-[#2B2B2B]">
                Image URL *
              </Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newImage.imageUrl}
                onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                className="border-[#E6E1DA] focus:border-[#8B5E3C]"
                required
              />
              <p className="text-xs text-[#6F6F6F]">Provide a direct URL to the image</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#2B2B2B]">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Image title (optional)"
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                className="border-[#E6E1DA] focus:border-[#8B5E3C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookTitle" className="text-[#2B2B2B]">
                Related Book Title
              </Label>
              <Input
                id="bookTitle"
                placeholder="Book title this image relates to (optional)"
                value={newImage.bookTitle}
                onChange={(e) => setNewImage({ ...newImage, bookTitle: e.target.value })}
                className="border-[#E6E1DA] focus:border-[#8B5E3C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#2B2B2B]">
                Description
              </Label>
              <textarea
                id="description"
                placeholder="Describe the image or its context (optional)"
                value={newImage.description}
                onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                className="w-full px-4 py-3 border border-[#E6E1DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] resize-none"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Gallery
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Card className="bg-white border-[#E6E1DA]">
        <CardHeader>
          <CardTitle>Gallery Images ({gallery.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {gallery.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-[#E6E1DA] mx-auto mb-4" />
              <p className="text-[#6F6F6F]">No images in gallery yet</p>
              <p className="text-sm text-[#6F6F6F]">Add your first image using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="relative group border border-[#E6E1DA] rounded-lg overflow-hidden"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Gallery image'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    {item.title && (
                      <h3 className="font-semibold text-[#2B2B2B] mb-1">{item.title}</h3>
                    )}
                    {item.bookTitle && (
                      <p className="text-sm text-[#8B5E3C] mb-1">📚 {item.bookTitle}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-[#6F6F6F]">{item.description}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
