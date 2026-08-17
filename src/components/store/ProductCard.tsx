'use client';

import React from 'react';
import Link from 'next/link';

export interface ProductVariant {
  size: string;
  stock: number;
}

export interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  images: CloudinaryImage[];
  variants: ProductVariant[];
  isActive: boolean;
  weight?: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { name, slug, sellingPrice, discountPrice, images, variants } = product;

  // Calculate total stock and state
  const totalStock = Array.isArray(variants) 
    ? variants.reduce((acc, curr) => acc + (curr.stock || 0), 0) 
    : 0;
  const isOutOfStock = totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock <= 6;

  // Pricing calculations
  const hasDiscount = Boolean(discountPrice && discountPrice < sellingPrice);
  const currentPrice = hasDiscount ? discountPrice! : sellingPrice;

  // Calculate percentage discount
  const discountPct = hasDiscount 
    ? Math.round(((sellingPrice - discountPrice!) / sellingPrice) * 100) 
    : 0;

  const mainImageUrl = images?.[0]?.secureUrl;
  const hoverImageUrl = images?.[1]?.secureUrl;

  return (
    <Link 
      href={`/product/${slug || ''}`} 
      className="group flex flex-col h-full bg-white/95 border border-primary/15 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/35 hover:-translate-y-1 transition-all duration-300 text-left"
      id={`product-card-${slug}`}
    >
      {/* 1. TOP PRODUCT IMAGE AREA */}
      <div className="relative aspect-[3/4] w-full bg-cream-light/25 overflow-hidden">
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt={name}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center font-serif text-primary/30 bg-cream-light/35 font-bold tracking-widest text-xs">
            FORRABIX
          </div>
        )}

        {/* Hover image (if available) */}
        {hoverImageUrl && (
          <img
            src={hoverImageUrl}
            alt={`${name} hover view`}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}

        {/* Badges Over Image */}
        {isOutOfStock ? (
          <span className="absolute top-3 left-3 bg-red-800 text-white font-sans text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-md shadow-sm">
            SOLD OUT
          </span>
        ) : hasDiscount ? (
          <span className="absolute top-3 left-3 bg-primary text-background font-sans text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-md shadow-sm">
            SALE -{discountPct}%
          </span>
        ) : null}

        {isLowStock && (
          <span className="absolute top-3 right-3 bg-amber-700/90 text-white font-sans text-[9px] font-bold tracking-wider px-2 py-0.5 uppercase rounded-md shadow-sm">
            ONLY {totalStock} LEFT
          </span>
        )}
      </div>

      {/* 2. DEDICATED PRODUCT INFORMATION AREA */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3 bg-card/30">
        
        {/* Top Info Header */}
        <div className="space-y-1">
          <span className="font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-primary/50 uppercase block">
            FORRABIX APPAREL
          </span>
          <h3 className="font-serif text-sm sm:text-base font-bold text-primary tracking-wide leading-snug line-clamp-1 group-hover:text-primary-hover transition-colors">
            {name}
          </h3>
        </div>

        {/* Horizontal Divider */}
        <div className="border-t border-primary/10 pt-3">
          
          {/* Bottom Action Row (Price Left, Button Right) */}
          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="font-sans text-[10px] sm:text-xs text-foreground/45 line-through">
                  ৳{sellingPrice.toLocaleString()}
                </span>
              )}
              <span className="font-sans text-sm sm:text-base font-bold text-primary">
                ৳{currentPrice.toLocaleString()}
              </span>
            </div>

            {/* Action Button */}
            <div>
              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  className="bg-cream-dark/25 text-primary/40 font-sans text-[9px] sm:text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg cursor-not-allowed uppercase"
                >
                  OUT OF STOCK
                </button>
              ) : (
                <span className="bg-primary text-background font-sans text-[9px] sm:text-[10px] font-semibold tracking-wider px-3.5 py-2 rounded-lg uppercase group-hover:bg-primary-hover transition-colors shadow-xs inline-block">
                  VIEW PRODUCT
                </span>
              )}
            </div>
          </div>

        </div>

      </div>
    </Link>
  );
};

export default ProductCard;
