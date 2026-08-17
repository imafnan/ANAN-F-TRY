// Centralized Order Normalizer for FORRABIX
// Ensures consistent, crash-proof financial metrics and metadata fields

export const normalizeOrderForResponse = (doc: any) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  const deliveryCharge = Number.isFinite(Number(obj.deliveryCharge))
    ? Number(obj.deliveryCharge)
    : (obj.customer?.area === 'Outside Dhaka' || obj.customer?.area === 'outside' ? 150 : 80);

  const discountAmount = Number.isFinite(Number(obj.discountAmount))
    ? Number(obj.discountAmount)
    : (obj.coupon?.discount ? Number(obj.coupon.discount) : 0);

  let calculatedSubtotal = 0;
  if (Array.isArray(obj.items) && obj.items.length > 0) {
    calculatedSubtotal = obj.items.reduce((sum: number, item: any) => {
      const price = Number.isFinite(Number(item.price)) ? Number(item.price) : 0;
      const qty = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1;
      return sum + (price * qty);
    }, 0);
  }

  const subtotal = Number.isFinite(Number(obj.subtotal)) && Number(obj.subtotal) > 0
    ? Number(obj.subtotal)
    : (calculatedSubtotal > 0
        ? calculatedSubtotal
        : (Number.isFinite(Number(obj.grandTotal))
            ? Math.max(0, Number(obj.grandTotal) - deliveryCharge + discountAmount)
            : 0));

  const grandTotal = Number.isFinite(Number(obj.grandTotal))
    ? Number(obj.grandTotal)
    : (Number.isFinite(Number(obj.totalAmount))
        ? Number(obj.totalAmount)
        : (Number.isFinite(Number(obj.total))
            ? Number(obj.total)
            : Math.max(0, subtotal - discountAmount + deliveryCharge)));

  const orderId = obj.orderId || (obj._id ? `FXW-${obj._id.toString().slice(-6).toUpperCase()}` : 'FXW-0');

  const pathao = obj.pathao ? {
    booked: Boolean(obj.pathao.booked),
    consignmentId: obj.pathao.consignmentId || '',
    merchantOrderId: obj.pathao.merchantOrderId || '',
    status: obj.pathao.status || '',
    statusSlug: obj.pathao.statusSlug || '',
    deliveryFee: Number.isFinite(Number(obj.pathao.deliveryFee)) ? Number(obj.pathao.deliveryFee) : 0,
    lastSyncedAt: obj.pathao.lastSyncedAt
  } : {
    booked: false,
    consignmentId: '',
    merchantOrderId: '',
    status: '',
    statusSlug: '',
    deliveryFee: 0
  };

  return {
    ...obj,
    orderId,
    subtotal,
    deliveryCharge,
    discountAmount,
    grandTotal,
    pathao
  };
};
