'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Search, Phone, Menu, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactPhone, setContactPhone] = useState('+8801700000000');

  // Load settings for business phone
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiFetch('/settings');
        if (data.success && data.settings && data.settings.businessPhone) {
          setContactPhone(data.settings.businessPhone);
        }
      } catch (err) {
        console.error('Error fetching settings for header phone:', err);
      }
    };
    fetchSettings();
  }, []);

  // Update search query state when URL changes
  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="inline-block hover:opacity-85 transition-opacity">
            <img
              src="/logo.png"
              alt="FORRABIX Logo"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* SEARCH BAR (DESKTOP) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            id="desktop-search"
            type="text"
            placeholder="Search raw apparel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cream-light/40 border border-primary/20 rounded-none px-4 py-2 pl-10 text-sm focus:outline-none focus:border-primary/80 font-sans tracking-wide"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary/60" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                router.push('/');
              }}
              className="absolute right-3 top-2.5 text-primary/60 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* MOBILE SEARCH TRIGGER, PHONE & CART */}
        <div className="flex-1 flex items-center justify-end space-x-6 sm:space-x-8">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden text-primary hover:opacity-80 p-1"
            aria-label="Search"
            id="mobile-search-btn"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Contact Phone (Desktop preferred) */}
          <a
            href={`tel:${contactPhone}`}
            className="hidden sm:flex items-center text-sm font-sans tracking-wide text-primary/95 hover:opacity-85"
            title="Call Us"
            id="header-phone"
          >
            <Phone className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium">{contactPhone}</span>
          </a>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-1 text-primary hover:opacity-80 transition-opacity"
            id="cart-icon-btn"
          >
            <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-background font-sans text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {totalCartItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* MOBILE SEARCH DRAWER */}
      {isSearchOpen && (
        <div className="md:hidden bg-background border-b border-primary/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search raw apparel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream-light/40 border border-primary/20 rounded-none px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary/80 font-sans tracking-wide"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
            <div className="absolute right-3 top-2 flex items-center space-x-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    router.push('/');
                  }}
                  className="p-1 text-primary/60 hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-primary/80 hover:text-primary font-sans text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
