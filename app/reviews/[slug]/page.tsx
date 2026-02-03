import { Metadata } from 'next';
import ReviewPageClient from './review-client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  // Parse the slug to extract book details
  const bookInfo = parseSlug(slug);
  
  // For simple IDs, we'll fetch the post to get metadata
  if (!bookInfo) {
    // Return a placeholder that will be updated client-side, or basic metadata
    return {
      title: 'Loading Review | girlwholiketoreadbooks',
      description: 'Loading book review...',
    };
  }

  const { title, author, year, genre } = bookInfo;
  
  // Generate the canonical URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://girlwholiketoreadbooks.in';
  const canonicalUrl = `${baseUrl}/reviews/${slug}`;

  return {
    title: {
      default: `Book Review: ${title} by ${author} (${year}) | girlwholiketoreadbooks`,
      template: '%s | girlwholiketoreadbooks'
    },
    description: `Read our in-depth book review of "${title}" by ${author}, a ${genre} novel published in ${year}. Discover our honest critique and rating.`,
    keywords: [
      'book review',
      title,
      author,
      `${title} review`,
      `${author} books`,
      `${genre} book review`,
      `published ${year}`,
      'book critique',
      'literary review',
      `${genre} novels`
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
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'girlwholiketoreadbooks',
      title: `Book Review: ${title} by ${author}`,
      description: `Read our honest and detailed book review of "${title}" by ${author}. ${genre} novel from ${year}.`,
      images: [
        {
          url: '/book-reading.jpeg',
          width: 1200,
          height: 630,
          alt: `Cover of ${title} by ${author}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Book Review: ${title} by ${author}`,
      description: `Read our honest review of "${title}" by ${author}. ${genre}, ${year}.`,
      images: ['/book-reading.jpeg'],
      creator: '@girlwholiketoreadbooks',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    category: genre,
  };
}

// Helper function to parse the slug
// Returns book info and id if it's a full slug, or null if it's a simple ID
interface ParsedSlugResult {
  title: string;
  author: string;
  year: string;
  genre: string;
  id?: string;
}

function parseSlug(slug: string): ParsedSlugResult | null {
  // Check if it's a simple ID (for backward compatibility)
  // Simple IDs are typically alphanumeric without special formatting
  const isSimpleId = /^[a-zA-Z0-9]+$/.test(slug) && !slug.includes('-by-') && !slug.includes('-published-in-');
  
  if (isSimpleId) {
    // Return null to indicate we should fetch by ID
    return null;
  }
  
  try {
    // Expected format: title-by-author-published-in-year-and-genre-id
    // The ID is the last segment (alphanumeric, no hyphens)
    
    // Remove 'book-review-' prefix if present
    let cleanSlug = slug.startsWith('book-review-') ? slug.slice(12) : slug;
    
    // Split by '-and-' to get the main info and genre+id
    const parts = cleanSlug.split('-and-');
    if (parts.length < 2) {
      // Try alternative format
      return null;
    }
    
    const mainPart = parts[0];
    // The rest is "genre-id" or "genre-and-id" or just "id"
    const genreAndId = parts.slice(1).join('-and-');
    
    // Extract ID from the end of genreAndId
    // The ID is the last segment (alphanumeric, no hyphens)
    const lastHyphenIndex = genreAndId.lastIndexOf('-');
    let genre: string;
    let id: string | undefined;
    
    if (lastHyphenIndex > 0) {
      const potentialId = genreAndId.slice(lastHyphenIndex + 1);
      // Check if the last part looks like an ID (alphanumeric only)
      if (/^[a-zA-Z0-9]+$/.test(potentialId)) {
        id = potentialId;
        genre = genreAndId.slice(0, lastHyphenIndex);
      } else {
        genre = genreAndId;
      }
    } else {
      genre = genreAndId;
    }
    
    // Extract title, author, and year from main part
    // Format: title-by-author-published-in-year
    const mainParts = mainPart.split('-published-in-');
    if (mainParts.length < 2) {
      return null;
    }
    
    const year = mainParts[1];
    const titleAuthorPart = mainParts[0];
    
    // Split title and author by '-by-'
    const titleAuthorParts = titleAuthorPart.split('-by-');
    if (titleAuthorParts.length < 2) {
      return null;
    }
    
    const author = titleAuthorParts.slice(1).join(' ');
    const title = titleAuthorParts[0].split('-').join(' ');
    
    return {
      title: title.replace(/-/g, ' '),
      author: author.replace(/-/g, ' '),
      year: year.replace(/-/g, ' '),
      genre: genre.replace(/-/g, ' '),
      id
    };
  } catch (error) {
    return null;
  }
}

// Helper function to generate slug from book info
export function generateBookSlug(title: string, author: string, year: string, genre: string): string {
  const slugTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slugAuthor = author.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slugYear = year.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slugGenre = genre.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return `book-review-${slugTitle}-by-${slugAuthor}-published-in-${slugYear}-and-${slugGenre}`;
}

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
  publishedYear?: string;
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  // Parse the slug to get book info
  const bookInfo = parseSlug(slug);
  
  // If it's a simple ID (bookInfo is null), we'll pass null bookInfo to the client
  // and let it fetch the post by ID
  
  return (
    <ReviewPageClient 
      slug={slug} 
      bookInfo={bookInfo} 
    />
  );
}
