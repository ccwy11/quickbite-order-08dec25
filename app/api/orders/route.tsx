
import { orders } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";          
import { Resend } from "resend";

import { format } from "date-fns";
import { db } from "@/db/drizzle";
import OrderSummary from "@/server/emails/OrderSummary";
import { render } from "@react-email/components";

const resend = new Resend(process.env.RESEND_API_KEY);

// src/app/api/orders/route.ts


export async function POST(req: NextRequest) {
  const body = await req.json();
  const { accessCode, orders: orderList, totalAmount, phone, notes } = body;

  // 1. Access code
  if (accessCode !== process.env.NEXT_PUBLIC_ACCESS_CODE) {
    return Response.json({ error: "Wrong access code" }, { status: 403 });
  }

  // 2. Validate we actually have orders
  if (!orderList || !Array.isArray(orderList) || orderList.length === 0) {
    return Response.json({ error: "No orders submitted" }, { status: 400 });
  }

  // 3. Validate dates
  for (const order of orderList) {
    const date = new Date(order.deliveryDate);
    if (isNaN(date.getTime())) {
      return Response.json({ error: `Invalid date for ${order.dayName || "unknown day"}` }, { status: 400 });
    }
  }

  // 4. Pick first valid date as week reference (safe now)
  const weekStartDate = new Date(orderList[0].deliveryDate);

  // 5. Insert the weekly batch
  const [newOrder] = await db
    .insert(orders)
    .values({
      deliveryWeek: weekStartDate,
      mainItems: orderList.map(o => ({
        day: o.dayName,
        items: o.mainItems || [],
      })),
      choices: Object.fromEntries(
        orderList.map(o => [
          o.dayName,
          {
            snacks: o.snacks || "None",
            egg: o.egg || "None",
            appetizer: o.appetizer || "None",
          },
        ])
      ),
      totalAmount,
      phone,
      notes: notes || null,
    })
    .returning();

  // 6. Send email
// Send confirmation email (Resend magic)
const { data, error } = await resend.emails.send({

   from: 'Acme <onboarding@resend.dev>',
    to: ['delivered@resend.dev'],
      // from: "Kitchen Orders <onboarding@resend.dev>",  // Swap to your verified domain later
      // to: [phone || "you@gmail.com"],  // Send to customer's phone-as-email or your admin
     subject: `New Weekly Order #${newOrder.id} – Rs.${totalAmount}`,
      react: <OrderSummary order={newOrder} />,  // Your component here
    });

    if (error) {
      console.error("Resend error:", error);  // Log for debug, but don't crash order
    } else {
      console.log("Email sent:", data?.id);  // Success log
    }

    return NextResponse.json({ success: true, order: newOrder });

  } 
  