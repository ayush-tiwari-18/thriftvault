import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Updated to the Clover API version
  apiVersion: "2026-01-28.clover", 
});

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    await dbConnect();

    // 1. Retrieve and expand the session
    // Casting to 'any' ensures 'shipping_details' and 'line_items' are accessible
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    }) as any; 

    // 2. Security Check: Ensure payment is actually confirmed
    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
    }

    // 3. Prevent Duplicate Orders in Cluster0
    let order = await Order.findOne({ paymentIntentId: sessionId });

    if (!order) {
      const metadata = session.metadata || {};
      
      // Handle potential empty shipping data fallback
      const shipping = session.shipping_details || session.customer_details;
      const address = shipping?.address 
        ? `${shipping.address.line1}, ${shipping.address.city}, ${shipping.address.postal_code}`
        : "Pickup/Digital";

      // 4. Create the formal record in your database
      order = await Order.create({
        userId: userId,
        storeId: metadata.storeId,
        storeName: metadata.storeName,
        customerName: session.customer_details?.name || "Customer",
        customerEmail: session.customer_details?.email || "",
        shippingAddress: address,
        totalAmount: (session.amount_total || 0) / 100, // Stripe cents to Dollars
        paymentIntentId: sessionId,
        status: 'paid',
        items: session.line_items?.data.map((item: any) => ({
          product: { 
            name: item.description, 
            price: (item.amount_total / 100) / (item.quantity || 1) 
          },
          quantity: item.quantity
        }))
      });
    }

    return NextResponse.json({ order }, { status: 200 });

  } catch (error: any) {
    console.error("STRIPE_VERIFY_ERROR:", error.message);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}