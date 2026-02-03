'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewCardProps {
  id: string;
  title: string;
  author: string;
  bookCover?: string;
  rating: number;
  review: string;
  genre: string;
  userName: string;
  comments: number;
  likes: number;
  createdAt: Date | string;
  publishedYear?: string;
}

// Helper function to generate SEO-friendly slug
function generateBookSlug(title: string, author: string, year: string, genre: string): string {
  const slugTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slugAuthor = author.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slugYear = year.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slugGenre = genre.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return `book-review-${slugTitle}-by-${slugAuthor}-published-in-${slugYear}-and-${slugGenre}`;
}

export default function ReviewCard({
  id,
  title,
  author,
  bookCover,
  rating,
  review,
  genre,
  userName,
  comments,
  likes,
  createdAt,
  publishedYear = '2024',
}: ReviewCardProps) {
  const truncatedReview = review.substring(0, 150) + (review.length > 150 ? '...' : '');
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Generate SEO-friendly slug
  const slug = generateBookSlug(title, author, publishedYear, genre);
  const router = useRouter();
  
  const handleGenreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/browse?genre=${encodeURIComponent(genre)}`);
  };
  
  return (
    <Link href={`/reviews/${slug}`} className="block h-full" title={`Read review of ${title} by ${author}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer bg-card border-border hover:border-primary/30 group">
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            {bookCover ? (
              <img
                src={bookCover || "/placeholder.svg"}
                alt={`Cover of ${title} by ${author}`}
                className="w-16 h-24 object-cover rounded bg-muted flex-shrink-0"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-16 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-muted-foreground text-center px-1">No Cover</span>
              </div>
            )}
            <div className="flex-1 min-w-0 relative">
              <h3 className="font-serif font-bold text-foreground line-clamp-2">{title}</h3>
              <p className="text-sm text-muted-foreground">by {author}</p>
              <p className="text-sm text-muted-foreground">{publishedYear}</p>
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={handleGenreClick}
                  className="text-left"
                >
                  <Badge variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors">{genre}</Badge>
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Rating */}
          <div className="flex items-center gap-1" aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-accent text-accent' : 'text-border'}`}
                aria-hidden="true"
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">({rating.toFixed(1)})</span>
          </div>

          {/* Review Excerpt */}
          <p className="text-sm text-foreground line-clamp-2">{truncatedReview}</p>

          {/* Metadata */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{userName}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Engagement */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>{comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span aria-hidden="true">👍</span>
              <span>{likes}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
