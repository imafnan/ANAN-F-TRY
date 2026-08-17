import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
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
    const {
      name,
      slug,
      description,
      costPrice,
      sellingPrice,
      discountPrice,
      images,
      variants,
      weight,
      isActive
    } = body;

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one size variant with stock is required' },
        { status: 400 }
      );
    }

    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      slug,
      description,
      costPrice,
      sellingPrice,
      discountPrice,
      images,
      variants,
      weight: weight || 0.5,
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
