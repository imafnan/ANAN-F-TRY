import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | FORRABIX',
  description: 'FORRABIX privacy policy outlines how customer data, phone numbers, and addresses are safely handled and protected.',
  alternates: {
    canonical: '/privacy-policy'
  }
};

function PrivacyPolicyContent() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-left font-sans text-xs text-foreground/85 leading-relaxed space-y-10">
        
        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-light tracking-wide text-primary">PRIVACY POLICY</h1>
          <p className="text-[10px] text-primary/65 tracking-wider uppercase font-semibold">Last Updated: May 4, 2026</p>
          <div className="w-12 h-[1px] bg-primary/20 pt-1" />
        </div>

        <div className="space-y-6">
          <p>
            At FORRABIX, we respect your privacy and are committed to protecting the personal data we hold about you. This privacy policy explains how we collect, use, and share information when you visit or make a purchase from our website.
          </p>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">1. INFORMATION WE COLLECT</h3>
            <p>
              When you make a purchase or attempt to make a purchase through the storefront, we collect certain information from you, including your name, billing address, shipping address, payment information (Cash on Delivery indicators), email address, and phone number.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">2. HOW WE USE YOUR INFORMATION</h3>
            <p>
              We use the order information that we collect generally to fulfill any orders placed through the website (including processing your delivery details, arranging for shipping via Pathao Courier API, and providing you with invoices and/or order confirmations). Additionally, we use this order information to communicate with you and screen our orders for potential risk or fraud.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">3. SHARING YOUR INFORMATION</h3>
            <p>
              We share your personal information with third parties to help us use your information, as described above. For example, we use MongoDB to power our database and we share delivery details (recipient name, address, and mobile number) with Pathao Courier Services to execute parcel delivery bookings.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">4. DATA RETENTION</h3>
            <p>
              When you place an order through the website, we will maintain your order records for our operational files unless and until you ask us to delete this information.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-primary uppercase">5. CONTACT US</h3>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <span className="font-semibold text-primary underline">support@forrabix.com</span>.
            </p>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={null}>
      <PrivacyPolicyContent />
    </Suspense>
  );
}
