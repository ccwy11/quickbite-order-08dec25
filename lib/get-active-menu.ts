import { getDb } from "@/db/drizzle";
import { menuWeeks } from "@/db/schema";
import { startOfWeek, isAfter, isBefore, addWeeks } from "date-fns";
import { eq } from "drizzle-orm";

export async function getActiveMenu() {
  const db = getDb();
  const now = new Date();

  // Week starts on Monday
  const thisMonday = startOfWeek(now, { weekStartsOn: 1 });
  const nextMonday = addWeeks(thisMonday, 1);

  // If today is Monday to Sunday → show NEXT week's menu
  // If today is Sunday 23:59 → still show next week (customer can order early)
  // Only on Monday 00:00+ → switch to this week
  const targetMonday = isAfter(now, thisMonday) ? nextMonday : thisMonday;

  const iso = targetMonday.toISOString().split("T")[0];

  const result = await db
    .select()
    .from(menuWeeks)
    .where(eq(menuWeeks.weekStartDate, iso))
    .limit(1);

  if (result[0]) {
    return result[0];
  } else {
        // Fallback if no menu saved yet
      return {
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
    weekStartDate: iso,
      }
  }

}