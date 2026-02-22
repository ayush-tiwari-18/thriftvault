// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');

    // 1. Verify Webhook security using credentials from your Dashboard
    const expectedAuth = crypto
      .createHash('sha256')
      .update(`${process.env.PHONEPE_WEBHOOK_USER}:${process.env.PHONEPE_WEBHOOK_PASS}`)
      .digest('hex');

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract payload and check state
    const { event, payload } = body;
    
    // We look for the COMPLETED state
    if (event === 'checkout.order.completed' && payload.state === 'COMPLETED') {
      await dbConnect();
      
      // Update the order status in MongoDB
      const updatedOrder = await Order.findOneAndUpdate(
        { merchantOrderId: payload.merchantOrderId },
        { status: 'paid' },
        { new: true }
      );

      if (!updatedOrder) {
        console.error(`Order ${payload.merchantOrderId} not found in DB`);
      }
    }

    // 3. Always acknowledge with 200 OK so PhonePe stops retrying
    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}