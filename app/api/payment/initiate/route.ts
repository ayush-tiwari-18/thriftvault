// app/api/payment/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/phonepe';

export async function POST(req: NextRequest) {
  try {
    const { amount, merchantOrderId } = await req.json();
    const token = await getAccessToken();

    const payUrl = process.env.PHONEPE_ENV === 'production'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

    const payload = {
      merchantOrderId,
      amount: amount * 100, // Amount in paisa
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          // URL where user lands after IFrame closes or redirect finishes
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ConfirmationPage?orderId=${merchantOrderId}`,
        }
      }
    };

    const response = await fetch(payUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}` // Mandatory O-Bearer header
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}