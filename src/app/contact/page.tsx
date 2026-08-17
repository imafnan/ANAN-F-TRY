import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ContactClient from '@/components/store/ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | FORRABIX',
  description: 'Get in touch with FORRABIX. Contact us via phone, email, or WhatsApp for garment inquiries, orders, and size assistance.',
  alternates: {
    canonical: '/contact'
  }
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
        <ContactClient />
      </Suspense>
      <Footer />
    </div>
  );
}
