// src/app/api/menu/active/route.ts

import { getDb } from "@/db/drizzle";
import { menuWeeks } from "@/db/schema";
import { startOfWeek, addWeeks, isAfter } from "date-fns";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {const db = getDb();
  const now = new Date();

  // Week starts Monday
  const thisMonday = startOfWeek(now, { weekStartsOn: 1 });
  const nextMonday = addWeeks(thisMonday, 1);

  // Show NEXT week menu until Sunday night
  const targetMonday = isAfter(now, thisMonday) ? nextMonday : thisMonday;
      const result = await db
    .select()
    .from(menuWeeks)
    .where(eq(menuWeeks.weekStartDate, targetMonday))
    .limit(1);
  if (result[0]) {
    return Response.json(result[0]);
    
    
  } return Response.json({
    mainItems: [
      { name: "Chicken Biryani", price: 480 },
      { name: "Seekh Kebab", price: 350 },
      { name: "Raita", price: 50 },
      { name: "Salad", price: 70 },
      { name: "Extra Rice", price: 100 },
    ],
    snacks: ["None", "Samosa (2pcs)", "Pakora Plate", "Spring Rolls"],
    eggs: ["None", "Boiled Egg", "Fried Egg", "Omelette"],
    appetizers: ["None", "Papadum", "Onion Bhaji", "Chicken Tikka (2pcs)"],
    weekStartDate: targetMonday.toISOString().split("T")[0],
  });

}
  catch (err: any) {
    console.error("Menu fetch failed:", err);
    return Response.json({ error: err.message }, { status: 500 });
  } 

  
}