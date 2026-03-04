import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import ApprovedVendor from '@/models/ApprovedVendor';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Use .find() to get ALL orders where the 'userId' field matches
    // Use .sort() to show newest orders first
    const vendor= await ApprovedVendor.findOne({clerkUserId: userId});
    if (!vendor) {
      return NextResponse.json({ error: "Store not found for this user" }, { status: 404 });
    }
    const ordersData = await Order.find({ storeId: vendor.storeId, status:"paid" }).sort({ createdAt: -1 }).lean();

    // If no orders are found, 'ordersData' will be an empty array [].
    // We return this with a 200 status so the frontend can show "No orders yet".
    return NextResponse.json(ordersData);

  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

