import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Store from '@/models/Store';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');

    const expectedAuth = crypto
      .createHash('sha256')
      .update(`${process.env.PHONEPE_WEBHOOK_USER}:${process.env.PHONEPE_WEBHOOK_PASS}`)
      .digest('hex');

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event, payload } = body;
    
    if (event === 'checkout.order.completed') {
      await dbConnect();

      const order = await Order.findOne({ merchantOrderId: payload.merchantOrderId });
      if (!order || order.status === 'paid') return NextResponse.json({ status: "OK" });

      let newStatus: 'paid' | 'failed' | 'cancelled' | 'pending' = 'pending';
      if (payload.state === 'COMPLETED') newStatus = 'paid';
      else if (['FAILED', 'USER_CANCEL', 'CANCELLED'].includes(payload.state)) newStatus = 'failed';

      // 1. ATOMIC INVENTORY REDUCTION
      if (newStatus === 'paid') {
  // 1. Atomic Product Reduction
  const reductionPromises = order.items.map(async (item: any) => {
    return Product.findOneAndUpdate(
      { _id: item.productId, quantity: { $gt: 0 } }, 
      { $inc: { quantity: -1 } },
      { returnDocument: 'after' }
    );
  });

  const results = await Promise.all(reductionPromises);

  // 2. Atomic Store Item Count Reduction
  // We reduce the 'availableItems' count by the number of unique items successfully processed
  const successfulReductions = results.filter(res => res !== null).length;

  if (successfulReductions > 0) {
    await Store.findOneAndUpdate(
      { _id: order.storeId }, 
      { $inc: { availableItems: -successfulReductions } } // Decrement by the number of sold items
    );
  }

  // 3. Race Condition Check
  if (results.some(res => res === null)) {
    console.error(`RACE CONDITION: Order ${order.merchantOrderId} paid for sold-out item.`);
  }
}

      order.status = newStatus;
      order.paymentIntentId = payload.transactionId || payload.orderId;
      await order.save();
    }

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ status: "OK" });
  }
}