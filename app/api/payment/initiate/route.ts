// app/api/payment/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/phonepe';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
  try {
    const { amount, merchantOrderId, customerDetails, items, storeName } = await req.json();

    await dbConnect();

    // 1. Combine Address fields for your database
    const { address, city, state, zipCode } = customerDetails;
    const fullAddress = `${address}, ${city}, ${state} - ${zipCode}`;

    // 2. Generate PhonePe Token
    const token = await getAccessToken();

    // 3. Prepare PhonePe API Call
    const payUrl = process.env.PHONEPE_ENV === 'production'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

    const payload = {
      merchantOrderId,
      amount: amount * 100, // Amount in paisa
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ConfirmationPage?orderId=${merchantOrderId}`,
        }
      }
    };

    const response = await fetch(payUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "PhonePe Initiation Failed");

    // 4. Create the Order in MongoDB
    // We store PhonePe's orderId (Transaction ID) in paymentIntentId
    await Order.create({
      merchantOrderId: merchantOrderId, 
      paymentIntentId: data.orderId, // PhonePe's Transaction ID stored here
      customerName: customerDetails.fullName,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      shippingAddress: fullAddress,
      items,
      storeName,
      totalAmount: amount,
      status: 'pending',
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Initiate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}