'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, BookOpen, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            Contact for Book Review
          </h1>
          <p className="text-lg text-muted-foreground">
            Want your book reviewed? Get in touch with us and we'll be happy to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
              Send us a Message
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Your Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label htmlFor="bookTitle" className="block text-sm font-medium text-foreground mb-1">
                  Book Title
                </label>
                <Input
                  id="bookTitle"
                  placeholder="Enter the book title"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-foreground mb-1">
                  Book Author
                </label>
                <Input
                  id="author"
                  placeholder="Enter the book author"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your book and why you'd like a review..."
                  rows={5}
                  className="bg-background border-border"
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                  <p className="text-muted-foreground text-sm">
                    girlwholiketoreadbooks@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <BookOpen className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">What We Review</h3>
                  <p className="text-muted-foreground text-sm">
                    Fiction, Non-Fiction, Fantasy, Mystery, Romance, Biography, Self-Help, and more.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Review Process</h3>
                  <p className="text-muted-foreground text-sm">
                    We read every book carefully and provide honest, thoughtful reviews within 2-3 weeks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
