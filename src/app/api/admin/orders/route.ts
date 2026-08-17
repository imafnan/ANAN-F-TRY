import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { verifyAdminSession } from '@/lib/auth';
import { normalizeOrderForResponse } from '@/lib/orderNormalizer';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const query: any = {};

    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { orderId: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex },
        { 'customer.address': searchRegex },
        { 'pathao.consignmentId': searchRegex }
      ];
    }

    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const totalOrders = await Order.countDocuments(query);
    const rawOrders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const orders = rawOrders.map(normalizeOrderForResponse);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        totalOrders,
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        limit: limitNum
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
