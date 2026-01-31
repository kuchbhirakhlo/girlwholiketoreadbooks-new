'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold">GB</span>
          </div>
          <span className="hidden sm:inline font-serif text-xl font-semibold text-foreground">girlwholiketoreadbooks</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/browse" className="text-sm text-foreground hover:text-primary transition">
            Browse Reviews
          </Link>
          <Link href="/genres" className="text-sm text-foreground hover:text-primary transition">
            Genres
          </Link>
          <Link href="/contact" className="text-sm text-foreground hover:text-primary transition">
            Contact for Review
          </Link>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md hover:bg-secondary transition-colors relative"
          aria-label="Toggle theme"
        >
          <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="w-5 h-5 absolute top-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col gap-4 px-4 py-4">
            <Link 
              href="/browse" 
              className="text-sm text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Browse Reviews
            </Link>
            <Link 
              href="/genres" 
              className="text-sm text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Genres
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Contact for Review
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
