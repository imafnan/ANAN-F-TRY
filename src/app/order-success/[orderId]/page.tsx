'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { CheckCircle, Printer, ShoppingBag, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface OrderSuccessProps {
  params: Promise<{ orderId: string }>;
}

function OrderSuccessContent({ params }: OrderSuccessProps) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/orders/public-detail/${orderId}`);
        
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || 'Order details not found');
        }
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Connection failed. Unable to fetch confirmation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-sans text-xs text-primary/60 tracking-wider uppercase">Loading receipt...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl text-primary font-medium">Receipt Error</h2>
          <p className="font-sans text-xs text-primary/60 mt-2 leading-relaxed">
            {error || 'Unable to retrieve order confirmation details.'}
          </p>
          <Link 
            href="/" 
            className="mt-6 inline-flex items-center text-xs font-semibold tracking-wider text-primary hover:underline"
          >
            BACK TO SHOP
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="no-print">
        <Header />
      </div>

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-12">
        
        {/* SUCCESS ICON & HERO (no-print) */}
        <div className="text-center space-y-4 mb-10 no-print">
          <CheckCircle className="h-16 w-16 text-primary stroke-[1.2] mx-auto animate-bounce" />
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-light text-primary">THANK YOU FOR YOUR ORDER</h1>
            <p className="font-sans text-xs text-primary/60 tracking-wider uppercase">
              Order reference: <span className="font-bold text-primary">{order.orderId}</span>
            </p>
          </div>
          <p className="font-sans text-xs text-foreground/80 max-w-md mx-auto leading-relaxed font-light">
            Your e-commerce invoice has been generated. The order status is currently <span className="font-bold text-primary uppercase">Pending</span>. Our support team will confirm details shortly.
          </p>
          
          <div className="pt-2 flex justify-center space-x-4">
            <button
              onClick={handlePrint}
              className="inline-flex items-center bg-primary text-background font-sans text-xs font-bold tracking-widest px-6 py-3 hover:bg-primary-hover transition-colors"
              id="print-invoice-btn"
            >
              <Printer className="h-4 w-4 mr-2" /> PRINT INVOICE
            </button>
            <Link
              href="/"
              className="inline-flex items-center border border-primary/45 text-primary font-sans text-xs font-bold tracking-widest px-6 py-3 hover:bg-primary hover:text-background transition-colors"
              id="back-shop-btn"
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> CONTINUE SHOPPING
            </Link>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div className="bg-background border border-primary/20 p-6 sm:p-10 space-y-8 print:border-none print:p-0">
          
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-primary/10 pb-6">
            <div className="text-left space-y-1">
              <img 
                src="/logo.png" 
                alt="FORRABIX Logo" 
                className="h-8 w-auto object-contain mb-1" 
              />
              <p className="font-sans text-[9px] text-primary/60 tracking-wider uppercase">PREMIUM MINIMAL APPAREL</p>
            </div>
            <div className="text-right space-y-1 font-sans text-xs text-foreground/75">
              <p className="font-bold text-primary font-serif text-sm">INVOICE</p>
              <p>Invoice No: FX-INV-{order.orderId.replace(/^(FXW|FX)-/i, '')}</p>
              <p>Order ID: {order.orderId}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left font-sans text-xs">
            <div className="space-y-1">
              <h4 className="font-serif text-[10px] font-bold tracking-wider text-primary uppercase">DELIVERY TO:</h4>
              <p className="font-semibold text-primary">{order.customer.name}</p>
              <p className="text-foreground/80">{order.customer.address}</p>
              <p className="text-foreground/80">Area: {order.customer.area}</p>
              <p className="text-foreground/80">Phone: {order.customer.phone}</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <h4 className="font-serif text-[10px] font-bold tracking-wider text-primary uppercase sm:text-right">PAYMENT DETAILS:</h4>
              <p className="font-semibold text-primary">Method: Cash on Delivery</p>
              <p className="text-foreground/80">Status: {order.paymentStatus}</p>
              {order.customer.note && (
                <div className="mt-2 text-left sm:text-right">
                  <p className="font-bold text-primary/75">Order Note:</p>
                  <p className="italic text-foreground/70">{order.customer.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse font-sans text-xs text-left">
            <thead>
              <tr className="border-b border-primary/20 text-primary font-serif font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Item</th>
                <th className="py-2.5 text-center">Size</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {order.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3.5 font-medium text-primary">{item.name}</td>
                  <td className="py-3.5 text-center uppercase">{item.size}</td>
                  <td className="py-3.5 text-center">{item.quantity}</td>
                  <td className="py-3.5 text-right">৳{item.price.toLocaleString()}</td>
                  <td className="py-3.5 text-right">৳{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div className="flex justify-end pt-4 border-t border-primary/10">
            <div className="w-64 font-sans text-xs space-y-2.5 text-left">
              <div className="flex justify-between text-foreground/85">
                <span>Subtotal</span>
                <span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              
              {order.coupon && order.discountAmount > 0 && (
                <div className="flex justify-between text-foreground/85">
                  <span>Coupon Discount ({order.coupon.code})</span>
                  <span>-৳{order.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-foreground/85">
                <span>Delivery Charge</span>
                <span>৳{order.deliveryCharge.toLocaleString()}</span>
              </div>

              <div className="h-[1px] bg-primary/20 pt-1" />

              <div className="flex justify-between font-serif text-sm font-semibold text-primary">
                <span>Grand Total</span>
                <span>৳{order.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-primary/5 pt-6 text-center font-sans text-[10px] text-primary/50 space-y-1">
            <p>If you have any questions, please contact support@forrabix.com or call our helpline.</p>
            <p>Thank you for choosing FORRABIX. Raw Intentional Construction.</p>
          </div>

        </div>

      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}

export default function OrderSuccessPage(props: OrderSuccessProps) {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent {...props} />
    </Suspense>
  );
}
