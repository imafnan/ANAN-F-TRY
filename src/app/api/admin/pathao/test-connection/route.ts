import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { pathaoService } from '@/lib/pathao';

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const customCreds = await req.json();
    const result = await pathaoService.testConnection(customCreds);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      authStatus: 'Failed',
      storeStatus: 'Unverified',
      message: 'Connection test error: ' + error.message
    }, { status: 500 });
  }
}
