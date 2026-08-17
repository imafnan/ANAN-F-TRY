import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { cleanupProductIndexes } from '@/lib/migrate';

export async function GET() {
  try {
    await connectDB();
    await cleanupProductIndexes();

    const products = await Product.find({ isActive: true })
      .select('-costPrice')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
