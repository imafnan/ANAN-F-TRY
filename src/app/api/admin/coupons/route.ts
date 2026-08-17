import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();
    const { code, type, value, minPurchase, maxDiscount, startDate, endDate, usageLimit, isActive } = body;

    if (!code || !type || value === undefined || !startDate || !endDate || !usageLimit) {
      return NextResponse.json(
        { success: false, message: 'All required coupon fields must be provided' },
        { status: 400 }
      );
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit,
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
