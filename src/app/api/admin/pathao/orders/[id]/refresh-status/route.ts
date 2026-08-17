import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { verifyAdminSession } from '@/lib/auth';
import { pathaoService } from '@/lib/pathao';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (!order.pathao || !order.pathao.booked || !order.pathao.consignmentId) {
      return NextResponse.json({ success: false, message: 'This order has not been booked with Pathao yet' }, { status: 400 });
    }

    console.log(`[PATHAO] Refreshing status for consignment ${order.pathao.consignmentId}...`);
    const pathaoRes = await pathaoService.getOrderInfo(order.pathao.consignmentId);

    if (pathaoRes && pathaoRes.type === 'success') {
      const pData = pathaoRes.data;

      order.pathao.status = pData.order_status;
      order.pathao.statusSlug = pData.order_status_slug || pData.order_status;
      order.pathao.deliveryFee = pData.delivery_fee || order.pathao.deliveryFee;
      order.pathao.lastSyncedAt = new Date();
      order.pathao.response = pData;

      const slug = (pData.order_status_slug || pData.order_status || '').toLowerCase();

      if (slug === 'delivered') {
        order.orderStatus = 'Delivered';
        order.paymentStatus = 'Paid';
      } else if (slug === 'returned') {
        if (order.stockAdjustmentState === 'Adjusted') {
          for (const item of (order.items as any[])) {
            await Product.updateOne(
              { _id: item.product, 'variants.size': item.size },
              { $inc: { 'variants.$.stock': item.quantity } }
            );
          }
          order.stockAdjustmentState = 'Restored';
        }
        order.orderStatus = 'Returned';
      } else if (slug === 'cancelled') {
        if (order.stockAdjustmentState === 'Adjusted') {
          for (const item of (order.items as any[])) {
            await Product.updateOne(
              { _id: item.product, 'variants.size': item.size },
              { $inc: { 'variants.$.stock': item.quantity } }
            );
          }
          order.stockAdjustmentState = 'Restored';
        }
        order.orderStatus = 'Cancelled';
      } else if (slug === 'in_transit' || slug === 'out_for_delivery') {
        order.orderStatus = 'Out for Delivery';
      } else if (slug === 'picked' || slug === 'shipped') {
        order.orderStatus = 'Shipped';
      }

      await order.save();

      return NextResponse.json({
        success: true,
        message: 'Pathao status updated successfully',
        order
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Pathao status query failed',
        rawResponse: pathaoRes
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[PATHAO] Refresh failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to sync status: ' + error.message
    }, { status: 500 });
  }
}
