'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, ApiError, formatMoney } from '@/lib/api';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Printer,
  Truck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  product: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    area: string;
    note?: string;
  };
  items: OrderItem[];
  subtotal?: number;
  coupon?: {
    code: string;
    discount: number;
  };
  discountAmount?: number;
  deliveryCharge?: number;
  grandTotal?: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  orderStatus: string;
  pathao?: {
    booked: boolean;
    consignmentId?: string;
    status?: string;
    statusSlug?: string;
    deliveryFee?: number;
    lastSyncedAt?: string;
  };
  createdAt: string;
}

const ORDER_STATUSES = [
  'ALL',
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned'
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync status filter from URL if present
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && ORDER_STATUSES.includes(statusParam)) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      queryParams.append('page', page.toString());
      queryParams.append('limit', '15');

      const data = await apiFetch(`/orders/admin/list?${queryParams.toString()}`);

      if (data.success) {
        setOrders(data.orders || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      } else {
        setError(data.message || 'Failed to pull order ledger records');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Connection error. Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setActionLoadingId(orderId);
      const data = await apiFetch(`/orders/admin/update-status/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating order status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBookPathao = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      const data = await apiFetch(`/admin/pathao/orders/${orderId}/confirm-book`, {
        method: 'POST'
      });

      if (data.success) {
        alert(`Order booked successfully with Pathao! Consignment ID: ${data.order.pathao.consignmentId}`);
        fetchOrders();
      } else {
        alert(data.message || 'Pathao booking error');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to connect to Pathao Courier service');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefreshPathaoStatus = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      const data = await apiFetch(`/admin/pathao/orders/${orderId}/refresh-status`, {
        method: 'POST'
      });

      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Failed to sync status');
      }
    } catch (err: any) {
      alert(err.message || 'Status sync error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Header Title */}
      <div>
        <h1 className="font-serif text-3xl font-light text-primary">ORDERS LEDGER</h1>
        <p className="text-[10px] text-primary/60 tracking-wider uppercase font-semibold mt-0.5">
          Process checkouts, book pathao couriers, and generate invoices
        </p>
      </div>

      {/* FILTER & SEARCH CONTROL BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-primary/10 bg-cream-light/5 p-4">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-background'
                  : 'bg-background border border-primary/20 text-primary hover:bg-cream-light/35'
              }`}
              id={`order-tab-${status.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex max-w-sm w-full relative">
          <input
            id="order-search-input"
            type="text"
            placeholder="Search Order ID, Name, Phone, Consignment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 pl-9 text-xs focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-primary/60" />
          <button type="submit" className="hidden" />
        </form>

      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="py-12 text-center text-primary/40 font-sans text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Synchronizing orders database...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 border border-primary/10 bg-cream-light/5">
          <ShoppingBag className="h-10 w-10 text-primary/30 stroke-[1.2] mx-auto mb-3" />
          <h3 className="font-serif text-sm font-semibold text-primary uppercase">No Orders Found</h3>
          <p className="font-sans text-xs text-primary/60 mt-1">There are no checkouts registered under this search or filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-primary/10 overflow-x-auto">
            <table className="w-full text-xs text-left font-sans">
              <thead className="bg-primary text-background font-serif font-bold uppercase tracking-wider text-[9px] border-b border-primary/10">
                <tr>
                  <th className="p-3.5 pl-6">Order ID</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer & Address</th>
                  <th className="p-3.5">Garments Purchased</th>
                  <th className="p-3.5">Financials (৳)</th>
                  <th className="p-3.5">Courier Status</th>
                  <th className="p-3.5">Lifecycle</th>
                  <th className="p-3.5 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10 bg-background">
                {orders.map((order) => {
                  const isLoading = actionLoadingId === order._id;
                  const isBooked = order.pathao?.booked;

                  return (
                    <tr key={order._id} className="hover:bg-cream-light/20 transition-colors">
                      
                      {/* Order ID */}
                      <td className="p-3.5 pl-6 font-mono font-bold text-primary">
                        {order.orderId}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-[11px] text-foreground/70">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Customer */}
                      <td className="p-3.5 space-y-0.5">
                        <p className="font-bold text-primary">{order.customer.name}</p>
                        <p className="text-[10px] text-foreground/75 font-mono">{order.customer.phone}</p>
                        <p className="text-[10px] text-foreground/60 max-w-[180px] truncate" title={order.customer.address}>
                          {order.customer.address} ({order.customer.area})
                        </p>
                      </td>

                      {/* Items */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-[11px] text-foreground/85">
                              <span className="font-medium text-primary">{item.name}</span>
                              <span className="text-[10px] text-primary/60"> ({item.size})</span>
                              <span className="font-bold"> x{item.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="p-3.5 space-y-0.5">
                        <p className="font-bold text-primary text-xs">{formatMoney(order.grandTotal || 0)}</p>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 uppercase ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Courier Status */}
                      <td className="p-3.5 space-y-1">
                        {isBooked ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 uppercase">
                              <CheckCircle className="h-2.5 w-2.5 mr-1 text-emerald-600" /> Booked
                            </span>
                            <p className="text-[10px] font-mono text-primary/80">ID: {order.pathao?.consignmentId}</p>
                            <p className="text-[9px] text-foreground/60 capitalize">Status: {order.pathao?.status || 'Active'}</p>
                          </div>
                        ) : (
                          <span className="text-[9px] text-primary/40 uppercase font-bold tracking-wider block">Unbooked</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3.5">
                        <select
                          id={`status-dropdown-${order.orderId}`}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={isLoading}
                          className="bg-background border border-primary/20 rounded-none text-[11px] font-semibold px-2 py-1 focus:outline-none focus:border-primary cursor-pointer"
                        >
                          {ORDER_STATUSES.filter(s => s !== 'ALL').map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right pr-6 space-x-2">
                        {/* Book Pathao */}
                        {!isBooked ? (
                          <button
                            id={`book-pathao-${order.orderId}`}
                            onClick={() => handleBookPathao(order._id)}
                            disabled={isLoading}
                            className="bg-primary text-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors inline-flex items-center"
                            title="Book Pathao Courier"
                          >
                            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3 mr-1" />}
                            Book Pathao
                          </button>
                        ) : (
                          <button
                            id={`sync-pathao-${order.orderId}`}
                            onClick={() => handleRefreshPathaoStatus(order._id)}
                            disabled={isLoading}
                            className="bg-background border border-primary/20 text-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/5 transition-colors inline-flex items-center"
                            title="Sync Status"
                          >
                            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                            Sync
                          </button>
                        )}

                        {/* Invoice Link */}
                        <Link
                          id={`print-invoice-link-${order.orderId}`}
                          href={`/admin/orders/${order._id}/invoice`}
                          target="_blank"
                          className="bg-background border border-primary/20 text-primary p-1.5 hover:bg-primary/5 transition-colors inline-flex items-center"
                          title="View Invoice"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Link>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-primary/60 font-medium">Page {page} of {totalPages}</span>
              <div className="flex space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-background border border-primary/20 text-[10px] font-bold uppercase disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-background border border-primary/20 text-[10px] font-bold uppercase disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
