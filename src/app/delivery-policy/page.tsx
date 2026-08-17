import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

export const metadata: Metadata = {
  title: 'Delivery Policy | FORRABIX',
  description: 'FORRABIX delivery policy details regarding shipping times, processing, coverage inside and outside Dhaka, and courier tracking.',
  alternates: {
    canonical: '/delivery-policy'
  }
};

function DeliveryPolicyContent() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-left font-sans text-xs text-foreground/85 leading-relaxed">
        
        {/* Title */}
        <div className="space-y-2 mb-12">
          <h1 className="font-serif text-3xl font-light tracking-wide text-primary">DELIVERY POLICY</h1>
          <p className="text-[10px] text-primary/65 tracking-wider uppercase font-semibold">Effective: May 4, 2026</p>
          <div className="w-12 h-[1px] bg-primary/20 pt-1" />
        </div>

        <div className="space-y-8">
          
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">PROCESSING TIME</h3>
            <p>
              Orders are processed within 1–3 business days (excluding weekends/holidays). You&apos;ll receive a confirmation email with tracking once shipped.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">SHIPPING METHODS & DELIVERY TIMES</h3>
            <p>We provide multiple shipping tiers for our global customer base:</p>
            <ul className="list-disc pl-5 space-y-1 pt-1 font-medium text-primary/90">
              <li>Standard Shipping – 5–7 business days | $5.99 (free on orders $75+)</li>
              <li>Express Shipping – 2–3 business days | $12.99</li>
              <li>Overnight Shipping – 1 business day | $24.99</li>
            </ul>
            <p className="italic text-foreground/60 pt-1">
              * Delivery times are estimates and may vary due to carrier delays or weather.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">INTERNATIONAL SHIPPING</h3>
            <p>
              We ship worldwide. International delivery takes 7–15 business days. Customs fees, taxes, or duties are the responsibility of the customer.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">TRACKING & ISSUES</h3>
            <p>
              Track your order via the link in your shipping confirmation. If your package shows &ldquo;delivered&rdquo; but you haven&apos;t received it, contact the carrier first, then email <span className="font-semibold text-primary underline">shipping@forrabix.com</span> within 5 days.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">CHANGE OF ADDRESS</h3>
            <p>
              Please double-check your address at checkout. If you need to change it, email us within 2 hours of placing the order. After that, the order may already be in processing.
            </p>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function DeliveryPolicyPage() {
  return (
    <Suspense fallback={null}>
      <DeliveryPolicyContent />
    </Suspense>
  );
}
