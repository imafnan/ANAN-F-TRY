import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
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

    if (order.pathao && order.pathao.booked) {
      return NextResponse.json({
        success: false,
        message: `Order is already booked with Pathao. Consignment ID: ${order.pathao.consignmentId}`,
        consignmentId: order.pathao.consignmentId
      }, { status: 400 });
    }

    if (!order.customer || !order.customer.name || !order.customer.phone || !order.customer.address || !order.customer.area) {
      return NextResponse.json({
        success: false,
        message: 'Courier booking unavailable: customer delivery information is incomplete.'
      }, { status: 400 });
    }

    const totalQty = (order.items as any[]).reduce((sum: number, item: any) => sum + item.quantity, 0);
    const itemDesc = (order.items as any[]).map((item: any) => `${item.name} (${item.size}) x${item.quantity}`).join(', ');

    console.log(`[PATHAO] Booking order ${order.orderId}...`);
    const pathaoRes = await pathaoService.createOrder({
      merchant_order_id: order.orderId,
      recipient_name: order.customer.name,
      recipient_phone: order.customer.phone,
      recipient_address: order.customer.address,
      item_quantity: totalQty,
      item_weight: 0.5,
      item_description: itemDesc,
      amount_to_collect: order.grandTotal,
      special_instruction: order.customer.note
    });

    if (pathaoRes && pathaoRes.type === 'success') {
      const pData = pathaoRes.data;

      order.pathao = {
        booked: true,
        consignmentId: pData.consignment_id,
        merchantOrderId: pData.merchant_order_id,
        status: pData.order_status,
        statusSlug: pData.order_status_slug || pData.order_status,
        deliveryFee: pData.delivery_fee || 0,
        lastSyncedAt: new Date(),
        response: pData
      };

      order.orderStatus = 'Confirmed';
      await order.save();

      return NextResponse.json({
        success: true,
        message: 'Order booked successfully with Pathao',
        order
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Pathao API returned an error',
        rawResponse: pathaoRes
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[PATHAO] Booking failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to book courier: ' + error.message
    }, { status: 500 });
  }
}
