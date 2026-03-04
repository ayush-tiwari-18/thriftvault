import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import ApprovedVendor from '@/models/ApprovedVendor';

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId } = await auth();
    const { orderId } = params;
    const { status } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the new status is one of your allowed types
    const allowedStatuses = ["paid", "shipped", "delivered", "failed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await dbConnect();

    // 1. Security Check: Ensure this merchant owns the store associated with the order
    const vendor = await ApprovedVendor.findOne({ clerkUserId: userId });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 403 });
    }

    // 2. Update the order only if the storeId matches the vendor's ID
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, storeId: vendor._id }, 
      { $set: { status: status } },
      { new: true } // Return the document after the update
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Status updated successfully", 
      order: updatedOrder 
    });

  } catch (error: any) {
    console.error("Status Update API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}