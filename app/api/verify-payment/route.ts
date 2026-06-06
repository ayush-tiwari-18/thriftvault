import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const generated = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Signature mismatch" }, { status: 400 });
    }

    // Signature valid — update our Order record
    await dbConnect();

    const order = await Order.findOne({ merchantOrderId: razorpay_order_id });
    if (!order) {
      // No matching order, but signature valid — return success but warn
      console.warn("Payment verified but local order not found:", razorpay_order_id);
      return NextResponse.json({ success: true, warning: "Local order not found" });
    }

    order.status = 'paid';
    order.paymentIntentId = razorpay_payment_id;
    await order.save();

    // Clear customer's cart to avoid duplicate purchase (best-effort)
    try {
      await Cart.findOneAndUpdate({ userId: order.userId }, { items: [], storeId: null, storeName: '' });
    } catch (e) {
      console.warn('Failed to clear cart after payment:', e);
    }

    return NextResponse.json({ success: true, orderId: order._id.toString() });
  } catch (err: any) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
