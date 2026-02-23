import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import ApprovedVendor from '@/models/ApprovedVendor';
import Store from '@/models/Store';
import Product from '@/models/Product';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const email = user.emailAddresses[0].emailAddress.toLowerCase();

    // 1. Check if user is in the Approved Vendors list
    const whitelistEntry = await ApprovedVendor.findOne({ email });
    if (!whitelistEntry || !whitelistEntry.isApproved) {
      return NextResponse.json({ isApproved: false }, { status: 200 });
    }

    let store = null;
    let products = [];

    // 2. Check if this whitelist entry already has a linked storeId
    if (whitelistEntry.storeId) {
      store = await Store.findById(whitelistEntry.storeId);
    }

    // 3. If no store is linked, create one and update the whitelist
    if (!store) {
      // We create the store using ONLY the fields in your schema
      store = await Store.create({
        name: `${user.firstName || 'My'} Thrift Store`,
        description: "Welcome to my store!",
        activeItems: 0
      });

      // We save the link in the Whitelist, not the Store
      whitelistEntry.storeId = store._id;
      whitelistEntry.clerkUserId = user.id;
      await whitelistEntry.save();
    }

    // 4. Fetch products using the storeId from the whitelist
    products = await Product.find({ storeId: store._id });

    return NextResponse.json({
      isApproved: true,
      store,
      products
    });
  } catch (error: any) {
    console.error("Merchant Status Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}