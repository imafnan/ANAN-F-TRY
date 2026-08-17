'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Printer, ArrowLeft } from 'lucide-react';
import { apiFetch, formatMoney } from '@/lib/api';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function OrderInvoicePage({ params }: InvoicePageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/orders/admin/detail/${id}`);
        
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || 'Invoice details not found');
        }
      } catch (err: any) {
        console.error('Error fetching order invoice:', err);
        setError(err.message || 'Connection failed. Unable to fetch order ledger.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, router]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <RefreshCw className="h-6 w-6 text-primary animate-spin mx-auto" />
          <p className="text-xs text-primary/65 uppercase tracking-wider">Generating Invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans max-w-md mx-auto text-center px-4">
        <h2 className="font-serif text-2xl text-primary font-medium">Invoice Error</h2>
        <p className="text-xs text-primary/60 mt-2">{error || 'Unable to retrieve order details.'}</p>
        <button 
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center text-xs font-bold text-primary hover:underline uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-10 font-sans text-xs print:p-0 print:bg-white">
      
      {/* Global Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Control Actions (no-print) */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center no-print">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-bold text-primary/75 hover:text-primary uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Ledger
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center bg-primary text-background text-xs font-bold tracking-widest px-6 py-3 hover:bg-primary-hover transition-colors"
          id="print-invoice-action-btn"
        >
          <Printer className="h-4 w-4 mr-2" /> PRINT INVOICE
        </button>
      </div>

      {/* INVOICE CONTAINER (A4 printable size) */}
      <div className="max-w-3xl mx-auto bg-background border border-primary/20 p-8 sm:p-12 space-y-6 sm:space-y-10 print:space-y-4 print:border-none print:p-0 print:max-w-none print:w-full print:bg-transparent print:m-0">
        
        {/* Header Branding */}
        <div className="flex justify-between items-start border-b border-primary/10 pb-6 print:pb-3 break-inside-avoid print:break-inside-avoid">
          <div className="text-left space-y-1">
            <img
              src="/logo.png"
              alt="FORRABIX Logo"
              className="h-8 w-auto object-contain mb-1"
            />
            <p className="text-[9px] text-primary/60 tracking-wider uppercase font-semibold">PREMIUM MINIMAL APPAREL</p>
          </div>
          <div className="text-right space-y-1 text-foreground/80 font-sans text-xs">
            <h2 className="font-bold text-primary font-serif text-base tracking-wider uppercase">INVOICE</h2>
            <p>Invoice No: FX-INV-{order.orderId.replace(/^(FXW|FX)-/i, '')}</p>
            <p>Order ID: {order.orderId}</p>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Order Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:gap-4 text-left font-sans text-xs break-inside-avoid print:break-inside-avoid">
          <div className="space-y-1.5">
            <h4 className="font-serif text-[10px] font-bold tracking-wider text-primary uppercase">DELIVERY DESTINATION:</h4>
            <p className="font-semibold text-primary">{order.customer.name}</p>
            <p className="text-foreground/80">{order.customer.address}</p>
            <p className="text-foreground/80">Area: {order.customer.area}</p>
            <p className="text-foreground/80">Phone: {order.customer.phone}</p>
          </div>
          <div className="space-y-1.5 sm:text-right">
            <h4 className="font-serif text-[10px] font-bold tracking-wider text-primary uppercase sm:text-right">ORDER SPECIFICS:</h4>
            <p className="font-semibold text-primary">Payment Method: Cash on Delivery</p>
            <p className="text-foreground/80">Payment Status: {order.paymentStatus}</p>
            <p className="text-foreground/80">Order Status: {order.orderStatus}</p>
            {order.pathao?.booked && (
              <div className="pt-2 text-left sm:text-right space-y-0.5">
                <p className="font-semibold text-primary">Pathao Consignment:</p>
                <p className="font-mono text-foreground/80">{order.pathao?.consignmentId}</p>
                <p className="text-[10px] text-foreground/75 uppercase">Courier Status: {order.pathao?.status}</p>
              </div>
            )}
          </div>
        </div>

        {/* Special Instructions (Optional) */}
        {order.customer.note && (
          <div className="bg-cream-light/20 p-4 print:p-2 text-left border-l-2 border-primary/20 break-inside-avoid print:break-inside-avoid">
            <p className="font-serif text-[10px] font-bold tracking-wider text-primary uppercase">Customer Instructions / Note:</p>
            <p className="font-sans text-xs text-foreground/80 italic mt-1 leading-relaxed">
              &ldquo;{order.customer.note}&rdquo;
            </p>
          </div>
        )}

        {/* Invoice Items Table */}
        <div className="break-inside-avoid print:break-inside-avoid">
          <table className="w-full border-collapse font-sans text-xs text-left">
            <thead>
              <tr className="border-b border-primary/25 text-primary font-serif font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 print:py-1.5">Garment Details</th>
                <th className="py-2.5 print:py-1.5 text-center">Size</th>
                <th className="py-2.5 print:py-1.5 text-center">Qty</th>
                <th className="py-2.5 print:py-1.5 text-right">Unit Price</th>
                <th className="py-2.5 print:py-1.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {order.items.map((item: any, idx: number) => (
                <tr key={idx} className="align-middle">
                  <td className="py-4 print:py-2 text-left font-medium text-primary">{item.name}</td>
                  <td className="py-4 print:py-2 text-center uppercase font-bold">{item.size}</td>
                  <td className="py-4 print:py-2 text-center">{item.quantity}</td>
                  <td className="py-4 print:py-2 text-right">৳{formatMoney(item.price)}</td>
                  <td className="py-4 print:py-2 text-right font-medium">৳{formatMoney(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Pricing Breakdown */}
        <div className="flex justify-end pt-4 print:pt-2 border-t border-primary/10 break-inside-avoid print:break-inside-avoid">
          <div className="w-64 font-sans text-xs space-y-2.5 print:space-y-1.5 text-left">
            <div className="flex justify-between text-foreground/85">
              <span>Subtotal</span>
              <span>৳{formatMoney(order.subtotal)}</span>
            </div>
            
            {Boolean(order.coupon && order.discountAmount && order.discountAmount > 0) && (
              <div className="flex justify-between text-foreground/85">
                <span>Coupon Discount ({order.coupon.code})</span>
                <span>-৳{formatMoney(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-foreground/85">
              <span>Delivery Charge</span>
              <span>৳{formatMoney(order.deliveryCharge)}</span>
            </div>

            <div className="h-[1px] bg-primary/25 pt-1" />

            <div className="flex justify-between font-serif text-sm font-semibold text-primary">
              <span>Grand Total</span>
              <span>৳{formatMoney(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer note */}
        <div className="border-t border-primary/5 pt-6 print:pt-3 text-center text-primary/50 text-[10px] space-y-1 font-sans break-inside-avoid print:break-inside-avoid">
          <p>This invoice is electronically generated and represents a binding order ledger copy.</p>
          <p>For questions or support, email support@forrabix.com or call our helpline.</p>
          <p className="font-semibold font-serif text-[11px] tracking-widest text-primary pt-2 uppercase">
            FORRABIX - RAW MINIMAL DESIGN
          </p>
        </div>

      </div>

    </div>
  );
}
