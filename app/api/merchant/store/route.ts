// app/api/merchant/store/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Store from '@/models/Store';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { storeId, ...updates } = body;

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    // Update the store in Cluster0 using the fields from your schema
    const updatedStore = await Store.findByIdAndUpdate(
      storeId, 
      { $set: updates }, 
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStore);
  } catch (error: any) {
    console.error("Store Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}