import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import Order from '@/models/Order';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn("Razorpay keys are not set in environment variables.");
}

const razorpay = new Razorpay({
  key_id: keyId || "",
  key_secret: keySecret || "",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    // Recompute authoritative cart from server-side persisted cart
    const cart = await Cart.findOne({ userId }).lean();
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Compute total in rupees (product.price is stored in rupees in the app)
    const totalAmount = cart.items.reduce((s: number, i: any) => s + (Number(i.product?.price || 0) * Number(i.quantity || 0)), 0);

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });
    }

    // Create a pending Order document so we have an authoritative record
    const newOrder = await Order.create({
      userId,
      storeId: cart.storeId || null,
      storeName: cart.storeName || "",
      items: cart.items,
      totalAmount,
      status: 'pending',
    });

    // Razorpay expects amount in paise
    const amountInPaise = Math.round(totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${newOrder._id.toString()}`,
      payment_capture: 1,
    } as any;

    const razorOrder = await razorpay.orders.create(options);

    // Save the Razorpay order id to our order for later verification
    newOrder.merchantOrderId = razorOrder.id;
    await newOrder.save();

    return NextResponse.json({ order_id: razorOrder.id, amount: razorOrder.amount, currency: razorOrder.currency, localOrderId: newOrder._id.toString() });
  } catch (err: any) {
    if (err?.statusCode === 401) {
      return NextResponse.json({ error: "Authentication failed with Razorpay" }, { status: 401 });
    }
    console.error("Create order error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
