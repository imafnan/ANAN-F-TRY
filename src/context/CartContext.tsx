'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export interface CartItem {
  product: string; // Product ID
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
  maxStock: number;
  weight?: number;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
}

interface CartContextType {
  cart: CartItem[];
  coupon: AppliedCoupon | null;
  deliveryCharge: number;
  deliveryType: 'inside' | 'outside';
  addToCart: (item: CartItem) => { success: boolean; message: string };
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setDeliveryLocation: (type: 'inside' | 'outside') => void;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [deliveryType, setDeliveryType] = useState<'inside' | 'outside'>('inside');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(80);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('forrabix_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Error parsing stored cart:', e);
      }
    }
    const storedDelivery = localStorage.getItem('forrabix_delivery_type');
    if (storedDelivery === 'outside') {
      setDeliveryType('outside');
      setDeliveryCharge(150);
    }
  }, []);

  // Save cart to localStorage when changed
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('forrabix_cart', JSON.stringify(newCart));
  };

  const addToCart = (item: CartItem) => {
    // Find if item already exists in cart with same size
    const existingIndex = cart.findIndex(
      (i) => i.product === item.product && i.size === item.size
    );

    if (existingIndex > -1) {
      const existingItem = cart[existingIndex];
      const newQty = existingItem.quantity + item.quantity;
      
      if (newQty > item.maxStock) {
        return {
          success: false,
          message: `Only ${item.maxStock} items are currently available in ${item.size}.`
        };
      }
      
      const newCart = [...cart];
      newCart[existingIndex] = { ...existingItem, quantity: newQty };
      saveCart(newCart);
      return { success: true, message: 'Cart updated successfully' };
    } else {
      if (item.quantity > item.maxStock) {
        return {
          success: false,
          message: `Only ${item.maxStock} items are currently available in ${item.size}.`
        };
      }
      saveCart([...cart, item]);
      return { success: true, message: 'Added to cart successfully' };
    }
  };

  const removeFromCart = (productId: string, size: string) => {
    const newCart = cart.filter((i) => !(i.product === productId && i.size === size));
    saveCart(newCart);
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    const existingIndex = cart.findIndex(
      (i) => i.product === productId && i.size === size
    );

    if (existingIndex > -1) {
      const item = cart[existingIndex];
      if (quantity > item.maxStock) {
        return {
          success: false,
          message: `Only ${item.maxStock} items are currently available in ${item.size}.`
        };
      }
      if (quantity < 1) {
        removeFromCart(productId, size);
        return { success: true, message: 'Item removed from cart' };
      }

      const newCart = [...cart];
      newCart[existingIndex] = { ...item, quantity };
      saveCart(newCart);
      return { success: true, message: 'Cart updated successfully' };
    }
    return { success: false, message: 'Item not found in cart' };
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
    localStorage.removeItem('forrabix_cart');
  };

  const setDeliveryLocation = (type: 'inside' | 'outside') => {
    setDeliveryType(type);
    setDeliveryCharge(type === 'inside' ? 80 : 150);
    localStorage.setItem('forrabix_delivery_type', type);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Recalculate coupon discount if subtotal changes
  const discountAmount = coupon
    ? coupon.type === 'percentage'
      ? Math.round(subtotal * (coupon.value / 100))
      : coupon.value
    : 0;

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const applyCouponCode = async (code: string) => {
    try {
      const data = await apiFetch('/coupons/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal })
      });

      if (data.success) {
        setCoupon({
          code: data.code,
          type: data.type,
          value: data.value,
          discountAmount: data.discountAmount
        });
        return { success: true, message: 'Coupon applied successfully!' };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code' };
      }
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      return { success: false, message: error.message || 'Connection failure. Unable to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        coupon,
        deliveryCharge,
        deliveryType,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        setDeliveryLocation,
        subtotal,
        discountAmount,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
