// app/api/payment/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/phonepe';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantOrderId = searchParams.get('merchantOrderId');

  if (!merchantOrderId) return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });

  try {
    const token = await getAccessToken();
    const statusUrl = process.env.PHONEPE_ENV === 'production'
      ? `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantOrderId}/status`
      : `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${merchantOrderId}/status`;

    const response = await fetch(`${statusUrl}?details=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      },
    });

    const data = await response.json();
    // Trust only the root-level "state" field
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}