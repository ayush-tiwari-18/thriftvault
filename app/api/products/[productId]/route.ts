import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  await dbConnect();

  // In Next.js 16, params must be awaited to access its properties
  const { productId } = await params;

  try {
    // .lean() returns a plain JavaScript object for better performance
    const productData = await Product.findById(productId).lean();

    if (!productData) {
      return NextResponse.json(
        { error: "Product not found" }, 
        { status: 404 }
      );
    }

    // Map _id to id so the frontend component can use product.id
    const product = {
      ...productData,
      id: productData._id.toString(),
      storeId: productData.storeId.toString(), // Ensure storeId is also a string
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error("Fetch product error:", error);
    return NextResponse.json(
      { error: "Invalid Product ID format" }, 
      { status: 400 }
    );
  }
}