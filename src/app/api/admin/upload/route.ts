import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import getCloudinary from '@/lib/cloudinary';

interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'Please upload at least one image file' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const targetFolderParam = searchParams.get('folder') || (formData.get('folder') as string) || 'products';
    const validFolders = ['products', 'banners', 'branding'];
    const subfolder = validFolders.includes(targetFolderParam) ? targetFolderParam : 'products';
    const folderPath = `forrabix/${subfolder}`;

    const cloudinary = getCloudinary();

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: folderPath },
          (error, result) => {
            if (error) {
              console.error('[CLOUDINARY] Upload stream error:', error);
              return reject(error);
            }
            resolve({
              publicId: result?.public_id || '',
              secureUrl: result?.secure_url || '',
              width: result?.width,
              height: result?.height
            });
          }
        );
        uploadStream.end(buffer);
      });
    });

    const images = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      message: 'Images uploaded successfully',
      images
    });
  } catch (error: any) {
    console.error('[UPLOAD] Error handling upload:', error);
    return NextResponse.json(
      { success: false, message: 'Image upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
