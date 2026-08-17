'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Clock,
  DollarSign,
  Percent
} from 'lucide-react';

interface Coupon {
  _id?: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(0);
  const [minPurchase, setMinPurchase] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiFetch('/coupons/admin/list');
      if (data.success) {
        setCoupons(data.coupons);
      } else {
        setError(data.message || 'Failed to fetch coupons.');
      }
    } catch (err: any) {
      console.error('Error fetching admin coupons:', err);
      setError(err.message || 'Connection failure. Unable to pull coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setCode('');
    setType('percentage');
    setValue(0);
    setMinPurchase(0);
    setMaxDiscount(undefined);
    // Set start date default to today, expiry to 30 days later
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(nextMonth);
    setUsageLimit(100);
    setIsActive(true);
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditId(c._id || null);
    setCode(c.code);
    setType(c.type);
    setValue(c.value);
    setMinPurchase(c.minPurchase);
    setMaxDiscount(c.maxDiscount);
    setStartDate(new Date(c.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(c.endDate).toISOString().split('T')[0]);
    setUsageLimit(c.usageLimit);
    setIsActive(c.isActive);
    setError('');
    setIsFormOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    if (!code.trim()) {
      setError('Coupon code is required.');
      setActionLoading(false);
      return;
    }

    const couponPayload = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minPurchase: Number(minPurchase),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: Number(usageLimit),
      isActive
    };

    try {
      let endpoint = '/coupons/admin/create';
      let method = 'POST';

      if (editId) {
        endpoint = `/coupons/admin/update/${editId}`;
        method = 'PUT';
      }

      const data = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(couponPayload)
      });

      if (data.success) {
        setIsFormOpen(false);
        fetchCoupons();
      } else {
        setError(data.message || 'Failed to save coupon details');
      }
    } catch (err: any) {
      console.error('Error saving coupon details:', err);
      setError(err.message || 'Connection failure. Unable to submit data.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string, codeStr: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${codeStr}"?`)) {
      return;
    }

    try {
      setActionLoading(true);

      const data = await apiFetch(`/coupons/admin/delete/${id}`, {
        method: 'DELETE'
      });

      if (data.success) {
        fetchCoupons();
      } else {
        alert(data.message || 'Failed to delete coupon');
      }
    } catch (err: any) {
      console.error('Error deleting coupon:', err);
      alert(err.message || 'Connection error. Deletion aborted.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-light text-primary">PROMO COUPONS</h1>
          <p className="text-[10px] text-primary/60 tracking-wider uppercase font-semibold mt-0.5">
            Manage storefront discounts and validation rules
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary text-background text-xs font-bold tracking-widest px-4 py-2.5 flex items-center hover:bg-primary-hover transition-colors uppercase pt-3"
          id="admin-add-coupon-btn"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Coupon
        </button>
      </div>

      {/* FORM DRAWER */}
      {isFormOpen && (
        <div className="border border-primary/20 bg-cream-light/10 p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-primary/10">
            <h2 className="font-serif text-lg font-semibold text-primary uppercase">
              {editId ? `EDIT COUPON: ${code}` : 'CREATE NEW PROMO COUPON'}
            </h2>
            <button onClick={() => setIsFormOpen(false)} className="text-primary hover:opacity-70 p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSaveCoupon} className="space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column fields */}
              <div className="space-y-4">
                {/* Code */}
                <div className="space-y-1">
                  <label htmlFor="coupon-code" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Coupon Code</label>
                  <input
                    id="coupon-code"
                    type="text"
                    required
                    placeholder="e.g. FORRABIX10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary font-bold uppercase"
                    disabled={actionLoading}
                  />
                </div>

                {/* Type Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider text-primary uppercase block">Discount Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setType('percentage')}
                      className={`py-2 px-3 border text-xs font-sans transition-all font-medium ${
                        type === 'percentage'
                          ? 'border-primary bg-primary text-background'
                          : 'border-primary/25 hover:border-primary text-primary'
                      }`}
                      disabled={actionLoading}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('fixed')}
                      className={`py-2 px-3 border text-xs font-sans transition-all font-medium ${
                        type === 'fixed'
                          ? 'border-primary bg-primary text-background'
                          : 'border-primary/25 hover:border-primary text-primary'
                      }`}
                      disabled={actionLoading}
                    >
                      Fixed Amount (৳)
                    </button>
                  </div>
                </div>

                {/* Value & Limits */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Discount Value */}
                  <div className="space-y-1">
                    <label htmlFor="coupon-val" className="text-[9px] font-bold tracking-wider text-primary uppercase block">
                      Value {type === 'percentage' ? '(%)' : '(৳)'}
                    </label>
                    <input
                      id="coupon-val"
                      type="number"
                      required
                      min={0}
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                  {/* Min Purchase */}
                  <div className="space-y-1">
                    <label htmlFor="coupon-min-purchase" className="text-[9px] font-bold tracking-wider text-primary uppercase block">Min Purchase (৳)</label>
                    <input
                      id="coupon-min-purchase"
                      type="number"
                      required
                      min={0}
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(Number(e.target.value))}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                  {/* Max Discount */}
                  <div className="space-y-1">
                    <label htmlFor="coupon-max-disc" className="text-[9px] font-bold tracking-wider text-primary uppercase block">Max Discount (৳)</label>
                    <input
                      id="coupon-max-disc"
                      type="number"
                      min={0}
                      placeholder="Optional"
                      value={maxDiscount !== undefined ? maxDiscount : ''}
                      onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column fields */}
              <div className="space-y-4 font-sans">
                {/* Start & Expiry dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="coupon-start" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Start Date</label>
                    <input
                      id="coupon-start"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="coupon-end" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Expiry Date</label>
                    <input
                      id="coupon-end"
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* Usage limit & active */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="coupon-usage-limit" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Usage Limit</label>
                    <input
                      id="coupon-usage-limit"
                      type="number"
                      required
                      min={1}
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(Number(e.target.value))}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold tracking-wider text-primary uppercase block">Coupon Status</label>
                    <label className="flex items-center space-x-2 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="accent-primary h-4 w-4"
                        disabled={actionLoading}
                        id="coupon-isActive-check"
                      />
                      <span className="text-xs text-primary font-medium uppercase tracking-wider">Active</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-primary/10 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 border border-primary/25 text-xs font-bold tracking-widest text-primary hover:bg-primary/5 transition-colors uppercase pt-3.5"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-background px-8 py-2.5 text-xs font-bold tracking-widest hover:bg-primary-hover transition-colors uppercase pt-3.5"
                disabled={actionLoading}
                id="save-coupon-submit"
              >
                {actionLoading ? 'Saving...' : 'Save Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COUPONS TABLE */}
      {loading ? (
        <div className="py-12 text-center text-primary/40 font-sans text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Synchronizing promo coupons...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 border border-primary/10 bg-cream-light/5">
          <Ticket className="h-10 w-10 text-primary/30 stroke-[1.2] mx-auto mb-3" />
          <h3 className="font-serif text-sm font-semibold text-primary uppercase">No Coupons Registered</h3>
          <p className="font-sans text-xs text-primary/60 mt-1">There are no discount coupons currently registered in the database.</p>
        </div>
      ) : (
        <div className="border border-primary/10 overflow-x-auto">
          <table className="w-full text-xs text-left font-sans">
            <thead className="bg-primary text-background font-serif font-bold uppercase tracking-wider text-[9px] border-b border-primary/10">
              <tr>
                <th className="p-3.5 pl-6">Coupon Code</th>
                <th className="p-3.5">Discount Value</th>
                <th className="p-3.5">Min Purchase (৳)</th>
                <th className="p-3.5">Max Discount (৳)</th>
                <th className="p-3.5">Validity Dates</th>
                <th className="p-3.5 text-center">Usage (Count/Limit)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {coupons.map((c) => {
                const now = new Date();
                const hasExpired = new Date(c.endDate) < now;
                const limitReached = c.usageCount >= c.usageLimit;

                return (
                  <tr key={c._id} className="hover:bg-cream-light/5">
                    {/* Code */}
                    <td className="p-3.5 pl-6 font-bold font-mono text-primary text-xs uppercase tracking-wide">
                      {c.code}
                    </td>

                    {/* Value */}
                    <td className="p-3.5 font-semibold">
                      {c.type === 'percentage' ? `${c.value}% OFF` : `৳${c.value.toLocaleString()}`}
                    </td>

                    {/* Min purchase */}
                    <td className="p-3.5">
                      ৳{c.minPurchase.toLocaleString()}
                    </td>

                    {/* Max discount */}
                    <td className="p-3.5 text-foreground/75">
                      {c.maxDiscount ? `৳${c.maxDiscount.toLocaleString()}` : 'No Limit'}
                    </td>

                    {/* Validity */}
                    <td className="p-3.5 text-[10px] text-foreground/75 leading-relaxed text-left">
                      <div>Start: {new Date(c.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(c.endDate).toLocaleDateString()}</div>
                    </td>

                    {/* Usage */}
                    <td className="p-3.5 text-center font-mono">
                      <span className={limitReached ? 'text-red-700 font-bold' : ''}>
                        {c.usageCount} / {c.usageLimit}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide border ${
                        c.isActive && !hasExpired && !limitReached
                          ? 'bg-primary/5 text-primary border-primary/20' 
                          : 'bg-red-50 text-red-700 border-red-200/50'
                      }`}>
                        {hasExpired ? 'Expired' : limitReached ? 'Full' : c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right pr-6">
                      <div className="flex justify-end space-x-3.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="text-primary/70 hover:text-primary p-1"
                          title="Edit coupon"
                          id={`edit-coupon-${c.code}`}
                        >
                          <Edit2 className="h-4 w-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c._id!, c.code)}
                          className="text-primary/55 hover:text-red-700 p-1"
                          title="Delete coupon"
                          id={`delete-coupon-${c.code}`}
                        >
                          <Trash2 className="h-4 w-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
