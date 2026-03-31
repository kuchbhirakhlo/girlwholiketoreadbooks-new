'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon, User, Bookmark, LogOut, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
          <Link href="/gallery" className="text-sm text-foreground hover:text-primary transition">
            Gallery
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

        {/* User Profile / Sign In */}
        <div className="hidden md:flex items-center gap-4" ref={profileRef}>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-colors"
                aria-label="User menu"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center border-2 border-primary">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-medium text-foreground truncate">{user.displayName || 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/my-list"
                    className="flex items-center gap-3 px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Saved Books</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-secondary transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/reader-login"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

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
              href="/gallery" 
              className="text-sm text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Contact for Review
            </Link>

            {/* Mobile User Section */}
            <div className="border-t border-border pt-4 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-primary">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{user.displayName || 'User'}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link 
                    href="/my-list" 
                    className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition mb-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Bookmark className="w-4 h-4" />
                    Saved Books
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition mb-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 text-sm text-red-500 hover:text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth/reader-login" 
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
