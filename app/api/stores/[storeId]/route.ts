import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Store from '@/models/Store';

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  await dbConnect();
  const { storeId } = await params; // Await params in Next.js 16

  try {
    const storeData = await Store.findById(storeId).lean();

    if (!storeData) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Map _id to id so your frontend doesn't get 'undefined'
    const store = {
      ...storeData,
      id: storeData._id.toString(),
    };

    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }
}