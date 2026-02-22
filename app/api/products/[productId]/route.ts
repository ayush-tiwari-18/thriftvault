import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

/**
 * GET: Fetch a single product by its ID
 * Next.js 15+ requires params to be treated as a Promise.
 */
export async function GET(
  request: NextRequest, // Changed from 'Request' for better Next.js type support
  { params }: { params: Promise<{ productId: string }> } // FIXED: Defined as Promise
) {
  try {
    await dbConnect();

    // FIXED: Awaiting the params promise before destructuring
    const { productId } = await params;

    // Use .lean() to get a plain JS object (better for serialization)
    const productData: any = await Product.findById(productId).lean();

    if (!productData) {
      return NextResponse.json(
        { error: "Product not found" }, 
        { status: 404 }
      );
    }

    // Prepare the object for the frontend
    const product = {
      ...productData,
      id: productData._id.toString(),
      // Check if storeId exists before calling toString to avoid crashes
      storeId: productData.storeId?.toString() || "", 
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error("Fetch product error:", error);
    
    // Likely a Mongoose "CastError" if the ID format is wrong
    return NextResponse.json(
      { error: "Invalid Product ID format" }, 
      { status: 400 }
    );
  }
}