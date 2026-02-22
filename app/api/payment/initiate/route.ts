// app/api/payment/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/phonepe';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product'; // Import your Product model

export async function POST(req: NextRequest) {
  try {
    const { userId, merchantOrderId, customerDetails, items, storeName } = await req.json();

    await dbConnect();

    // 1. SECURE AMOUNT CALCULATION
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      // Find the product in DB to get the REAL price
      const dbProduct = await Product.findById(item.product._id || item.product.id);
      
      if (!dbProduct) {
        throw new Error(`Product ${item.product.name} not found.`);
      }

      const itemSubtotal = dbProduct.price * item.quantity;
      totalAmount += itemSubtotal;

      // Re-construct the item object with DB-verified data
      validatedItems.push({
        product: {
          id: dbProduct._id.toString(),
          name: dbProduct.name,
          price: dbProduct.price, // Using DB price, not frontend price
        },
        quantity: item.quantity
      });
    }

    // 2. Combine Address fields
    const { address, city, state, zipCode } = customerDetails;
    const fullAddress = `${address}, ${city}, ${state} - ${zipCode}`;

    // 3. Generate PhonePe Token
    const token = await getAccessToken();

    // 4. Prepare PhonePe API Call using verified totalAmount
    const payUrl = process.env.PHONEPE_ENV === 'production'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

    const payload = {
      merchantOrderId,
      amount: Math.round(totalAmount * 100), // Securely calculated paisa
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

    // 5. Create the Order in MongoDB
    await Order.create({
      userId,
      merchantOrderId, 
      paymentIntentId: data.orderId, 
      customerName: customerDetails.fullName,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      shippingAddress: fullAddress,
      items: validatedItems, // Store the verified items
      storeName,
      totalAmount: totalAmount, // Store the verified total
      status: 'pending',
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Initiate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}