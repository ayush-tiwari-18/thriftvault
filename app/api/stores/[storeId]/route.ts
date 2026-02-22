import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Store from '@/models/Store';

export async function GET(
  request: NextRequest, // Recommended: Use NextRequest for consistency
  { params }: { params: Promise<{ storeId: string }> } // FIXED: Define as Promise
) {
  try {
    await dbConnect();

    // Awaiting params works now because the type is defined as Promise
    const { storeId } = await params; 

    const storeData: any = await Store.findById(storeId).lean();

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
    console.error("Store fetch error:", error);
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }
}