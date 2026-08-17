'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Upload,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

interface Variant {
  size: string;
  stock: number;
}

interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
}

interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  images: CloudinaryImage[];
  variants: Variant[];
  weight: number;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [weight, setWeight] = useState(0.5);
  const [isActive, setIsActive] = useState(true);
  
  // Per Size stock input
  const [stockS, setStockS] = useState(0);
  const [stockM, setStockM] = useState(0);
  const [stockL, setStockL] = useState(0);
  const [stockXL, setStockXL] = useState(0);
  const [stockXXL, setStockXXL] = useState(0);

  // File Upload State
  const [uploading, setUploading] = useState(false);

  // Load products list
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiFetch('/admin/products');
      
      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      console.error('Error fetching admin products:', err);
      setError(err.message || 'Connection failure. Unable to pull products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Watch for edit param in URL (e.g. from dashboard guidelines)
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam && products.length > 0) {
      const prod = products.find(p => p._id === editParam);
      if (prod) {
        handleOpenEdit(prod);
      }
    }
  }, [searchParams, products]);

  // Slug generator helper
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editId) {
      // Auto slugify
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
          .replace(/\s+/g, '-') // collapse whitespace and replace by -
          .replace(/-+/g, '-') // collapse dashes
      );
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setDescription('');
    setCostPrice(0);
    setSellingPrice(0);
    setDiscountPrice(undefined);
    setImages([]);
    setWeight(0.5);
    setIsActive(true);
    
    setStockS(0);
    setStockM(0);
    setStockL(0);
    setStockXL(0);
    setStockXXL(0);
    
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditId(prod._id || null);
    setName(prod.name);
    setSlug(prod.slug);
    setDescription(prod.description);
    setCostPrice(prod.costPrice);
    setSellingPrice(prod.sellingPrice);
    setDiscountPrice(prod.discountPrice);
    setImages(prod.images);
    setWeight(prod.weight);
    setIsActive(prod.isActive);

    // Map variant stocks
    const getStock = (size: string) => prod.variants.find(v => v.size === size)?.stock || 0;
    setStockS(getStock('S'));
    setStockM(getStock('M'));
    setStockL(getStock('L'));
    setStockXL(getStock('XL'));
    setStockXXL(getStock('XXL'));

    setError('');
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const data = await apiFetch('/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (data.success && data.images) {
        setImages([...images, ...data.images]);
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

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleMakePrimaryImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setImages(newImages);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    const productPayload: Product = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      discountPrice: discountPrice !== undefined && discountPrice > 0 ? Number(discountPrice) : undefined,
      images,
      variants: [
        { size: 'S', stock: Number(stockS) },
        { size: 'M', stock: Number(stockM) },
        { size: 'L', stock: Number(stockL) },
        { size: 'XL', stock: Number(stockXL) },
        { size: 'XXL', stock: Number(stockXXL) }
      ],
      weight: Number(weight),
      isActive
    };

    try {
      let endpoint = '/admin/products';
      let method = 'POST';

      if (editId) {
        endpoint = `/admin/products/${editId}`;
        method = 'PUT';
      }

      const data = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(productPayload)
      });

      if (data.success) {
        setIsFormOpen(false);
        fetchProducts();
      } else {
        setError(data.message || 'Failed to save product details');
      }
    } catch (err: any) {
      console.error('Error saving product details:', err);
      setError(err.message || 'Connection failure. Unable to submit data.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${prodName}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const data = await apiFetch(`/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (data.success) {
        fetchProducts();
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
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
          <h1 className="font-serif text-3xl font-light text-primary">GARMENT CATALOG</h1>
          <p className="text-[10px] text-primary/60 tracking-wider uppercase font-semibold mt-0.5">
            Create, edit, and audit garments inventory per-size
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary text-background text-xs font-bold tracking-widest px-4 py-2.5 flex items-center hover:bg-primary-hover transition-colors uppercase pt-3"
          id="admin-add-product-btn"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Garment
        </button>
      </div>

      {/* FORM DRAWER */}
      {isFormOpen && (
        <div className="border border-primary/20 bg-cream-light/10 p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-primary/10">
            <h2 className="font-serif text-lg font-semibold text-primary uppercase">
              {editId ? `EDIT GARMENT: ${name}` : 'CREATE NEW GARMENT'}
            </h2>
            <button 
              onClick={() => setIsFormOpen(false)} 
              className="text-primary hover:opacity-70 p-1"
              id="close-form-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProduct} className="space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column Fields */}
              <div className="space-y-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label htmlFor="form-prod-name" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Garment Name</label>
                  <input
                    id="form-prod-name"
                    type="text"
                    required
                    placeholder="e.g. Premium Polo Shirt"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    disabled={actionLoading}
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label htmlFor="form-prod-slug" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Slug Reference</label>
                  <input
                    id="form-prod-slug"
                    type="text"
                    required
                    placeholder="e.g. premium-polo-shirt"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    disabled={actionLoading}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label htmlFor="form-prod-desc" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Description</label>
                  <textarea
                    id="form-prod-desc"
                    required
                    rows={4}
                    placeholder="Describe material construct, drop shoulder lines, fit..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary resize-none"
                    disabled={actionLoading}
                  />
                </div>

                {/* Pricing Fields */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Cost Price */}
                  <div className="space-y-1">
                    <label htmlFor="form-cost-price" className="text-[9px] font-bold tracking-wider text-primary uppercase block">Cost Price (৳)</label>
                    <input
                      id="form-cost-price"
                      type="number"
                      required
                      min={0}
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                  {/* Selling Price */}
                  <div className="space-y-1">
                    <label htmlFor="form-sell-price" className="text-[9px] font-bold tracking-wider text-primary uppercase block">Selling Price (৳)</label>
                    <input
                      id="form-sell-price"
                      type="number"
                      required
                      min={0}
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                  {/* Discount Price */}
                  <div className="space-y-1">
                    <label htmlFor="form-disc-price" className="text-[9px] font-bold tracking-wider text-primary uppercase block">Discount Price (৳)</label>
                    <input
                      id="form-disc-price"
                      type="number"
                      min={0}
                      placeholder="Optional"
                      value={discountPrice !== undefined ? discountPrice : ''}
                      onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* Status & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="form-weight" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Weight (KG)</label>
                    <input
                      id="form-weight"
                      type="number"
                      step="0.1"
                      required
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider text-primary uppercase block">Garment Status</label>
                    <label className="flex items-center space-x-2 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="accent-primary h-4 w-4"
                        disabled={actionLoading}
                        id="form-isActive-check"
                      />
                      <span className="text-xs text-primary font-sans font-medium uppercase tracking-wider">Active Catalog Item</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Right Column (Variants stock & image gallery uploads) */}
              <div className="space-y-4">
                
                {/* Stock variant grid */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-wider text-primary uppercase block">Per Size Variant Inventory Stock</label>
                  <div className="grid grid-cols-5 gap-2">
                    {/* S */}
                    <div className="space-y-1 text-center">
                      <span className="text-[9px] font-bold tracking-wider text-primary block">S</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={stockS}
                        onChange={(e) => setStockS(Number(e.target.value))}
                        className="w-full bg-background border border-primary/20 rounded-none px-2 py-1.5 text-xs text-center focus:outline-none focus:border-primary"
                        id="stock-input-S"
                      />
                    </div>
                    {/* M */}
                    <div className="space-y-1 text-center">
                      <span className="text-[9px] font-bold tracking-wider text-primary block">M</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={stockM}
                        onChange={(e) => setStockM(Number(e.target.value))}
                        className="w-full bg-background border border-primary/20 rounded-none px-2 py-1.5 text-xs text-center focus:outline-none focus:border-primary"
                        id="stock-input-M"
                      />
                    </div>
                    {/* L */}
                    <div className="space-y-1 text-center">
                      <span className="text-[9px] font-bold tracking-wider text-primary block">L</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={stockL}
                        onChange={(e) => setStockL(Number(e.target.value))}
                        className="w-full bg-background border border-primary/20 rounded-none px-2 py-1.5 text-xs text-center focus:outline-none focus:border-primary"
                        id="stock-input-L"
                      />
                    </div>
                    {/* XL */}
                    <div className="space-y-1 text-center">
                      <span className="text-[9px] font-bold tracking-wider text-primary block">XL</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={stockXL}
                        onChange={(e) => setStockXL(Number(e.target.value))}
                        className="w-full bg-background border border-primary/20 rounded-none px-2 py-1.5 text-xs text-center focus:outline-none focus:border-primary"
                        id="stock-input-XL"
                      />
                    </div>
                    {/* XXL */}
                    <div className="space-y-1 text-center">
                      <span className="text-[9px] font-bold tracking-wider text-primary block">XXL</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={stockXXL}
                        onChange={(e) => setStockXXL(Number(e.target.value))}
                        className="w-full bg-background border border-primary/20 rounded-none px-2 py-1.5 text-xs text-center focus:outline-none focus:border-primary"
                        id="stock-input-XXL"
                      />
                    </div>
                  </div>
                </div>

                {/* Cloudinary Image Upload */}
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-primary uppercase block">Garment Media Gallery (max 5)</label>
                    <p className="text-[11px] text-primary/60 font-medium mt-0.5">
                      Recommended size: 1000 × 1200 px
                    </p>
                  </div>
                  
                  {/* File Upload Box */}
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
                          <span className="font-sans text-[10px] font-bold tracking-wider uppercase">Select apparel photos</span>
                          <span className="text-[9px] text-primary/45 font-light">Supports JPEG, PNG up to 5MB</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading || actionLoading}
                        className="hidden"
                        id="media-uploader-input"
                      />
                    </label>
                  </div>

                  {/* Thumbnail Previews */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 pt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-[3/4] border border-primary/10 overflow-hidden bg-cream-light/10">
                          <img src={img.secureUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover object-center" />
                          {/* Overlay Controls */}
                          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center space-y-1 transition-opacity">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleMakePrimaryImage(idx)}
                                className="bg-primary text-background text-[8px] font-bold tracking-wide px-1.5 py-0.5 uppercase hover:bg-primary-hover"
                                title="Set as primary"
                              >
                                Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-red-700 text-[8px] font-bold tracking-wide hover:underline uppercase"
                            >
                              Remove
                            </button>
                          </div>
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-primary text-background font-sans text-[7px] font-bold px-1.5 uppercase">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                id="cancel-save-product"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-background px-8 py-2.5 text-xs font-bold tracking-widest hover:bg-primary-hover transition-colors uppercase pt-3.5"
                disabled={actionLoading || uploading}
                id="save-product-submit"
              >
                {actionLoading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      {loading ? (
        <div className="py-12 text-center text-primary/40 font-sans text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Synchronizing Catalog ledger...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-primary/10 bg-cream-light/5">
          <Package className="h-10 w-10 text-primary/30 stroke-[1.2] mx-auto mb-3" />
          <h3 className="font-serif text-sm font-semibold text-primary uppercase">Catalog Empty</h3>
          <p className="font-sans text-xs text-primary/60 mt-1">There are no garments currently registered in the database.</p>
        </div>
      ) : (
        <div className="border border-primary/10 overflow-x-auto">
          <table className="w-full text-xs text-left font-sans">
            <thead className="bg-primary text-background font-serif font-bold uppercase tracking-wider text-[9px] border-b border-primary/10">
              <tr>
                <th className="p-3.5 pl-6">Garment Preview</th>
                <th className="p-3.5">Cost (৳)</th>
                <th className="p-3.5">Selling (৳)</th>
                <th className="p-3.5">Stock by Size (S / M / L / XL / XXL)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {products.map((prod) => {
                // Calculate variant stocks
                const getStock = (size: string) => prod.variants.find(v => v.size === size)?.stock || 0;
                const totalStock = prod.variants.reduce((acc, curr) => acc + curr.stock, 0);

                const hasDiscount = prod.discountPrice && prod.discountPrice < prod.sellingPrice;

                return (
                  <tr key={prod._id} className="hover:bg-cream-light/5">
                    {/* Name & Preview */}
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center space-x-3 text-left">
                        {prod.images?.[0]?.secureUrl ? (
                          <img 
                            src={prod.images[0].secureUrl} 
                            alt={prod.name} 
                            className="w-9 h-12 object-cover object-center bg-cream-light/25 border border-primary/5"
                          />
                        ) : (
                          <div className="w-9 h-12 flex items-center justify-center bg-cream-light/25 border border-primary/5 text-primary/30 text-[9px] font-serif font-bold">
                            FX
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <p className="font-serif text-xs font-semibold text-primary">{prod.name}</p>
                          <p className="text-[9px] text-primary/60 font-light font-sans">{prod.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Cost price */}
                    <td className="p-3.5 font-medium text-foreground/80">
                      ৳{prod.costPrice.toLocaleString()}
                    </td>

                    {/* Selling price */}
                    <td className="p-3.5 font-medium">
                      {hasDiscount ? (
                        <div className="flex flex-col text-left">
                          <span className="text-primary font-bold">৳{prod.discountPrice?.toLocaleString()}</span>
                          <span className="text-[9px] text-foreground/45 line-through">৳{prod.sellingPrice.toLocaleString()}</span>
                        </div>
                      ) : (
                        <span>৳{prod.sellingPrice.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Stock status */}
                    <td className="p-3.5 font-semibold text-primary">
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2 text-[10px] text-primary/70 font-sans uppercase">
                          <span>S:{getStock('S')}</span>
                          <span>M:{getStock('M')}</span>
                          <span>L:{getStock('L')}</span>
                          <span>XL:{getStock('XL')}</span>
                          <span>XXL:{getStock('XXL')}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 uppercase ${
                          totalStock === 0 
                            ? 'bg-red-50 text-red-700 border border-red-200/50' 
                            : totalStock < 10 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                            : 'bg-primary/5 text-primary border border-primary/10'
                        }`}>
                          Total: {totalStock}
                        </span>
                      </div>
                    </td>

                    {/* Status check */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide border ${
                        prod.isActive 
                          ? 'bg-primary/5 text-primary border-primary/20' 
                          : 'bg-foreground/5 text-foreground/40 border-foreground/10'
                      }`}>
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="p-3.5 text-right pr-6">
                      <div className="flex justify-end space-x-3.5">
                        <Link 
                          href={`/product/${prod.slug}`} 
                          target="_blank"
                          className="text-primary/70 hover:text-primary p-1"
                          title="View on storefront"
                        >
                          <Eye className="h-4 w-4 stroke-[1.8]" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="text-primary/70 hover:text-primary p-1"
                          title="Edit garment"
                          id={`edit-prod-${prod.slug}`}
                        >
                          <Edit2 className="h-4 w-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id!, prod.name)}
                          className="text-primary/55 hover:text-red-700 p-1"
                          title="Delete garment"
                          id={`delete-prod-${prod.slug}`}
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
