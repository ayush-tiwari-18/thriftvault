// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');

    // 1. Verify Webhook security
    const expectedAuth = crypto
      .createHash('sha256')
      .update(`${process.env.PHONEPE_WEBHOOK_USER}:${process.env.PHONEPE_WEBHOOK_PASS}`)
      .digest('hex');

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract payload and event
    const { event, payload } = body;
    
    // Only process checkout completion events
    if (event === 'checkout.order.completed') {
      await dbConnect();

      // Map PhonePe states to your Order statuses
      let newStatus: 'paid' | 'failed' | 'cancelled' | 'pending' = 'pending';

      switch (payload.state) {
        case 'COMPLETED':
          newStatus = 'paid';
          break;
        case 'FAILED':
          newStatus = 'failed';
          break;
        case 'USER_CANCEL':
        case 'CANCELLED':
          newStatus = 'cancelled';
          break;
        default:
          newStatus = 'pending';
      }

      // Update the order in MongoDB using the unique merchantOrderId
      const updatedOrder = await Order.findOneAndUpdate(
        { merchantOrderId: payload.merchantOrderId },
        { 
          status: newStatus,
          // Store PhonePe's internal ID if it's provided in the payload
          paymentIntentId: payload.transactionId || payload.orderId 
        },
        { new: true }
      );

      if (!updatedOrder) {
        console.warn(`Webhook received for unknown Order: ${payload.merchantOrderId}`);
      }
    }

    // 3. Always acknowledge with 200 OK so PhonePe stops retrying
    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    // Returning 200 even on error can be a strategy to stop retries if the payload is malformed
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}