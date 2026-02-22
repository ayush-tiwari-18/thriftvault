import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: Request) {
  await dbConnect();
  
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId');

  try {
    // If a storeId is provided, filter the products; otherwise, return all
    const filter = storeId ? { storeId } : {};
    const productsData = await Product.find(filter).sort({ createdAt: -1 }).lean();

    // Mapping _id to id prevents the 'unique key' error in your React maps
    const products = productsData.map((prod: any) => ({
      ...prod,
      id: prod._id.toString(),
      storeId: prod.storeId.toString()
    }));

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}