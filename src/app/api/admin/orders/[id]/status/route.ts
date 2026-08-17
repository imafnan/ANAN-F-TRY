import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { verifyAdminSession } from '@/lib/auth';
import { normalizeOrderForResponse } from '@/lib/orderNormalizer';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectDB();

    const body = await req.json();
    const { status } = body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid order status' }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if ((status === 'Cancelled' || status === 'Returned') && order.stockAdjustmentState === 'Adjusted') {
      console.log(`[ORDER STATUS] Order ${order.orderId} moved to ${status}. Restoring variant stocks...`);
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, 'variants.size': item.size },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      }
      order.stockAdjustmentState = 'Restored';
    }

    order.orderStatus = status;

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    await order.save();

    return NextResponse.json({ success: true, order: normalizeOrderForResponse(order) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
