// app/api/payment/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/phonepe';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantOrderId = searchParams.get('merchantOrderId');

  if (!merchantOrderId) return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });

  try {
    await dbConnect();

    // 1. Get the latest status from PhonePe
    const token = await getAccessToken();
    const statusUrl = process.env.PHONEPE_ENV === 'production'
      ? `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantOrderId}/status`
      : `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${merchantOrderId}/status`;

    const phonepeResponse = await fetch(`${statusUrl}?details=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      },
    });

    const phonepeData = await phonepeResponse.json();

    // 2. Fetch the corresponding order from your MongoDB
    const existingOrder = await Order.findOne({ merchantOrderId });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found in database" }, { status: 404 });
    }

    // 3. Sync Database if PhonePe says it's completed but Webhook hasn't hit yet
    if (phonepeData.state === "COMPLETED" && existingOrder.status !== "paid") {
      existingOrder.status = "paid";
      await existingOrder.save();
    }

    if (phonepeData.state === "FAILED" && existingOrder.status !== "failed") {
      existingOrder.status = "failed";
      await existingOrder.save();
    }

    if ((phonepeData.state === "USER_CANCEL" || phonepeData.state === "CANCELLED") && existingOrder.status !== "cancelled") {
      existingOrder.status = "cancelled";
      await existingOrder.save();
    }


    // 4. Return COMBINED data so the ConfirmationPage has everything it needs
    return NextResponse.json({
      ...phonepeData, // Contains 'state': 'COMPLETED'
      totalAmount: existingOrder.totalAmount, // Now this won't be NaN!
      items: existingOrder.items,
      customerName: existingOrder.customerName,
      paymentInstanceId: existingOrder.paymentInstanceId,
      id: existingOrder._id.toString()
    });

  } catch (error: any) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}