'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Product } from '@/components/store/ProductCard';
import { MessageSquare, ShoppingBag, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected State
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch product detail and website settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Product
        const productData = await apiFetch(`/products/${slug}`);
        
        if (productData.success) {
          setProduct(productData.product);
          if (productData.product.images && productData.product.images.length > 0) {
            setSelectedImage(productData.product.images[0].secureUrl);
          }
        } else {
          setError(productData.message || 'Garment not found');
        }

        // Fetch settings for WhatsApp phone
        try {
          const settingsData = await apiFetch('/settings');
          if (settingsData.success && settingsData.settings) {
            setWhatsappNumber(settingsData.settings.whatsappNumber || '');
          }
        } catch {
          // Non-critical settings failure
        }
      } catch (err: any) {
        console.error('Error fetching product detail page data:', err);
        setError(err.message || 'Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="font-sans text-xs text-primary/60 tracking-widest uppercase">LOADING GARMENT DETAILS...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-primary font-medium">Garment Not Found</h2>
        <p className="font-sans text-xs text-primary/60 mt-2 leading-relaxed">
          The collection item you are searching for does not exist or has been archived by our editorial team.
        </p>
        <Link 
          href="/" 
          className="mt-6 inline-flex items-center text-xs font-semibold tracking-wider text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> BACK TO SHOP
        </Link>
      </div>
    );
  }

  // Stock calculations
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  // Selected variant stock
  const selectedVariant = product.variants.find(v => v.size === selectedSize);
  const availableStock = selectedVariant ? selectedVariant.stock : 0;

  // Pricing
  const hasDiscount = product.discountPrice && product.discountPrice < product.sellingPrice;
  const currentPrice = hasDiscount ? product.discountPrice! : product.sellingPrice;

  const handleAddToCart = () => {
    setActionFeedback(null);

    if (!selectedSize) {
      setActionFeedback({
        type: 'error',
        message: 'Please select a size first.'
      });
      return;
    }

    if (quantity > availableStock) {
      setActionFeedback({
        type: 'error',
        message: `Only ${availableStock} items are currently available in ${selectedSize}.`
      });
      return;
    }

    const addResult = addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0]?.secureUrl || '',
      size: selectedSize,
      quantity: quantity,
      price: currentPrice,
      maxStock: availableStock,
      weight: product.weight || 0.5
    });

    if (addResult.success) {
      setActionFeedback({
        type: 'success',
        message: `${product.name} (${selectedSize}) added to cart.`
      });
      router.push('/cart');
    } else {
      setActionFeedback({
        type: 'error',
        message: addResult.message
      });
    }
  };

  const handleWhatsAppInquiry = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const phoneToUse = whatsappNumber.replace(/[^0-9+]/g, '') || '+8801700000000';
    
    const sizeText = selectedSize ? `Size: ${selectedSize}` : 'Size: Not Selected';
    
    const message = `Hello FORRABIX,
I’m interested in:

Product: ${product.name}
${sizeText}
Price: ৳${currentPrice.toLocaleString()}
Product Link: ${currentUrl}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneToUse}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Structured Data JSON-LD for Product
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map(img => img.secureUrl),
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'FORRABIX'
    },
    offers: {
      '@type': 'Offer',
      url: `https://forrabix.afnanalamanan.dev/product/${product.slug}`,
      priceCurrency: 'BDT',
      price: currentPrice,
      itemCondition: 'https://schema.org/NewCondition',
      availability: totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'FORRABIX'
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full">
          
          {/* Back Navigation */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-xs font-sans font-medium text-primary/70 hover:text-primary transition-colors tracking-widest uppercase"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Shop
            </Link>
          </div>

          {/* Product Details Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* COLUMN 1: EDITORIAL GALLERY */}
            <div className="flex flex-col space-y-4">
              {/* Main Visual */}
              <div className="relative aspect-[3/4] bg-cream-light/20 overflow-hidden border border-primary/5">
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-primary/30">
                    FORRABIX
                  </div>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="font-sans text-xs font-bold tracking-[0.25em] uppercase text-primary border border-primary px-4 py-2 bg-background">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img.secureUrl)}
                      className={`aspect-[3/4] overflow-hidden bg-cream-light/10 border ${
                        selectedImage === img.secureUrl ? 'border-primary ring-[0.5px] ring-primary' : 'border-transparent hover:border-primary/40'
                      } transition-all`}
                    >
                      <img src={img.secureUrl} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN 2: APPAREL META DATA */}
            <div className="flex flex-col space-y-6 text-left">
              <div className="space-y-2">
                <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-primary/65 uppercase">
                  RAW ESSENTIALS
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-primary">
                  {product.name}
                </h1>
              </div>

              {/* Prices */}
              <div className="flex items-center space-x-3.5 pt-1">
                <span className="font-serif text-2xl text-primary font-semibold">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="font-sans text-sm text-foreground/40 line-through decoration-primary/20">
                    ৳{product.sellingPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="w-full h-[1px] bg-primary/10" />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Description</h3>
                <p className="font-sans text-sm font-light text-foreground/80 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="w-full h-[1px] bg-primary/10" />

              {/* SIZES */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Select Size</h3>
                  {selectedSize && (
                    <span className="font-sans text-[10px] font-bold text-primary tracking-wide">
                      {availableStock === 0 
                        ? 'Out of stock' 
                        : `${availableStock} items available`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2 sm:gap-2.5 max-w-full sm:max-w-xs">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                    const sizeVar = product.variants.find(v => v.size === size);
                    const stockCount = sizeVar ? sizeVar.stock : 0;
                    const isSizeOutOfStock = stockCount === 0;

                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (!isSizeOutOfStock) {
                            setSelectedSize(size);
                            setQuantity(1);
                            setActionFeedback(null);
                          }
                        }}
                        className={`h-[44px] w-full flex items-center justify-center font-sans text-xs tracking-wider border transition-all ${
                          isSizeOutOfStock
                            ? 'border-foreground/10 text-foreground/25 line-through cursor-not-allowed bg-foreground/5'
                            : selectedSize === size
                            ? 'border-primary bg-primary text-background font-semibold'
                            : 'border-primary/25 hover:border-primary text-primary'
                        }`}
                        disabled={isSizeOutOfStock}
                        id={`size-btn-${size}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUANTITY SELECTOR */}
              {selectedSize && availableStock > 0 && (
                <div className="space-y-3 pt-1">
                  <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Quantity</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-primary/25">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-3.5 py-2 font-sans hover:bg-cream-light/35 transition-colors text-primary min-w-[40px] flex items-center justify-center"
                        id="qty-minus"
                      >
                        -
                      </button>
                      <span className="px-5 py-2 font-sans text-sm text-primary font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (quantity < availableStock) {
                            setQuantity(q => q + 1);
                            setActionFeedback(null);
                          } else {
                            setActionFeedback({
                              type: 'error',
                              message: `Only ${availableStock} items are currently available in ${selectedSize}.`
                            });
                          }
                        }}
                        className="px-3.5 py-2 font-sans hover:bg-cream-light/35 transition-colors text-primary min-w-[40px] flex items-center justify-center"
                        id="qty-plus"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION NOTIFICATION BANNER */}
              {actionFeedback && (
                <div className={`p-3.5 font-sans text-xs tracking-wide border ${
                  actionFeedback.type === 'success' 
                    ? 'bg-primary/5 border-primary text-primary' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {actionFeedback.message}
                </div>
              )}

              {/* RESPONSIVE ACTION BUTTON CONTAINER */}
              <div className="pt-3 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full sm:flex-1 h-[52px] min-h-[52px] px-6 flex items-center justify-center font-sans text-xs font-bold tracking-widest uppercase transition-colors shrink-0 whitespace-nowrap ${
                    isOutOfStock
                      ? 'bg-foreground/10 text-foreground/35 cursor-not-allowed border border-transparent'
                      : 'bg-primary text-background hover:bg-primary-hover border border-primary'
                  }`}
                  id="add-to-cart-btn"
                >
                  <ShoppingBag className="h-4 w-4 mr-2.5 stroke-[2] shrink-0" />
                  <span className="leading-none">ADD TO CART</span>
                </button>

                {/* WhatsApp Inquiry Button */}
                <button
                  onClick={handleWhatsAppInquiry}
                  className="w-full sm:flex-1 h-[52px] min-h-[52px] px-6 border border-primary flex items-center justify-center font-sans text-xs font-bold tracking-widest uppercase text-primary hover:bg-primary hover:text-background transition-colors shrink-0 whitespace-nowrap"
                  id="whatsapp-inquire-btn"
                >
                  <MessageSquare className="h-4 w-4 mr-2.5 stroke-[2] shrink-0" />
                  <span className="leading-none">WHATSAPP INQUIRY</span>
                </button>
              </div>

              {/* Quality Seals */}
              <div className="pt-4 border-t border-primary/5 flex items-center justify-start space-x-6 text-[10px] text-primary/60 font-sans tracking-wider">
                <span className="flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1 text-primary" /> 100% Premium Cotton
                </span>
                <span className="flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1 text-primary" /> Delivery inside BD
                </span>
              </div>

            </div>

          </div>

        </main>
      </div>
    </>
  );
}
