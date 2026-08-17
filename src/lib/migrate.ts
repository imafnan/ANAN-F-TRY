import connectDB from './mongodb';
import { Order } from '@/models/Order';
import { OrderCounter } from '@/models/OrderCounter';
import mongoose from 'mongoose';

export const cleanupProductIndexes = async () => {
  try {
    await connectDB();
    const connection = mongoose.connection;
    if (!connection.db) return;

    const collection = connection.db.collection('products');
    const indexes = await collection.indexes();
    const hasSkuIndex = indexes.some(idx => idx.name === 'sku_1');

    if (hasSkuIndex) {
      console.log('[INDEX CLEANUP] Found obsolete index "sku_1". Dropping...');
      await collection.dropIndex('sku_1');
      console.log('[INDEX CLEANUP] Successfully dropped "sku_1" index from products collection.');
    }

    await collection.updateMany(
      { sku: { $exists: true } },
      { $unset: { sku: '' } }
    );
  } catch (error: any) {
    if (error.codeName !== 'IndexNotFound' && error.code !== 27) {
      console.error('[INDEX CLEANUP] Error cleaning product indexes:', error.message || error);
    }
  }
};

export const migrateOrderIds = async () => {
  try {
    await connectDB();
    console.log('[MIGRATION] Checking legacy order IDs, customer info, and FXW counter status...');

    try {
      const indexes = await Order.collection.indexes();
      const hasObsoleteIndex = indexes.some(idx => idx.name === 'orderNumber_1');
      if (hasObsoleteIndex) {
        await Order.collection.dropIndex('orderNumber_1');
        console.log('[MIGRATION] Dropped obsolete orderNumber_1 index from orders collection');
      }
    } catch (dropErr: any) {
      console.warn('[MIGRATION] Obsolete index drop notice:', dropErr.message);
    }

    const rawOrders = await Order.find().sort({ createdAt: 1, _id: 1 });

    let maxFxwSeq = -1;
    const fxwRegex = /^FXW-(\d+)$/i;
    const anyValidRegex = /^(FXW|FX)-(\d+)$/i;

    for (const doc of rawOrders) {
      const ord: any = doc;
      if (ord.orderId && fxwRegex.test(ord.orderId)) {
        const match = ord.orderId.match(fxwRegex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxFxwSeq) {
            maxFxwSeq = num;
          }
        }
      }
    }

    let updatedCount = 0;

    for (const doc of rawOrders) {
      const ord: any = doc;
      const hasValidOrderId = Boolean(ord.orderId && anyValidRegex.test(ord.orderId));
      const hasCustomerObj = ord.customer !== undefined;

      if (hasValidOrderId && hasCustomerObj) {
        continue;
      }

      const updateSet: any = {};
      const unsetSet: any = { orderNumber: "" };

      if (!hasValidOrderId) {
        maxFxwSeq += 1;
        updateSet.orderId = `FXW-${maxFxwSeq}`;
      }

      if (!hasCustomerObj) {
        const info = ord.customerInfo || {};
        const name = info.fullName || info.name || info.customerName || '';
        const phone = info.phoneNumber || info.phone || info.mobile || '';
        const address = info.address || info.deliveryAddress || '';
        const area = info.deliveryArea || info.district || info.division || (ord.deliveryType === 'outside' ? 'Outside Dhaka' : 'Inside Dhaka');

        updateSet.customer = {
          name,
          phone,
          address,
          area,
          note: info.note || ''
        };
      }

      if (!Number.isFinite(Number(ord.subtotal)) || Number(ord.subtotal) <= 0) {
        const deliveryCharge = Number.isFinite(Number(ord.deliveryCharge)) ? Number(ord.deliveryCharge) : 80;
        const discountAmount = Number.isFinite(Number(ord.discountAmount)) ? Number(ord.discountAmount) : 0;
        const grandTotal = Number.isFinite(Number(ord.grandTotal))
          ? Number(ord.grandTotal)
          : (Number.isFinite(Number(ord.totalAmount)) ? Number(ord.totalAmount) : (Number.isFinite(Number(ord.total)) ? Number(ord.total) : 0));
        
        updateSet.subtotal = Math.max(0, grandTotal - deliveryCharge + discountAmount);
      }

      if (Object.keys(updateSet).length > 0) {
        await Order.updateOne(
          { _id: ord._id },
          {
            $set: updateSet,
            $unset: unsetSet
          }
        );
        updatedCount += 1;
      }
    }

    const existingFxwCounter = await OrderCounter.findOne({ id: 'order_id_fxw' });
    const fxwOrderCount = await Order.countDocuments({ orderId: fxwRegex });

    if (fxwOrderCount === 0) {
      await OrderCounter.findOneAndUpdate(
        { id: 'order_id_fxw' },
        { $set: { seq: -1 } },
        { upsert: true }
      );
      console.log('[MIGRATION] Zero FXW orders found. Initialized order_id_fxw counter to seq: -1 (FXW-0 next)');
    } else if (maxFxwSeq >= 0 && (!existingFxwCounter || existingFxwCounter.seq < maxFxwSeq)) {
      await OrderCounter.findOneAndUpdate(
        { id: 'order_id_fxw' },
        { $set: { seq: maxFxwSeq } },
        { upsert: true }
      );
      console.log(`[MIGRATION] OrderCounter (order_id_fxw) updated to seq: ${maxFxwSeq}`);
    }

    try {
      await Order.collection.createIndex({ orderId: 1 }, { unique: true });
      console.log('[MIGRATION] Unique index on orderId verified');
    } catch (idxErr: any) {
      console.warn('[MIGRATION] Unique index creation notice:', idxErr.message);
    }

    console.log(`[MIGRATION] Migration complete. Processed ${updatedCount} legacy orders.`);
  } catch (error) {
    console.error('[MIGRATION] Error migrating order IDs:', error);
  }
};
