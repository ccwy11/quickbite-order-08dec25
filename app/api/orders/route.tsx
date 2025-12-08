
import { orders } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";          
import { format } from "date-fns";
import {  getDb } from "@/db/drizzle";
import { render } from "@react-email/components";
import OrderSummary from "@/server/emails/OrderSummary";

export const dynamic = 'force-dynamic'
// src/app/api/orders/route.ts


export async function POST(req: NextRequest) {
  const body = await req.json();
  const { accessCode, orders: orderList, totalAmount, phone, notes } = body;

  // 1. Access code
  if (accessCode !== process.env.ACCESS_CODE) {
    return Response.json({ error: "Wrong access code" }, { status: 403 });
  }

  // 2. Validate we actually have orders
  if (!orderList || !Array.isArray(orderList) || orderList.length === 0) {
    return Response.json({ error: "No orders submitted" }, { status: 400 });
  }
const drizzleDb = getDb();
  // 3. Validate dates
  for (const order of orderList) {
    const date = new Date(order.deliveryDate);
    if (isNaN(date.getTime())) {
      return Response.json({ error: `Invalid date for ${order.dayName || "unknown day"}` }, { status: 400 });
    }
  }

  // 4. Pick first valid date as week reference (safe now)
  const weekStartDate = new Date(orderList[0].deliveryDate);
  // Lazy DB (your existing fix)
  const db = getDb();
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
  

// LAZY RESEND – Only init here (runtime, after env loaded)
if (process.env.RESEND_API_KEY) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Kitchen Orders <onboarding@resend.dev>",
      to: ["you@gmail.com"], // Replace with your real email
      subject: `New Weekly Order #${newOrder.id} – Rs.${totalAmount}`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      react: <OrderSummary order={newOrder} />,
    });

    if (error) {
      console.error("Resend email failed:", error);
    } else {
      console.log("Email sent successfully:", data?.id);
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // This catches import errors, auth errors, network issues, etc.
    console.error("Failed to send email via Resend:", err.message || err);
    // Optional: Send fallback via Telegram if you have it
    // await sendTelegramFallback(newOrder);
  }
} else {
  console.warn("RESEND_API_KEY not set – email skipped");
}

  } 
  