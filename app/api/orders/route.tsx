
import { orders } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";          
import { format } from "date-fns";
import {  getDb } from "@/db/drizzle";
import { render } from "@react-email/components";
import OrderSummary from "@/server/emails/OrderSummary";
import { CatIcon } from "lucide-react";
export const dynamic = "force-dynamic"; // Forces runtime execution

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessCode, orders: orderList, totalAmount, phone, notes } = body;

    // 1. Access code check — uses server-only env (Railway-safe)
    if (accessCode !== process.env.ACCESS_CODE) {
      console.log("Access code failed:", { received: accessCode, expected: process.env.ACCESS_CODE });
      return NextResponse.json({ error: "Wrong access code" }, { status: 403 });
    }

    // 2. Validate orders exist
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

    // 4. Insert order into Neon
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
    return NextResponse.json({ success: true, order: newOrder });
    
    }catch (err) {
    console.error("Error processing order:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  
  


  } 
  