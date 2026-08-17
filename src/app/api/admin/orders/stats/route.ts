import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    await connectDB();

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
    const outForDeliveryOrders = await Order.countDocuments({ orderStatus: 'Out for Delivery' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });
    const returnedOrders = await Order.countDocuments({ orderStatus: 'Returned' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlySalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const monthlySales = monthlySalesAgg.length > 0 ? monthlySalesAgg[0].total : 0;

    const monthOrders = await Order.find({
      createdAt: { $gte: startOfMonth },
      orderStatus: { $ne: 'Cancelled' }
    });

    let monthlyProfit = 0;
    for (const ord of monthOrders) {
      let orderProfit = 0;
      for (const item of ord.items) {
        const cost = Number.isFinite(Number((item as any).costPrice)) && Number((item as any).costPrice) > 0
          ? Number((item as any).costPrice)
          : item.price * 0.7;
        orderProfit += (item.price - cost) * item.quantity;
      }
      monthlyProfit += Math.max(0, orderProfit);
    }

    const totalRevenueAgg = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;

    const totalProducts = await Product.countDocuments();

    const allProducts = await Product.find({ isActive: true });
    const lowStockProducts: any[] = [];
    for (const prod of allProducts) {
      const lowVariants = prod.variants.filter((v: any) => v.stock <= 5);
      if (lowVariants.length > 0) {
        lowStockProducts.push({
          id: prod._id.toString(),
          name: prod.name,
          slug: prod.slug,
          variants: lowVariants.map((v: any) => ({ size: v.size, stock: v.stock }))
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        monthlySales,
        monthlyProfit,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        totalRevenue,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        lowStockProducts
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
