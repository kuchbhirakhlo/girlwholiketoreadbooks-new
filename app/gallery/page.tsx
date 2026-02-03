import { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Image as ImageIcon } from 'lucide-react';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

// Revalidate gallery data every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    default: 'Book Gallery - Visual Journey Through Literature | girlwholiketoreadbooks',
    template: '%s | girlwholiketoreadbooks'
  },
  description: 'Explore our curated collection of book-related images, literary quotes, and reading moments. A visual journey through the world of books and reading.',
  keywords: [
    'book gallery',
    'book images',
    'literary photos',
    'reading moments',
    'book aesthetics',
    'book community photos',
    'reading gallery'
  ],
  authors: [{ name: 'girlwholiketoreadbooks' }],
  creator: 'girlwholiketoreadbooks',
  publisher: 'girlwholiketoreadbooks',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://girlwholiketoreadbooks.in/gallery',
    siteName: 'girlwholiketoreadbooks',
    title: 'Book Gallery - Visual Journey Through Literature',
    description: 'Explore our curated collection of book-related images, literary quotes, and reading moments.',
    images: [
      {
        url: '/book-reading.jpeg',
        width: 1200,
        height: 630,
        alt: 'Book gallery preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Gallery - girlwholiketoreadbooks',
    description: 'Explore our curated collection of book-related images and reading moments.',
    images: ['/book-reading.jpeg'],
  },
  alternates: {
    canonical: 'https://girlwholiketoreadbooks.in/gallery',
  },
  category: 'Books & Literature',
};

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  bookTitle: string;
  createdAt: Date;
}

// Server component for fetching gallery data
async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    // Import Firebase functions dynamically to avoid SSR issues
    const { getDbInstance, isFirebaseConfigured } = await import('@/lib/firebase');
    
    if (!isFirebaseConfigured) {
      return [];
    }

    const dbInstance = await getDbInstance();
    if (!dbInstance) {
      return [];
    }

    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    
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
    
    return galleryItems as GalleryItem[];
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="bg-card border-border overflow-hidden">
          <div className="aspect-square bg-muted animate-pulse" />
          <CardContent className="p-4 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GalleryContent() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryGrid />
    </Suspense>
  );
}

async function GalleryGrid() {
  const gallery = await getGalleryItems();

  if (gallery.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-16 text-center">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Images Yet</h2>
          <p className="text-muted-foreground">
            The gallery is empty. Check back soon for updates!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="list" aria-label="Book gallery images">
      {gallery.map((item) => (
        <Card
          key={item.id}
          className="bg-card border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
        >
          <div className="aspect-square overflow-hidden relative">
            <img
              src={item.imageUrl}
              alt={item.title || `Gallery image for ${item.bookTitle || 'book'}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          </div>
          {(item.title || item.bookTitle) && (
            <CardContent className="p-4">
              {item.title && (
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {item.title}
                </h3>
              )}
              {item.bookTitle && (
                <p className="text-sm text-primary mb-1">📚 {item.bookTitle}</p>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Book Gallery</h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Explore our collection of book-related images, literary quotes, and beautiful reading moments. 
            A visual celebration of literature and the joy of reading.
          </p>
        </div>

        {/* Gallery Grid */}
        <GalleryContent />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} girlwholiketoreadbooks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
