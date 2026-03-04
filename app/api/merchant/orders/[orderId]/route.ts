import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import ApprovedVendor from '@/models/ApprovedVendor';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();
    const { orderId } = await context.params;
    const { status } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Find the vendor record
    const vendor = await ApprovedVendor.findOne({ clerkUserId: userId });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 403 });
    }

    // 2. Logic Fix: Convert vendor._id to a string to match the Order schema storeId
    // Also use 'returnDocument: after' to fix the console warning in your screenshot
    const updatedOrder = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        storeId: vendor.storeId.toString() // String conversion is key here
      }, 
      { $set: { status: status } },
      { returnDocument: 'after' } 
    );

    // 3. If no order is found, it means the storeId in the DB doesn't match this vendor
    if (!updatedOrder) {
      console.log(`Mismatch: Order ${orderId} does not belong to Vendor ${vendor._id}`);
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Status updated", 
      order: updatedOrder 
    });

  } catch (error: any) {
    console.error("Status Update API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}