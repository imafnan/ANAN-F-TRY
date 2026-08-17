'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface BannerImage {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
}

interface BannerData {
  image: BannerImage;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
}

export const Hero: React.FC = () => {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const data = await apiFetch('/banners');
        
        if (data.success && data.banners && data.banners.length > 0) {
          // Use the first active banner
          setBanner(data.banners[0]);
        }
      } catch (err) {
        console.error('Error fetching banner for storefront hero:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[55vh] md:h-[70vh] bg-cream-light/20 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-primary/30 tracking-widest font-bold">FORRABIX</h2>
          <p className="font-sans text-xs text-primary/20 tracking-wider mt-2">LOADING EDITORIAL VIEW...</p>
        </div>
      </div>
    );
  }

  const fallbackBanner = {
    image: { publicId: '', secureUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1412&auto=format&fit=crop' },
    title: 'RAW MINIMALISM',
    subtitle: 'Apparel designed to fit the uniform of those who move differently.',
    ctaText: 'SHOP RAW APPAREL',
    ctaUrl: '#shop-products'
  };

  const heroData = banner || fallbackBanner;
  const heroImageUrl = heroData.image?.secureUrl || fallbackBanner.image.secureUrl;
  const heroCtaUrl = heroData.ctaUrl || fallbackBanner.ctaUrl || '#shop-products';
  const heroCtaText = heroData.ctaText || fallbackBanner.ctaText || 'SHOP RAW APPAREL';

  return (
    <section className="relative w-full h-[65vh] md:h-[80vh] flex items-center overflow-hidden bg-background">
      {/* Banner Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[4000ms] scale-100 hover:scale-105"
        style={{ backgroundImage: `url('${heroImageUrl}')` }}
      />
      {/* Editorial Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent md:from-background/90 md:via-background/30" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex flex-col justify-center h-full">
        <div className="max-w-xl md:max-w-2xl text-left space-y-6 animate-in fade-in slide-in-from-left-4 duration-1000">
          
          <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.25em] text-primary uppercase block">
            FORRABIX COLLECTION 2026
          </span>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-primary leading-tight">
            {heroData.title}
          </h1>
          
          <p className="font-sans text-sm sm:text-base text-foreground/80 font-light leading-relaxed max-w-md">
            {heroData.subtitle}
          </p>
          
          <div className="pt-2">
            <Link 
              href={heroCtaUrl}
              className="inline-block bg-primary text-background font-sans text-xs sm:text-sm font-semibold tracking-widest px-8 py-3.5 sm:px-10 sm:py-4 hover:bg-primary-hover transition-colors duration-300 rounded-none shadow-sm hover:shadow-md"
              id="hero-cta"
            >
              {heroCtaText}
            </Link>
          </div>

        </div>
      </div>
      
      {/* Bottom Editorial Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1.5 text-primary/45 hidden md:flex">
        <span className="font-sans text-[8px] font-bold tracking-[0.3em] uppercase">SCROLL</span>
        <div className="w-[1px] h-8 bg-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
};
export default Hero;
