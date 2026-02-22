import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Product from "@/models/Product"; // Ensure you have your Product model imported

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, storeId, storeName } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await dbConnect();

    // 1. SECURE PRICE LOOKUP: Recalculate everything from the Database
    const line_items = await Promise.all(
      items.map(async (item: any) => {
        // Fetch the actual product from Cluster0 using the ID
        const dbProduct = await Product.findById(item.product.id || item.product._id);

        if (!dbProduct) {
          throw new Error(`Product ${item.product.name} no longer exists.`);
        }

        // Check if there is enough stock (Optional but recommended)
        if (dbProduct.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${dbProduct.name}`);
        }

        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: dbProduct.name,
              images: dbProduct.images && dbProduct.images.length > 0 ? [dbProduct.images[0]] : [],
              metadata: {
                productId: dbProduct._id.toString(),
              },
            },
            // CRITICAL: Use dbProduct.price, NOT item.product.price from the client
            unit_amount: Math.round(dbProduct.price * 100), 
          },
          quantity: item.quantity,
        };
      })
    );

    // 2. Create the Stripe Embedded Session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      // Pass metadata so the Webhook and Confirmation page know the details
      metadata: {
        userId,
        storeId,
        storeName,
      },
      line_items,
      // Collect shipping address if needed
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'IN'], 
      },
      return_url: `${req.headers.get('origin')}/ConfirmationPage?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ clientSecret: session.client_secret });

  } catch (error: any) {
    console.error("SECURE_CHECKOUT_ERROR:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to initialize secure checkout" }, 
      { status: 500 }
    );
  }
}