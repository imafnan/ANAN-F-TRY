'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  variants: Array<{ size: string; stock: number }>;
}

interface StatsData {
  monthlySales: number;
  monthlyProfit: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiFetch('/orders/admin/stats');
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || 'Failed to retrieve metrics');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard statistics:', err);
      setError(err.message || 'Connection failure. Unable to pull server stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <h1 className="font-serif text-3xl font-light text-primary">PORTAL OVERVIEW</h1>
        <div className="flex items-center space-x-2 text-xs text-primary/60 font-sans">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing real-time ledger metrics...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-32 bg-cream-light/10 border border-primary/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6 text-left">
        <h1 className="font-serif text-3xl font-light text-primary">PORTAL OVERVIEW</h1>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans max-w-md">
          {error || 'Failed to load dashboard metrics.'}
          <button 
            onClick={fetchStats}
            className="block mt-3 underline hover:no-underline font-bold"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-light text-primary">PORTAL OVERVIEW</h1>
          <p className="text-[10px] text-primary/60 tracking-wider uppercase font-semibold mt-0.5">
            Operational ledger and inventory audit control center
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 border border-primary/20 hover:border-primary text-primary transition-all rounded-none bg-background flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider"
          title="Force Sync Ledger"
          id="dashboard-sync-btn"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sync Ledger</span>
        </button>
      </div>

      {/* CORE FINANCIAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Monthly Sales */}
        <div className="border border-primary/10 bg-cream-light/10 p-6 flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-primary/60 tracking-wider uppercase">Monthly Revenue</p>
            <h3 className="font-serif text-3xl font-semibold text-primary">৳{(stats.monthlySales ?? 0).toLocaleString()}</h3>
            <p className="text-[9px] text-primary/45 font-light">Accumulated grand total of current month sales.</p>
          </div>
          <div className="p-3 bg-primary/5 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Monthly Net Profit */}
        <div className="border border-primary/10 bg-cream-light/10 p-6 flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-primary/60 tracking-wider uppercase">Monthly Net Profit</p>
            <h3 className="font-serif text-3xl font-semibold text-primary">৳{(stats.monthlyProfit ?? 0).toLocaleString()}</h3>
            <p className="text-[9px] text-primary/45 font-light">Gross product selling price minus warehouse costs.</p>
          </div>
          <div className="p-3 bg-primary/5 text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Total Catalog Items */}
        <div className="border border-primary/10 bg-cream-light/10 p-6 flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-primary/60 tracking-wider uppercase">Catalog Garments</p>
            <h3 className="font-serif text-3xl font-semibold text-primary">{stats.totalProducts ?? 0}</h3>
            <p className="text-[9px] text-primary/45 font-light">Total garments registered in storefront catalog.</p>
          </div>
          <div className="p-3 bg-primary/5 text-primary">
            <Layers className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ORDER DISTRIBUTION CARDS */}
      <div className="space-y-3">
        <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Order Distribution Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          
          {/* Total */}
          <Link href="/admin/orders" className="border border-primary/10 p-4 hover:bg-cream-light/5 transition-colors">
            <p className="text-[9px] font-bold text-primary/50 uppercase">All Orders</p>
            <h4 className="text-xl font-bold text-primary mt-1">{stats.totalOrders ?? 0}</h4>
          </Link>

          {/* Pending */}
          <Link href="/admin/orders?status=Pending" className="border border-primary/10 p-4 hover:bg-cream-light/5 transition-colors flex justify-between items-center">
            <div>
              <p className="text-[9px] font-bold text-amber-700/80 uppercase">Pending</p>
              <h4 className="text-xl font-bold text-amber-700 mt-1">{stats.pendingOrders ?? 0}</h4>
            </div>
            <Clock className="h-5 w-5 text-amber-700/40" />
          </Link>

          {/* Confirmed */}
          <Link href="/admin/orders?status=Confirmed" className="border border-primary/10 p-4 hover:bg-cream-light/5 transition-colors flex justify-between items-center">
            <div>
              <p className="text-[9px] font-bold text-blue-700/80 uppercase">Confirmed</p>
              <h4 className="text-xl font-bold text-blue-700 mt-1">{stats.confirmedOrders ?? 0}</h4>
            </div>
            <FileCheck className="h-5 w-5 text-blue-700/40" />
          </Link>

          {/* Delivered */}
          <Link href="/admin/orders?status=Delivered" className="border border-primary/10 p-4 hover:bg-cream-light/5 transition-colors flex justify-between items-center">
            <div>
              <p className="text-[9px] font-bold text-primary uppercase">Delivered</p>
              <h4 className="text-xl font-bold text-primary mt-1">{stats.deliveredOrders ?? 0}</h4>
            </div>
            <CheckCircle className="h-5 w-5 text-primary/45" />
          </Link>

          {/* Cancelled */}
          <Link href="/admin/orders?status=Cancelled" className="border border-primary/10 p-4 hover:bg-cream-light/5 transition-colors flex justify-between items-center col-span-2 sm:col-span-1">
            <div>
              <p className="text-[9px] font-bold text-red-700/80 uppercase">Cancelled</p>
              <h4 className="text-xl font-bold text-red-700 mt-1">{stats.cancelledOrders ?? 0}</h4>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-700/40" />
          </Link>

        </div>
      </div>

      {/* LOW STOCK CHECKLIST PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low Stock Panel */}
        <div className="lg:col-span-2 border border-primary/15 p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-primary/10">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <h3 className="font-serif text-sm font-semibold tracking-wider text-primary uppercase">
              Inventory Low Stock Alert ({stats.lowStockCount ?? 0})
            </h3>
          </div>

          {(!stats.lowStockProducts || stats.lowStockProducts.length === 0) ? (
            <p className="text-xs text-primary/65 py-6 text-center">
              All registered garments maintain healthy per-size variant inventory levels.
            </p>
          ) : (
            <div className="divide-y divide-primary/5 max-h-[300px] overflow-y-auto pr-2">
              {stats.lowStockProducts.map((prod) => (
                <div key={prod.id} className="py-3.5 flex items-center justify-between">
                  <div className="text-left space-y-0.5">
                    <p className="font-serif text-xs font-semibold text-primary">{prod.name}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prod.variants.map((v) => (
                        <span 
                          key={v.size} 
                          className="bg-amber-50 border border-amber-200/50 text-amber-800 text-[8px] font-bold tracking-wider px-1.5 py-0.5 uppercase"
                        >
                          Size {v.size}: {v.stock} left
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link 
                    href={`/admin/products?edit=${prod.id}`}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center uppercase tracking-wider pl-4"
                  >
                    Manage <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Guidelines Shortcut */}
        <div className="border border-primary/10 bg-cream-light/10 p-6 space-y-4 text-xs leading-relaxed text-primary/80">
          <h4 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Quick Actions</h4>
          <div className="flex flex-col space-y-2.5">
            <Link 
              href="/admin/products" 
              className="bg-background border border-primary/20 px-4 py-2.5 text-center font-bold tracking-wider hover:bg-primary hover:text-background transition-colors uppercase block"
              id="quick-add-product"
            >
              Add New Garment
            </Link>
            <Link 
              href="/admin/orders?status=Pending" 
              className="bg-background border border-primary/20 px-4 py-2.5 text-center font-bold tracking-wider hover:bg-primary hover:text-background transition-colors uppercase block"
              id="quick-pending-orders"
            >
              Review Pending Orders
            </Link>
            <Link 
              href="/admin/coupons" 
              className="bg-background border border-primary/20 px-4 py-2.5 text-center font-bold tracking-wider hover:bg-primary hover:text-background transition-colors uppercase block"
              id="quick-create-coupon"
            >
              Create Promo Coupon
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
