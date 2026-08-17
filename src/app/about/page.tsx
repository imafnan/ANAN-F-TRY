import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

export const metadata: Metadata = {
  title: 'About FORRABIX | Minimal Raw Apparel',
  description: 'Learn about FORRABIX — minimal, raw, and constructed to last. Created for individuals who move differently.',
  alternates: {
    canonical: '/about'
  }
};

function AboutContent() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* Page title */}
        <div className="text-center space-y-3 mb-16">
          <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-primary/75 uppercase">
            ESTABLISHED 2026
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-wide text-primary uppercase">
            ABOUT FORRABIX
          </h1>
          <div className="w-16 h-[1px] bg-primary/20 mx-auto" />
        </div>

        {/* Editorial Story */}
        <div className="space-y-16 text-left">
          
          {/* Our Story section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <h2 className="md:col-span-4 font-serif text-lg font-bold tracking-wider text-primary uppercase pt-1">
              OUR STORY
            </h2>
            <div className="md:col-span-8 space-y-4">
              <p className="font-serif text-xl sm:text-2xl text-primary font-light italic leading-relaxed">
                &ldquo;FORRABIX was born from a simple idea: create clothing for people who move different.&rdquo;
              </p>
              <p className="font-sans text-sm text-foreground/80 font-light leading-relaxed">
                We believe in minimalism, rawness, and intentional design. Every piece tells a story of authenticity and rebellion against the ordinary. We discard the noise of fast fashion, focusing instead on structural integrity and silhouettes that make a silent statement.
              </p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-primary/10" />

          {/* Our Values section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <h2 className="md:col-span-4 font-serif text-lg font-bold tracking-wider text-primary uppercase pt-1">
              OUR VALUES
            </h2>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-serif text-sm font-semibold text-primary uppercase">MINIMAL</h4>
                <p className="font-sans text-xs text-foreground/75 font-light leading-relaxed">
                  Clean lines, no unnecessary details. Form follows function.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-sm font-semibold text-primary uppercase">RAW</h4>
                <p className="font-sans text-xs text-foreground/75 font-light leading-relaxed">
                  Authentic, unfiltered. We show the material for what it is.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-sm font-semibold text-primary uppercase">EXPRESSIVE</h4>
                <p className="font-sans text-xs text-foreground/75 font-light leading-relaxed">
                  Your style is your voice. Our pieces amplify it.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-primary/10" />

          {/* Quality standards & Why Drop Shoulder */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <h2 className="md:col-span-4 font-serif text-lg font-bold tracking-wider text-primary uppercase pt-1">
              CONSTRUCTION
            </h2>
            <div className="md:col-span-8 space-y-6">
              
              {/* Quality list */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-semibold text-primary uppercase">QUALITY STANDARDS</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans font-medium text-primary/85 pl-1">
                  <li>→ 100% premium cotton blend fabric</li>
                  <li>→ Precision drop shoulder construction</li>
                  <li>→ Ethical manufacturing practices</li>
                  <li>→ Durability tested for everyday wear</li>
                  <li>→ Sustainable packaging</li>
                </ul>
              </div>

              {/* Drop shoulder details */}
              <div className="space-y-3 pt-2">
                <h4 className="font-serif text-sm font-semibold text-primary uppercase">WHY DROP SHOULDER?</h4>
                <p className="font-sans text-xs text-foreground/80 font-light leading-relaxed">
                  The drop shoulder is more than a design choice—it&apos;s a philosophy. It creates an effortless, relaxed silhouette that works for everyone. It&apos;s oversized without being sloppy, comfortable without sacrificing style. It&apos;s the uniform of those who refuse to fit in.
                </p>
              </div>

            </div>
          </div>

          <div className="w-full h-[1px] bg-primary/10" />

          {/* By the numbers */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-6">
            <h2 className="md:col-span-4 font-serif text-lg font-bold tracking-wider text-primary uppercase">
              BY THE NUMBERS
            </h2>
            <div className="md:col-span-8 grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <span className="font-serif text-3xl font-bold text-primary block">24+</span>
                <span className="font-sans text-[10px] text-primary/65 uppercase tracking-wide">Styles</span>
              </div>
              <div className="space-y-1">
                <span className="font-serif text-3xl font-bold text-primary block">100%</span>
                <span className="font-sans text-[10px] text-primary/65 uppercase tracking-wide">Authentic</span>
              </div>
              <div className="space-y-1">
                <span className="font-serif text-3xl font-bold text-primary block">∞</span>
                <span className="font-sans text-[10px] text-primary/65 uppercase tracking-wide">Possibilities</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutContent />
    </Suspense>
  );
}
