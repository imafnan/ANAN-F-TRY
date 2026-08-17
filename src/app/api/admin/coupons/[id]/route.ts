import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectDB();
    const coupon = await Coupon.findById(id).lean();

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const { code, type, value, minPurchase, maxDiscount, startDate, endDate, usageLimit, isActive } = body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return NextResponse.json(
          { success: false, message: 'Coupon code already exists' },
          { status: 400 }
        );
      }
      coupon.code = code.toUpperCase();
    }

    coupon.type = type ?? coupon.type;
    coupon.value = value ?? coupon.value;
    coupon.minPurchase = minPurchase ?? coupon.minPurchase;
    coupon.maxDiscount = maxDiscount !== undefined ? maxDiscount : coupon.maxDiscount;
    coupon.startDate = startDate ? new Date(startDate) : coupon.startDate;
    coupon.endDate = endDate ? new Date(endDate) : coupon.endDate;
    coupon.usageLimit = usageLimit ?? coupon.usageLimit;
    coupon.isActive = isActive ?? coupon.isActive;

    await coupon.save();

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectDB();
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
