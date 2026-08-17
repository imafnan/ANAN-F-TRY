'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/store/Header';
import Hero from '@/components/store/Hero';
import Footer from '@/components/store/Footer';
import ProductCard, { Product } from '@/components/store/ProductCard';
import { apiFetch } from '@/lib/api';

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch active products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/products');
        
        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err: any) {
        console.error('Error fetching storefront products:', err);
        setError(err.message || 'Unable to connect to the store server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  return (
    <>
      <Hero />

      <main id="shop-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        {/* Section Title */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-primary">
            {searchQuery ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"` : 'SHOP PRODUCTS'}
          </h2>
          <div className="w-12 h-[1px] bg-primary/30" />
          <p className="font-sans text-[10px] sm:text-xs text-primary/60 tracking-widest uppercase">
            {searchQuery ? `${filteredProducts.length} items found` : 'Raw Essentials & Minimal silhouettes'}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col border border-primary/10 rounded-2xl overflow-hidden animate-pulse bg-white/60">
                <div className="bg-cream-light/35 aspect-[3/4] w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-cream-light/45 w-1/3 rounded" />
                  <div className="h-4 bg-cream-light/45 w-2/3 rounded" />
                  <div className="border-t border-primary/5 pt-3 flex justify-between items-center">
                    <div className="h-4 bg-cream-light/45 w-1/4 rounded" />
                    <div className="h-7 bg-cream-light/45 w-1/3 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12 bg-cream-light/10 border border-red-200/40 p-6 max-w-md mx-auto rounded-xl">
            <p className="font-sans text-sm text-red-700/80 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 inline-block bg-primary text-background text-xs font-semibold px-6 py-2 hover:bg-primary-hover transition-colors rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-20 max-w-md mx-auto">
            <h3 className="font-serif text-xl text-primary font-medium tracking-wide">No garments found</h3>
            <p className="font-sans text-xs text-primary/60 mt-2 tracking-wide leading-relaxed">
              We couldn&apos;t find any active items matching your search. Try adjusting your query or browsing our standard catalog.
            </p>
            <button
              onClick={() => window.location.replace('/')}
              className="mt-6 inline-block bg-primary text-background font-sans text-xs font-semibold tracking-widest px-6 py-3 hover:bg-primary-hover transition-colors rounded-lg uppercase"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center bg-background">
          <h2 className="font-serif text-3xl text-primary/30 tracking-widest font-bold animate-pulse">FORRABIX</h2>
        </div>
      }>
        <Header />
        <HomeContent />
        <Footer />
      </Suspense>
    </div>
  );
}
