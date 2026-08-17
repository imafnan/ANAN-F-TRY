import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Banner } from '@/models/Banner';

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
