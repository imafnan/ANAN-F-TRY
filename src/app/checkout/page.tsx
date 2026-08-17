'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, ShieldCheck, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function CheckoutContent() {
  const router = useRouter();
  const {
    cart,
    coupon,
    deliveryType,
    deliveryCharge,
    setDeliveryLocation,
    subtotal,
    discountAmount,
    grandTotal,
    clearCart
  } = useCart();

  // Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  // Status State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !submitting) {
      router.replace('/cart');
    }
  }, [cart, router, submitting]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide your mobile number.');
      return;
    }
    
    // Bangladesh phone validation
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(phone.trim())) {
      setError('Please enter a valid Bangladesh mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    if (!address.trim()) {
      setError('Please provide your complete delivery address.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          area: deliveryType,
          note: note.trim()
        },
        items: cart.map(item => ({
          product: item.product,
          name: item.name,
          size: item.size,
          quantity: item.quantity
        })),
        couponCode: coupon ? coupon.code : undefined,
        deliveryType
      };

      const data = await apiFetch('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data.success) {
        // Clear cart local storage
        clearCart();
        // Redirect to success page
        router.push(`/order-success/${data.orderId}`);
      } else {
        setError(data.message || 'Failed to place order. Please review stock quantities.');
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      setError(err.message || 'Unable to process the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/cart" 
            className="inline-flex items-center text-xs font-sans tracking-widest text-primary/70 hover:text-primary uppercase font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cart
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* COLUMN 1: DELIVERY FORM (7/12) */}
          <div className="lg:col-span-7 bg-background border border-primary/5 p-6 space-y-6">
            <h2 className="font-serif text-2xl font-light text-primary tracking-wide text-left">DELIVERY INFORMATION</h2>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-sans text-xs flex items-center text-left">
                <AlertCircle className="h-4.5 w-4.5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-5 text-left">
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label htmlFor="customer-name" className="font-serif text-xs font-semibold tracking-wider text-primary uppercase block">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cream-light/20 border border-primary/20 rounded-none px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-primary"
                  disabled={submitting}
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label htmlFor="customer-phone" className="font-serif text-xs font-semibold tracking-wider text-primary uppercase block">
                  Mobile Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  required
                  placeholder="e.g. 017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-cream-light/20 border border-primary/20 rounded-none px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-primary"
                  disabled={submitting}
                />
                <p className="text-[10px] text-primary/50 font-sans">
                  Required for courier booking and delivery verification.
                </p>
              </div>

              {/* Delivery Area Selection */}
              <div className="space-y-2">
                <label className="font-serif text-xs font-semibold tracking-wider text-primary uppercase block">
                  Delivery Area <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('inside')}
                    className={`py-3 px-4 border text-xs font-sans font-medium transition-all ${
                      deliveryType === 'inside'
                        ? 'border-primary bg-primary text-background'
                        : 'border-primary/25 hover:border-primary text-primary'
                    }`}
                    disabled={submitting}
                    id="checkout-area-inside"
                  >
                    Inside Dhaka (৳80)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryLocation('outside')}
                    className={`py-3 px-4 border text-xs font-sans font-medium transition-all ${
                      deliveryType === 'outside'
                        ? 'border-primary bg-primary text-background'
                        : 'border-primary/25 hover:border-primary text-primary'
                    }`}
                    disabled={submitting}
                    id="checkout-area-outside"
                  >
                    Outside Dhaka (৳150)
                  </button>
                </div>
              </div>

              {/* Full Address */}
              <div className="space-y-1.5">
                <label htmlFor="customer-address" className="font-serif text-xs font-semibold tracking-wider text-primary uppercase block">
                  Complete Address <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="customer-address"
                  required
                  rows={3}
                  placeholder="e.g. House 12, Road 5, Sector 4, Uttara, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-cream-light/20 border border-primary/20 rounded-none px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-primary resize-none"
                  disabled={submitting}
                />
              </div>

              {/* Order Note */}
              <div className="space-y-1.5">
                <label htmlFor="customer-note" className="font-serif text-xs font-semibold tracking-wider text-primary uppercase block">
                  Special Instructions / Order Note <span className="text-foreground/45 font-sans">(Optional)</span>
                </label>
                <textarea
                  id="customer-note"
                  rows={2}
                  placeholder="Any guidelines for the courier rider..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-cream-light/20 border border-primary/20 rounded-none px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-primary resize-none"
                  disabled={submitting}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2 pt-2 text-left">
                <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Payment Method</h3>
                <div className="p-4 border border-primary/30 bg-primary/5 flex items-center">
                  <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <div className="text-left font-sans text-xs">
                    <p className="font-semibold text-primary">Cash on Delivery (COD)</p>
                    <p className="text-primary/65 mt-0.5">Pay the courier rider in cash upon receiving your apparel package.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-[54px] bg-primary text-background font-sans text-xs font-bold tracking-widest uppercase flex items-center justify-center hover:bg-primary-hover transition-colors mt-6"
                id="submit-order-btn"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order (Cash on Delivery)'
                )}
              </button>
            </form>
          </div>

          {/* COLUMN 2: SUMMARY PANEL (5/12) */}
          <div className="lg:col-span-5 bg-cream-light/15 border border-primary/10 p-6 space-y-6">
            <h2 className="font-serif text-lg font-medium text-primary tracking-wide text-left">ORDER OVERVIEW</h2>
            
            {/* ITEM CARDS */}
            <div className="max-h-[300px] overflow-y-auto pr-2 divide-y divide-primary/5 border-t border-b border-primary/5">
              {cart.map((item) => (
                <div key={`${item.product}-${item.size}`} className="py-4 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-3">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-16 object-cover object-center bg-cream-light/10"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-cream-light/10 flex items-center justify-center font-serif text-primary/30 text-[9px]">
                        FX
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <p className="font-serif text-xs font-medium text-primary">{item.name}</p>
                      <p className="font-sans text-[9px] text-primary/60 tracking-wider uppercase">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-sans text-xs font-semibold text-primary">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* BREAKDOWN */}
            <div className="space-y-3 font-sans text-xs text-left">
              <div className="flex justify-between text-primary/70">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-primary/70">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-primary/70">
                <span>Delivery Charge ({deliveryType === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span>৳{deliveryCharge.toLocaleString()}</span>
              </div>

              <div className="h-[1px] bg-primary/10 pt-1" />

              <div className="flex justify-between font-serif text-sm font-semibold text-primary">
                <span>Grand Total</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Security Note */}
            <div className="pt-4 border-t border-primary/5 flex items-start text-[10px] text-primary/55 font-sans leading-relaxed text-left">
              <ShieldCheck className="h-4.5 w-4.5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary/80">Secured Checkout Session</p>
                <p className="mt-0.5">Stock reservations are locked for 15 minutes to guarantee shipment availability after confirmation.</p>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
