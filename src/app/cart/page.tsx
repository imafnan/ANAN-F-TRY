'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, ArrowLeft, Ticket, Check, AlertCircle } from 'lucide-react';

function CartContent() {
  const {
    cart,
    coupon,
    deliveryType,
    deliveryCharge,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
    setDeliveryLocation,
    subtotal,
    discountAmount,
    grandTotal
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFeedback(null);

    if (!couponInput.trim()) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }

    setCouponLoading(true);
    const res = await applyCouponCode(couponInput.trim());
    setCouponLoading(false);

    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
  };

  const handleQtyChange = (productId: string, size: string, currentQty: number, change: number, maxStock: number) => {
    const newQty = currentQty + change;
    const res = updateQuantity(productId, size, newQty);
    if (!res.success) {
      alert(res.message); // simple notification for stock limit
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto px-4 text-center">
          <ShoppingBag className="h-12 w-12 text-primary/40 stroke-[1.2] mb-4" />
          <h2 className="font-serif text-2xl text-primary font-medium">Your Cart is Empty</h2>
          <p className="font-sans text-xs text-primary/60 mt-2 leading-relaxed">
            There are currently no items in your shopping bag. Explore our collection of premium minimal apparel to find your uniform.
          </p>
          <Link 
            href="/" 
            className="mt-8 inline-block bg-primary text-background font-sans text-xs font-bold tracking-widest px-8 py-3.5 hover:bg-primary-hover transition-colors"
          >
            START SHOPPING
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        
        {/* Title */}
        <div className="mb-10 text-left">
          <h1 className="font-serif text-3xl font-light tracking-wide text-primary">YOUR SHOPPING BAG</h1>
          <p className="font-sans text-[10px] text-primary/60 tracking-wider uppercase mt-1">
            {cart.length} unique garment{cart.length > 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* COLUMN 1: ITEMS (8/12) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="border-t border-b border-primary/10 divide-y divide-primary/5">
              {cart.map((item, idx) => (
                <div key={`${item.product}-${item.size}`} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Product Details */}
                  <div className="flex items-center space-x-4">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-20 object-cover object-center bg-cream-light/20 border border-primary/5"
                      />
                    ) : (
                      <div className="w-16 h-20 flex items-center justify-center bg-cream-light/20 border border-primary/5 font-serif text-primary/30 text-[10px]">
                        FX
                      </div>
                    )}
                    <div className="text-left space-y-1">
                      <h3 className="font-serif text-sm font-medium text-primary hover:underline">
                        <Link href={`/product/${item.product}`}>{item.name}</Link>
                      </h3>
                      <p className="font-sans text-[10px] text-primary/65 tracking-wide uppercase">
                        Size: <span className="font-bold">{item.size}</span>
                      </p>
                      <p className="font-sans text-xs text-foreground/80">
                        ৳{item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>

                  {/* Qty and Subtotal */}
                  <div className="w-full sm:w-auto flex items-center justify-between sm:space-x-12">
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-primary/20">
                      <button
                        onClick={() => handleQtyChange(item.product, item.size, item.quantity, -1, item.maxStock)}
                        className="px-2.5 py-1 text-xs hover:bg-cream-light/35 text-primary"
                        id={`qty-minus-${item.size}`}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-xs text-primary font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.product, item.size, item.quantity, 1, item.maxStock)}
                        className="px-2.5 py-1 text-xs hover:bg-cream-light/35 text-primary"
                        id={`qty-plus-${item.size}`}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="flex items-center space-x-6">
                      <span className="font-sans text-xs font-semibold text-primary">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product, item.size)}
                        className="text-primary/50 hover:text-red-700 p-1.5 transition-colors"
                        title="Remove product"
                        id={`remove-item-${item.size}`}
                      >
                        <Trash2 className="h-4 w-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Back shopping */}
            <div className="pt-2 text-left">
              <Link 
                href="/" 
                className="inline-flex items-center text-xs font-sans tracking-widest text-primary/70 hover:text-primary uppercase font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* COLUMN 2: SUMMARY (4/12) */}
          <div className="lg:col-span-4 bg-cream-light/15 border border-primary/10 p-6 space-y-6">
            <h2 className="font-serif text-lg font-medium text-primary tracking-wide text-left">ORDER SUMMARY</h2>
            
            {/* DELIVERY AREA SELECTOR */}
            <div className="space-y-3 text-left">
              <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Delivery Destination</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer text-xs font-sans text-primary">
                  <input
                    type="radio"
                    name="delivery_loc"
                    checked={deliveryType === 'inside'}
                    onChange={() => setDeliveryLocation('inside')}
                    className="accent-primary h-3.5 w-3.5"
                    id="delivery-inside-dhaka"
                  />
                  <span>Inside Dhaka (৳80)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer text-xs font-sans text-primary">
                  <input
                    type="radio"
                    name="delivery_loc"
                    checked={deliveryType === 'outside'}
                    onChange={() => setDeliveryLocation('outside')}
                    className="accent-primary h-3.5 w-3.5"
                    id="delivery-outside-dhaka"
                  />
                  <span>Outside Dhaka (৳150)</span>
                </label>
              </div>
            </div>

            <div className="h-[1px] bg-primary/10" />

            {/* COUPON SYSTEM */}
            <div className="space-y-3 text-left">
              <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Apply Coupon</h3>
              {coupon ? (
                <div className="flex items-center justify-between bg-primary/5 border border-primary/30 p-2.5 text-xs text-primary font-sans">
                  <span className="flex items-center">
                    <Check className="h-4 w-4 mr-1.5 stroke-[2.5]" />
                    Code <span className="font-bold ml-1">{coupon.code}</span> applied
                  </span>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-[10px] font-bold underline hover:no-underline uppercase tracking-wider pl-4"
                    id="remove-coupon-btn"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    id="coupon-input"
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-grow bg-background border border-primary/25 px-3 py-2 text-xs font-sans focus:outline-none focus:border-primary uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-primary text-background px-4 py-2 text-xs font-semibold font-sans hover:bg-primary-hover transition-colors flex items-center justify-center"
                    id="apply-coupon-btn"
                  >
                    <Ticket className="h-3.5 w-3.5 mr-1" /> Apply
                  </button>
                </form>
              )}

              {couponFeedback && (
                <div className={`mt-2 p-2 flex items-center font-sans text-[10px] tracking-wide ${
                  couponFeedback.type === 'success' ? 'text-primary' : 'text-red-700 font-medium'
                }`}>
                  {couponFeedback.type === 'error' && <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />}
                  {couponFeedback.message}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-primary/10" />

            {/* PRICE BREAKDOWN */}
            <div className="space-y-3.5 font-sans text-xs text-left">
              <div className="flex justify-between text-primary/75">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-primary/75">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-primary/75">
                <span>Delivery Charge</span>
                <span>৳{deliveryCharge.toLocaleString()}</span>
              </div>

              <div className="h-[1px] bg-primary/10 pt-1" />

              <div className="flex justify-between font-serif text-sm font-semibold text-primary">
                <span>Grand Total</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* CHECKOUT BUTTON */}
            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full h-[52px] bg-primary text-background font-sans text-xs font-bold tracking-widest uppercase flex items-center justify-center hover:bg-primary-hover transition-colors"
                id="proceed-checkout-btn"
              >
                Proceed to Checkout
              </Link>
              <p className="text-[9px] text-primary/50 text-center mt-3 font-sans">
                By clicking proceed, your cart is validated against real-time warehouse inventory.
              </p>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartContent />
    </Suspense>
  );
}
