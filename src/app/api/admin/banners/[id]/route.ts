import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Banner } from '@/models/Banner';
import { verifyAdminSession } from '@/lib/auth';
import getCloudinary from '@/lib/cloudinary';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const { image, title, subtitle, ctaText, ctaUrl, isActive } = body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 });
    }

    if (image && image.publicId && image.publicId !== banner.image.publicId) {
      if (banner.image.publicId) {
        try {
          const cloudinary = getCloudinary();
          await cloudinary.uploader.destroy(banner.image.publicId);
        } catch (cloudinaryErr) {
          console.error(`[CLOUDINARY] Failed to destroy old banner asset ${banner.image.publicId}:`, cloudinaryErr);
        }
      }
      banner.image = image;
    }

    banner.title = title ?? banner.title;
    banner.subtitle = subtitle ?? banner.subtitle;
    banner.ctaText = ctaText ?? banner.ctaText;
    banner.ctaUrl = ctaUrl ?? banner.ctaUrl;
    banner.isActive = isActive ?? banner.isActive;

    await banner.save();

    return NextResponse.json({ success: true, banner });
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
    const banner = await Banner.findById(id);

    if (!banner) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 });
    }

    if (banner.image && banner.image.publicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(banner.image.publicId);
      } catch (cloudinaryErr) {
        console.error(`[CLOUDINARY] Failed to delete asset ${banner.image.publicId}:`, cloudinaryErr);
      }
    }

    await Banner.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
