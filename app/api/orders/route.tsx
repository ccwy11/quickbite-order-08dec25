// src/app/api/orders/route.tsx

import { getDb } from "@/db/drizzle";
import { orders } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";


export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessCode, orders: orderList, phone, notes } = body;

    // 1. Access code
    if (accessCode !== process.env.ACCESS_CODE) {
      return NextResponse.json({ error: "Wrong access code" }, { status: 403 });
    }

    // 2. Validate orders
    if (!orderList || !Array.isArray(orderList) || orderList.length === 0) {
      return NextResponse.json({ error: "No orders submitted" }, { status: 400 });
    }

    // 3. Validate dates
    for (const order of orderList) {
      const date = new Date(order.deliveryDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: `Invalid date for ${order.dayName || "unknown day"}` },
          { status: 400 }
        );
      }
    }

    const db = getDb();
    const weekStartDate = new Date(orderList[0].deliveryDate);

    // 4. Insert order
    const [newOrder] = await db
      .insert(orders)
      .values({
        deliveryWeek: weekStartDate,

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mainItems: orderList.map((o: any) => ({
          day: o.dayName,
          items: o.mainItems || [],
        })),
        choices: Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orderList.map((o: any) => [
            o.dayName,
            {
              snacks: o.snacks || "None",
              egg: o.egg || "None",
              appetizer: o.appetizer || "None",
            },
          ])
        ),
        // totalAmount,
        phone,
        notes: notes || null,
      })
      .returning();

    // 5. YOUR EXACT RESEND BLOCK — NOW WORKING IN DOCKER
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        // Dynamic import of the template — skips build time!
        const OrderSummary = (await import("@/server/emails/OrderSummary")).default;

        const { data, error } = await resend.emails.send({

        //  from: "Kitchen Orders <onboarding@resend.dev>",
        //   to: ["you@gmail.com"], // Change to your real email


              from: 'Acme <onboarding@resend.dev>',
          to: ['delivered@resend.dev'],
    //                   from: 'orders <order@notification.altertechdesign.com>',
    // to: ['ccwy1120@hotmail.com'],
          subject: `New Weekly Order #${newOrder.id} – `,
          react: <OrderSummary order={newOrder} />,
        });

        if (error) {
          console.error("Resend email failed:", error);
        } else {
          console.log("Email sent successfully:", data?.id);
        }
        console.log("Email sent!");
      } catch (emailErr) {
        console.error("Email failed:", emailErr);
      }
    } else {
      console.warn("RESEND_API_KEY not set – email skipped");
    }

    return NextResponse.json({ success: true, order: newOrder });
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Order submission failed:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
