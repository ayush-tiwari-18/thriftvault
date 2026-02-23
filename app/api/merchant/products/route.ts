import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Store from '@/models/Store';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    // 1. Security Check
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    // 2. Data Transformation
    // Destructure 'price' and 'image' to handle them specifically
    const { price, image, ...rest } = body;

    const formattedProduct = {
      ...rest,
      // Convert the price string to a number
      price: Number(price),
      // Append the single image URL into the images array
      images: [image], 
      quantity: 1
    };

    // 3. Database Creation
    const newProduct = await Product.create(formattedProduct);
    await Store.findByIdAndUpdate(
      body.storeId, 
      { $inc: { activeItems: 1 } }, // Atomic increment
      { new: true }
    );
    return NextResponse.json(newProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// EDIT & DELETE PRODUCT
export async function PATCH(req: NextRequest) {
  const { productId, ...updates } = await req.json();
  await dbConnect();
  const updated = await Product.findByIdAndUpdate(productId, updates, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Find the product first to get the associated storeId
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const storeId = product.storeId;

    // 2. Delete the product from the collection
    await Product.findByIdAndDelete(productId);

    // 3. Decrement activeItems using $inc with -1
    if (storeId) {
      await Store.findByIdAndUpdate(
        storeId,
        { $inc: { activeItems: -1 } }, // MongoDB uses $inc for both adding and subtracting
        { new: true }
      );
    }

    return NextResponse.json({ message: "Product deleted and store count updated" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}