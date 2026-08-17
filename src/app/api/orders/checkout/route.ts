import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { Coupon } from '@/models/Coupon';
import { OrderCounter } from '@/models/OrderCounter';
import { checkCouponValidity } from '@/app/api/coupons/apply-coupon/route';
import { migrateOrderIds } from '@/lib/migrate';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await migrateOrderIds();

    const body = await req.json();
    const { customer, items, couponCode, deliveryType } = body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.area) {
      return NextResponse.json({ success: false, message: 'Please provide all customer information' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart items are required' }, { status: 400 });
    }

    if (deliveryType !== 'inside' && deliveryType !== 'outside') {
      return NextResponse.json({ success: false, message: 'Please specify a valid delivery area (inside or outside)' }, { status: 400 });
    }

    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(customer.phone)) {
      return NextResponse.json({ success: false, message: 'Please provide a valid Bangladesh mobile number' }, { status: 400 });
    }

    let subtotal = 0;
    const orderItems: any[] = [];
    const stockAdjustments: { productId: string; size: string; quantity: number }[] = [];

    for (const item of items) {
      if (!item.product || !item.size || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ success: false, message: 'Invalid cart item details' }, { status: 400 });
      }

      let dbProduct;
      try {
        dbProduct = await Product.findById(item.product);
      } catch {
        // invalid object id fallback
      }

      if (!dbProduct) {
        return NextResponse.json({ success: false, message: `Product ${item.name || 'selected item'} is no longer available` }, { status: 404 });
      }

      if (!dbProduct.isActive) {
        return NextResponse.json({ success: false, message: `Product ${dbProduct.name} is currently unavailable` }, { status: 400 });
      }

      const variant = dbProduct.variants.find((v: any) => v.size === item.size);
      if (!variant) {
        return NextResponse.json({ success: false, message: `Size ${item.size} is unavailable for product ${dbProduct.name}` }, { status: 400 });
      }

      if (variant.stock < 1) {
        return NextResponse.json({ success: false, message: `Product ${dbProduct.name} is out of stock in size ${item.size}` }, { status: 400 });
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Only ${variant.stock} items are currently available in size ${item.size} for ${dbProduct.name}.`
        }, { status: 400 });
      }

      const itemPrice = dbProduct.discountPrice && dbProduct.discountPrice < dbProduct.sellingPrice
        ? dbProduct.discountPrice
        : dbProduct.sellingPrice;

      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        image: dbProduct.images[0] || '',
        size: item.size,
        quantity: item.quantity,
        price: itemPrice,
        costPrice: dbProduct.costPrice
      });

      stockAdjustments.push({
        productId: dbProduct._id.toString(),
        size: item.size,
        quantity: item.quantity
      });
    }

    let discountAmount = 0;
    let appliedCoupon = { code: '', discount: 0 };

    if (couponCode) {
      const dbCoupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (dbCoupon) {
        const validation = checkCouponValidity(dbCoupon, subtotal);
        if (validation.isValid) {
          discountAmount = validation.discountAmount;
          appliedCoupon = {
            code: dbCoupon.code,
            discount: discountAmount
          };

          dbCoupon.usageCount += 1;
          await dbCoupon.save();
        }
      }
    }

    const deliveryCharge = deliveryType === 'inside' ? 80 : 150;
    const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

    const completedAdjustments: typeof stockAdjustments = [];

    try {
      for (const adj of stockAdjustments) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: adj.productId,
            'variants.size': adj.size,
            'variants.stock': { $gte: adj.quantity }
          },
          {
            $inc: { 'variants.$.stock': -adj.quantity }
          },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(`Insufficient stock for product id ${adj.productId} size ${adj.size} during locking`);
        }
        completedAdjustments.push(adj);
      }
    } catch {
      for (const comp of completedAdjustments) {
        await Product.updateOne(
          { _id: comp.productId, 'variants.size': comp.size },
          { $inc: { 'variants.$.stock': comp.quantity } }
        );
      }
      return NextResponse.json({
        success: false,
        message: 'Order placement failed due to a stock conflict. Please review your cart and try again.'
      }, { status: 400 });
    }

    const fxwCount = await Order.countDocuments({ orderId: /^FXW-\d+$/i });
    if (fxwCount === 0) {
      await OrderCounter.findOneAndUpdate(
        { id: 'order_id_fxw' },
        { $set: { seq: -1 } },
        { upsert: true }
      );
    }

    const counter = await OrderCounter.findOneAndUpdate(
      { id: 'order_id_fxw' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    const orderId = `FXW-${counter ? counter.seq : 0}`;

    const order = await Order.create({
      orderId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        area: customer.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka',
        note: customer.note || ''
      },
      items: orderItems,
      subtotal,
      coupon: appliedCoupon,
      discountAmount,
      deliveryCharge,
      grandTotal,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      stockAdjustmentState: 'Adjusted'
    });

    return NextResponse.json({ success: true, orderId: order.orderId, order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
