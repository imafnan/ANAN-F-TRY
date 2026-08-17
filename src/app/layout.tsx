import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap'
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://forrabix.afnanalamanan.dev'),
  title: {
    template: '%s | FORRABIX',
    default: 'FORRABIX | Premium Minimal Apparel'
  },
  description: 'Premium minimal apparel for those who move differently. Intentional, raw, and constructed to last. Shop polo shirts, drop shoulder tees, and premium garments.',
  keywords: [
    'FORRABIX',
    'FORRABIX Bangladesh',
    'FORRABIX apparel',
    'FORRABIX clothing',
    'FORRABIX official store',
    'FORRABIX polo',
    'minimalist fashion',
    'minimalist apparel BD',
    'streetwear BD',
    'streetwear clothing Bangladesh',
    'premium apparel',
    'premium polo shirts',
    'drop shoulder t-shirt',
    'oversized t-shirt Bangladesh',
    'bangladesh e-commerce',
    'mens fashion Bangladesh',
    'custom fit garments',
    'raw apparel',
    'urban fashion BD',
    'quality polo t-shirts',
    'online clothing shop Bangladesh'
  ],
  authors: [
    { name: 'FORRABIX', url: 'https://forrabix.afnanalamanan.dev' },
    { name: 'Afnan Alam Anan', url: 'https://afnanalamanan.dev' }
  ],
  creator: 'Afnan Alam Anan',
  publisher: 'FORRABIX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    title: 'FORRABIX | Premium Minimal Apparel',
    description: 'Premium minimal apparel for those who move differently. Intentional, raw, and constructed to last.',
    url: 'https://forrabix.afnanalamanan.dev',
    siteName: 'FORRABIX',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://forrabix.afnanalamanan.dev/logo.png',
        width: 1200,
        height: 630,
        alt: 'FORRABIX Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FORRABIX | Premium Minimal Apparel',
    description: 'Premium minimal apparel for those who move differently. Intentional, raw, and constructed to last.',
    images: ['https://forrabix.afnanalamanan.dev/logo.png'],
    creator: '@forrabix'
  }
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FORRABIX',
  url: 'https://forrabix.afnanalamanan.dev',
  logo: 'https://forrabix.afnanalamanan.dev/logo.png',
  description: 'Premium minimal apparel for those who move differently. Intentional, raw, and constructed to last.',
  sameAs: [
    'https://facebook.com/forrabix',
    'https://instagram.com/forrabix',
    'https://tiktok.com/@forrabix'
  ]
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'FORRABIX',
  url: 'https://forrabix.afnanalamanan.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
