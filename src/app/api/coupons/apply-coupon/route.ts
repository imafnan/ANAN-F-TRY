import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';

export const checkCouponValidity = (coupon: any, subtotal: number): { isValid: boolean; discountAmount: number; message?: string } => {
  const now = new Date();

  if (!coupon.isActive) {
    return { isValid: false, discountAmount: 0, message: 'Coupon is inactive' };
  }

  if (now < new Date(coupon.startDate)) {
    return { isValid: false, discountAmount: 0, message: 'Coupon is not yet active' };
  }

  if (now > new Date(coupon.endDate)) {
    return { isValid: false, discountAmount: 0, message: 'Coupon has expired' };
  }

  if (coupon.usageCount >= coupon.usageLimit) {
    return { isValid: false, discountAmount: 0, message: 'Coupon usage limit reached' };
  }

  if (subtotal < coupon.minPurchase) {
    return { isValid: false, discountAmount: 0, message: `Minimum purchase of ৳${coupon.minPurchase} is required` };
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = Math.round(subtotal * (coupon.value / 100));
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    discountAmount = coupon.value;
  }

  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  return { isValid: true, discountAmount };
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { success: false, message: 'Coupon code and subtotal are required' },
        { status: 400 }
      );
    }

    const coupon: any = await Coupon.findOne({ code: code.toUpperCase() }).lean();
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    const validation = checkCouponValidity(coupon, Number(subtotal));
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount: validation.discountAmount
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
