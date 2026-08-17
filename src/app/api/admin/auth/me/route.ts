import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
