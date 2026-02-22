// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');

    // 1. Verify Webhook Authenticity
    // PhonePe sends SHA256(username:password) where credentials are from Dashboard
    const expectedAuth = crypto
      .createHash('sha256')
      .update(`${process.env.PHONEPE_WEBHOOK_USER}:${process.env.PHONEPE_WEBHOOK_PASS}`)
      .digest('hex');

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Process the Payload
    const { event, payload } = body;
    
    if (event === 'checkout.order.completed' && payload.state === 'COMPLETED') {
      await dbConnect();
      // Update your MongoDB order status
      await Order.findOneAndUpdate(
        { merchantOrderId: payload.merchantOrderId },
        { status: 'paid', phonePeOrderId: payload.orderId }
      );
    }

    // 3. Acknowledge promptly with 200 OK
    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}