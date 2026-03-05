import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/phonepe';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(req: NextRequest) {
  try {
    const { userId, merchantOrderId, customerDetails, items, storeName, storeId } = await req.json();

    await dbConnect();

    let totalAmount = 0;
    const validatedItems = [];

    // 1. CONSOLIDATED STOCK & PRICE CHECK
    for (const item of items) {
      const dbProduct = await Product.findById(item.product._id || item.product.id);
      
      if (!dbProduct) {
        return NextResponse.json({ error: `Product ${item.product.name} no longer exists.` }, { status: 404 });
      }

      // BLOCK INITIATION IF OUT OF STOCK
      if (dbProduct.quantity <= 0) {
        return NextResponse.json({ 
          error: "OUT_OF_STOCK", 
          message: `${dbProduct.name} was just sold! Please remove it from your cart.` 
        }, { status: 400 });
      }

      const itemSubtotal = dbProduct.price * item.quantity;
      totalAmount += itemSubtotal;

      validatedItems.push({
        productId: dbProduct._id.toString(), // Store as string for easy lookup later
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity
      });
    }

    const { address, city, state, zipCode } = customerDetails;
    const fullAddress = `${address}, ${city}, ${state} - ${zipCode}`;
    const token = await getAccessToken();

    const payUrl = process.env.PHONEPE_ENV === 'production'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

    const payload = {
      merchantOrderId,
      amount: Math.round(totalAmount * 100),
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

    // 2. CREATE PENDING ORDER
    await Order.create({
      userId,
      merchantOrderId, 
      customerName: customerDetails.fullName,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      shippingAddress: fullAddress,
      items: validatedItems,
      storeName,
      storeId,
      totalAmount: totalAmount,
      status: 'pending',
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Initiate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}