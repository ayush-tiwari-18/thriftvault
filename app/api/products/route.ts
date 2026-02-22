import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: NextRequest) { // Use NextRequest
  try {
    await dbConnect();
    
    // Use request.nextUrl for better compatibility with Vercel's edge runtime
    const storeId = request.nextUrl.searchParams.get('storeId');

    const filter = storeId ? { storeId } : {};
    const productsData = await Product.find(filter).sort({ createdAt: -1 }).lean();

    const products = productsData.map((prod: any) => ({
      ...prod,
      id: prod._id.toString(),
      // Use optional chaining to prevent crashes if storeId is missing
      storeId: prod.storeId?.toString() || "" 
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}