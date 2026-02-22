import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Store from '@/models/Store';

export async function GET() {
  await dbConnect();
  try {
    // .lean() makes the query faster by returning plain JS objects
    const storesData = await Store.find({}).sort({ createdAt: -1 }).lean();

    // Map the MongoDB _id to a string id for the frontend
    const stores = storesData.map((store: any) => ({
      ...store,
      id: store._id.toString(), 
    }));

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Fetch stores error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}