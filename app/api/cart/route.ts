import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; 
import Cart from '@/models/Cart';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the cart and convert to a plain object to ensure 'id' virtuals work
    let cart = await Cart.findOne({ userId }).lean({ virtuals: true });
    
    if (!cart) {
      // Return a default structure if no cart exists yet
      return NextResponse.json({ 
        userId, 
        storeId: null, 
        storeName: '', 
        items: [] 
      });
    }

    return NextResponse.json(cart);
  } catch (error: any) {
    console.error("Cart GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { 
        $set: {
          items: body.items,
          storeId: body.storeId,
          storeName: body.storeName
        } 
      },
      { new: true, upsert: true, runValidators: true }
    ).lean({ virtuals: true });

    return NextResponse.json(cart);
  } catch (error: any) {
    console.error("Cart POST Error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}