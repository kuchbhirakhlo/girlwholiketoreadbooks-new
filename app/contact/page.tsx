'use client';

import Link from 'next/link';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, BookOpen, MessageSquare, Instagram, Twitter, Globe, Users, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Linktree-style Social Links */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-border rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Connect With Us
            </h2>
            <p className="text-muted-foreground mb-6">
              Follow us on social media for book reviews, recommendations, and updates
            </p>
            <div className="flex md:flex-row flex-col justify-center gap-4">
              <Link
                href="https://instagram.com/girlwholiketoreadbooks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </Link>
              <Link
                href="https://x.com/gwltoreadbooks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </Link>
              <Link
                href="https://threads.com/girlwholiketoreadbooks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Threads</span>
              </Link>
              <Link
                href="https://goodreads.com/girlwholiketoreadbooks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                <Users className="w-5 h-5" />
                <span>Goodreads</span>
              </Link>
            </div>
          </div>
        </div>

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
