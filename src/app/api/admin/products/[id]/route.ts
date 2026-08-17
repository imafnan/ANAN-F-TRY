import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { verifyAdminSession } from '@/lib/auth';
import getCloudinary from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
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

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    if (slug && slug !== product.slug) {
      const existingSlug = await Product.findOne({ slug });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, message: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    if (images && Array.isArray(images)) {
      const oldPublicIds = (product.images as any[]).map((img: any) => img.publicId).filter(Boolean);
      const newPublicIds = images.map((img: any) => img.publicId).filter(Boolean);
      const deletedPublicIds = oldPublicIds.filter((pid: any) => !newPublicIds.includes(pid));

      for (const pid of deletedPublicIds) {
        try {
          const cloudinary = getCloudinary();
          await cloudinary.uploader.destroy(pid);
        } catch (cloudinaryErr) {
          console.error(`[CLOUDINARY] Failed to clean up replaced asset ${pid}:`, cloudinaryErr);
        }
      }
      product.images = images as any;
    }

    product.name = name ?? product.name;
    product.slug = slug ?? product.slug;
    product.description = description ?? product.description;
    product.costPrice = costPrice ?? product.costPrice;
    product.sellingPrice = sellingPrice ?? product.sellingPrice;
    product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.variants = variants ?? product.variants;
    product.weight = weight ?? product.weight;
    product.isActive = isActive ?? product.isActive;

    await product.save();

    return NextResponse.json({ success: true, product });
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
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    if (product.images && (product.images as any[]).length > 0) {
      for (const img of (product.images as any[])) {
        if (img.publicId) {
          try {
            const cloudinary = getCloudinary();
            await cloudinary.uploader.destroy(img.publicId);
          } catch (cloudinaryErr) {
            console.error(`[CLOUDINARY] Failed to delete asset ${img.publicId}:`, cloudinaryErr);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
