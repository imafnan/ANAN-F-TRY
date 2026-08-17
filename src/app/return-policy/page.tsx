import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

export const metadata: Metadata = {
  title: 'Return & Exchange Policy | FORRABIX',
  description: 'FORRABIX return and exchange policy. Learn about size replacement, garment inspection, and exchange guidelines.',
  alternates: {
    canonical: '/return-policy'
  }
};

function ReturnPolicyContent() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-left font-sans text-xs text-foreground/85 leading-relaxed">
        
        {/* Title */}
        <div className="space-y-2 mb-12">
          <h1 className="font-serif text-3xl font-light tracking-wide text-primary">RETURN POLICY</h1>
          <p className="text-[10px] text-primary/65 tracking-wider uppercase font-semibold">Last updated: May 4, 2026</p>
          <div className="w-12 h-[1px] bg-primary/20 pt-1" />
        </div>

        <div className="space-y-8">
          
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">1. ELIGIBILITY FOR RETURNS</h3>
            <p>
              We accept returns within 14 days of delivery. To be eligible, items must be unused, unwashed, and in the original packaging with all tags attached.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">2. HOW TO INITIATE A RETURN</h3>
            <p>
              Contact us at <span className="font-semibold text-primary underline">returns@forrabix.com</span> with your order number and reason for return. We&apos;ll provide a return shipping label within 2 business days.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">3. REFUNDS</h3>
            <p>
              Once we receive your return, we&apos;ll inspect it and notify you of approval. Refunds are processed within 5–7 business days to your original payment method. Shipping costs are non-refundable.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">4. EXCHANGES</h3>
            <p>
              For exchanges, please return the original item and place a new order. This ensures you get your desired size/style as quickly as possible.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">5. FINAL SALE ITEMS</h3>
            <p>
              Items marked &ldquo;Final Sale&rdquo; or discounted by 50% or more cannot be returned or exchanged.
            </p>
          </div>

          {/* Questions */}
          <div className="pt-4 border-t border-primary/5 text-center text-primary/60">
            <p>For questions or assistance: <span className="font-semibold text-primary underline">support@forrabix.com</span></p>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function ReturnPolicyPage() {
  return (
    <Suspense fallback={null}>
      <ReturnPolicyContent />
    </Suspense>
  );
}
