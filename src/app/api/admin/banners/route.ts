import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Banner } from '@/models/Banner';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const banners = await Banner.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, banners });
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
    const { image, title, subtitle, ctaText, ctaUrl, isActive } = body;

    if (!image || !image.publicId || !image.secureUrl || !title || !subtitle || !ctaText || !ctaUrl) {
      return NextResponse.json(
        { success: false, message: 'All banner fields including image metadata are required' },
        { status: 400 }
      );
    }

    const banner = await Banner.create({
      image,
      title,
      subtitle,
      ctaText,
      ctaUrl,
      isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
