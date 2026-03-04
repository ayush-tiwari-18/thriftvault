import { NextResponse, NextRequest } from 'next/server'; // Use NextRequest for better type safety
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import ApprovedVendor from '@/models/ApprovedVendor';

// Update the type definition for context to expect a Promise
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();
    
    // 1. Await the params before using them
    const { orderId } = await context.params; 
    
    const { status } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedStatuses = ["paid", "shipped", "delivered", "failed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await dbConnect();

    const vendor = await ApprovedVendor.findOne({ clerkUserId: userId });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 403 });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, storeId: vendor._id }, 
      { $set: { status: status } },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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