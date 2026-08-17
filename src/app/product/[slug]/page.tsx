import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductDetailClient from '@/components/store/ProductDetailClient';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const product: any = await Product.findOne({ slug, isActive: true }).lean();
    if (!product) {
      return {
        title: 'Garment Not Found',
        description: 'The collection item you are searching for does not exist or has been archived.'
      };
    }

    const price = product.discountPrice && product.discountPrice < product.sellingPrice
      ? product.discountPrice
      : product.sellingPrice;
    
    const imageUrl = product.images?.[0]?.secureUrl || 'https://forrabix.afnanalamanan.dev/logo.png';
    const pageUrl = `https://forrabix.afnanalamanan.dev/product/${product.slug}`;

    return {
      title: product.name,
      description: product.description 
        ? (product.description.length > 155 ? product.description.slice(0, 155) + '...' : product.description)
        : `Buy ${product.name} at FORRABIX. Price: ৳${price}. Premium minimal apparel constructed to last.`,
      keywords: ['FORRABIX', product.name, 'FORRABIX apparel', 'Bangladesh fashion', 'minimal apparel'],
      alternates: {
        canonical: `/product/${product.slug}`
      },
      openGraph: {
        title: `${product.name} | FORRABIX`,
        description: product.description || `Buy ${product.name} at FORRABIX.`,
        url: pageUrl,
        siteName: 'FORRABIX',
        type: 'website',
        images: [{ url: imageUrl, alt: product.name }]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | FORRABIX`,
        description: product.description || `Buy ${product.name} at FORRABIX.`,
        images: [imageUrl]
      }
    };
  } catch {
    return {
      title: 'Garment Detail | FORRABIX',
      description: 'Explore premium minimal garments by FORRABIX.'
    };
  }
}

export default async function ProductDetailPage(props: ProductPageProps) {
  const { slug } = await props.params;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <ProductDetailClient slug={slug} />
      <Footer />
    </div>
  );
}
