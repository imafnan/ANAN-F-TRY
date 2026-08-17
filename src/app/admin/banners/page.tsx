'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Upload,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
}

interface Banner {
  _id?: string;
  image: CloudinaryImage;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [image, setImage] = useState<CloudinaryImage | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('SHOP COLLECTION');
  const [ctaUrl, setCtaUrl] = useState('#shop-products');
  const [isActive, setIsActive] = useState(true);

  // Image Upload State
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiFetch('/admin/banners');
      if (data.success) {
        setBanners(data.banners);
      } else {
        setError(data.message || 'Failed to fetch banners list.');
      }
    } catch (err: any) {
      console.error('Error fetching admin banners:', err);
      setError(err.message || 'Connection failure. Unable to pull banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setImage(null);
    setTitle('');
    setSubtitle('');
    setCtaText('SHOP RAW APPAREL');
    setCtaUrl('#shop-products');
    setIsActive(true);
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditId(banner._id || null);
    setImage(banner.image);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setCtaText(banner.ctaText);
    setCtaUrl(banner.ctaUrl);
    setIsActive(banner.isActive);
    setError('');
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('images', files[0]);

    try {
      const data = await apiFetch('/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (data.success && data.images && data.images.length > 0) {
        setImage(data.images[0]);
      } else {
        setError(data.message || 'Image upload failed');
      }
    } catch (err: any) {
      console.error('Upload request error:', err);
      setError(err.message || 'Connection failed. Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    if (!image) {
      setError('A banner image is required.');
      setActionLoading(false);
      return;
    }

    const bannerPayload: Banner = {
      image,
      title: title.trim(),
      subtitle: subtitle.trim(),
      ctaText: ctaText.trim(),
      ctaUrl: ctaUrl.trim(),
      isActive
    };

    try {
      let endpoint = '/admin/banners';
      let method = 'POST';

      if (editId) {
        endpoint = `/admin/banners/${editId}`;
        method = 'PUT';
      }

      const data = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(bannerPayload)
      });

      if (data.success) {
        setIsFormOpen(false);
        fetchBanners();
      } else {
        setError(data.message || 'Failed to save banner details');
      }
    } catch (err: any) {
      console.error('Error saving banner details:', err);
      setError(err.message || 'Connection failure. Unable to submit data.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this banner?')) {
      return;
    }

    try {
      setActionLoading(true);
      const data = await apiFetch(`/admin/banners/${id}`, {
        method: 'DELETE'
      });

      if (data.success) {
        fetchBanners();
      } else {
        alert(data.message || 'Failed to delete banner');
      }
    } catch (err: any) {
      console.error('Error deleting banner:', err);
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
          <h1 className="font-serif text-3xl font-light text-primary">HERO BANNERS</h1>
          <p className="text-[10px] text-primary/60 tracking-wider uppercase font-semibold mt-0.5">
            Configure dynamic full-width promotional hero slides
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary text-background text-xs font-bold tracking-widest px-4 py-2.5 flex items-center hover:bg-primary-hover transition-colors uppercase pt-3"
          id="admin-add-banner-btn"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </button>
      </div>

      {/* FORM DRAWER */}
      {isFormOpen && (
        <div className="border border-primary/20 bg-cream-light/10 p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-primary/10">
            <h2 className="font-serif text-lg font-semibold text-primary uppercase">
              {editId ? 'EDIT PROMO HERO BANNER' : 'CREATE NEW PROMO BANNER'}
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

          <form onSubmit={handleSaveBanner} className="space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column Form Fields */}
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label htmlFor="banner-title" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Header Title</label>
                  <input
                    id="banner-title"
                    type="text"
                    required
                    placeholder="e.g. RAW MINIMAL APPAREL"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary font-medium"
                    disabled={actionLoading}
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <label htmlFor="banner-sub" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Subtitle Sub-text</label>
                  <textarea
                    id="banner-sub"
                    required
                    rows={3}
                    placeholder="Provide supportive brand copy statement..."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary resize-none"
                    disabled={actionLoading}
                  />
                </div>

                {/* CTA Action Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="banner-cta" className="text-[10px] font-bold tracking-wider text-primary uppercase block">CTA Button Label</label>
                    <input
                      id="banner-cta"
                      type="text"
                      required
                      placeholder="e.g. SHOP NOW"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="banner-cta-url" className="text-[10px] font-bold tracking-wider text-primary uppercase block">CTA Button URL</label>
                    <input
                      id="banner-cta-url"
                      type="text"
                      required
                      placeholder="e.g. #shop-products or /about"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider text-primary uppercase block font-sans">Active Status</label>
                  <label className="flex items-center space-x-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-primary h-4 w-4"
                      disabled={actionLoading}
                      id="banner-isActive-check"
                    />
                    <span className="text-xs text-primary font-sans font-medium uppercase tracking-wider">Enable Banner Display</span>
                  </label>
                </div>
              </div>

              {/* Right Column Banner Media Upload */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-primary uppercase block">Banner Image Background</label>
                  <p className="text-[11px] text-primary/60 font-medium mt-0.5">
                    Recommended size: 1920 × 700 px
                  </p>
                </div>
                
                {/* Image Picker */}
                <div className="flex items-center justify-center border border-dashed border-primary/25 bg-background p-4 hover:border-primary transition-all">
                  <label className="flex flex-col items-center justify-center cursor-pointer space-y-1 text-primary">
                    {uploading ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        <span className="font-sans text-[10px] font-bold tracking-wider uppercase">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-primary" />
                        <span className="font-sans text-[10px] font-bold tracking-wider uppercase">Select banner image</span>
                        <span className="text-[9px] text-primary/45 font-light">Best ratio: 16:9 or high resolution</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading || actionLoading}
                      className="hidden"
                      id="banner-file-uploader"
                    />
                  </label>
                </div>

                {/* Preview Large Image */}
                {image && (
                  <div className="relative aspect-[16/9] border border-primary/10 overflow-hidden bg-cream-light/10">
                    <img src={image.secureUrl} alt="Hero Background Preview" className="w-full h-full object-cover object-center" />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-2 right-2 bg-background border border-primary/20 text-primary hover:bg-primary hover:text-background p-1"
                      title="Clear Image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

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
                disabled={actionLoading || uploading}
                id="save-banner-submit"
              >
                {actionLoading ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BANNERS LIST */}
      {loading ? (
        <div className="py-12 text-center text-primary/40 font-sans text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Synchronizing promo banners...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 border border-primary/10 bg-cream-light/5">
          <ImageIcon className="h-10 w-10 text-primary/30 stroke-[1.2] mx-auto mb-3" />
          <h3 className="font-serif text-sm font-semibold text-primary uppercase">No Banners Seeded</h3>
          <p className="font-sans text-xs text-primary/60 mt-1">There are no banners registered. Storefront will render beautiful default visuals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b._id} className="border border-primary/10 bg-cream-light/5 overflow-hidden flex flex-col">
              {/* Banner Cover image */}
              <div className="relative aspect-[16/9] w-full bg-cream-light/10">
                {b.image?.secureUrl ? (
                  <img src={b.image.secureUrl} alt={b.title} className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-primary/20 text-xs">NO IMAGE</div>
                )}
                <span className={`absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide border bg-background/90 ${
                  b.isActive 
                    ? 'text-primary border-primary/20' 
                    : 'text-foreground/40 border-foreground/10'
                }`}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {/* Info & CRUD actions */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                <div className="text-left space-y-1">
                  <h3 className="font-serif text-base font-semibold text-primary">{b.title}</h3>
                  <p className="text-xs text-primary/70 font-light line-clamp-2">{b.subtitle}</p>
                  <p className="text-[10px] text-primary/50 pt-1 font-semibold">
                    CTA: {b.ctaText} → Link: {b.ctaUrl}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-primary/5">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="inline-flex items-center text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                    id={`edit-banner-${b._id}`}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b._id!)}
                    className="inline-flex items-center text-[10px] font-bold text-red-700 hover:underline uppercase tracking-wider"
                    id={`delete-banner-${b._id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
