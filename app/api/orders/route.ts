import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Use .find() to get ALL orders where the 'userId' field matches
    // Use .sort() to show newest orders first
    const ordersData = await Order.find({ userId }).sort({ createdAt: -1 }).lean();

    // If no orders are found, 'ordersData' will be an empty array [].
    // We return this with a 200 status so the frontend can show "No orders yet".
    return NextResponse.json(ordersData);

  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    // Log the body to ensure all fields required by your schema are present
    console.log("Incoming Order Body:", body);

    const newOrder = await Order.create({
      ...body,
      userId,
      status: 'paid', 
    });

    return NextResponse.json({ id: newOrder._id.toString() }, { status: 201 });
  } catch (error: any) {
    // This is the most important part for debugging
    console.error("--- MONGODB SYNC ERROR ---");
    console.error("Message:", error.message);
    
    // If it's a validation error, this will show exactly which field failed
    if (error.errors) {
      console.error("Validation Details:", Object.keys(error.errors).map(key => ({
        field: key,
        reason: error.errors[key].message
      })));
    }
    
    return NextResponse.json({ 
      error: error.message || "Failed to create order" 
    }, { status: 500 });
  }
}