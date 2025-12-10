// src/app/admin/menu/page.tsx

import MenuEditorClient from "./MenuEditorClient";

export const dynamic = "force-dynamic";

export default async function MenuEditorPage() {
  // This runs on the server — safe for DB calls
  const { getDb } = await import("@/db/drizzle");
  const { menuWeeks } = await import("@/db/schema");
  const { addWeeks, startOfWeek, format, isBefore } = await import("date-fns");
  const { inArray } = await import("drizzle-orm");

  const db = getDb();

  const weeks = Array.from({ length: 4 }, (_, i) => {
    const monday = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
    return {
      monday,
      iso: format(monday, "yyyy-MM-dd"),
      label: `Week ${i + 1} – ${format(monday, "dd MMM yyyy")}`,
      isPast: isBefore(monday, new Date()),
    };
  });

  const savedMenus = await db
    .select()
    .from(menuWeeks)
    .where(inArray(menuWeeks.weekStartDate, weeks.map(w => w.iso)));

  const menuMap = Object.fromEntries(savedMenus.map(m => [m.weekStartDate, m]));

  const defaultItems = ["Chicken Biryani", "Mutton Karahi", "Seekh Kebab", "Raita", "Extra Rice", "", ""];

  // Use first saved week for shared extras, fallback to defaults
  const globalExtras = savedMenus[0] || {
    snacks: ["None", "Samosa (2pcs)", "Pakora Plate", "Spring Rolls"],
    eggs: ["None", "Boiled Egg", "Fried Egg", "Omelette"],
    appetizers: ["None", "Papadum", "Onion Bhaji", "Chicken Tikka (2pcs)"],
  };

  const initialData = {
    weeks,
    menuMap,
    defaultItems,
    globalExtras,
  };

  return <MenuEditorClient initialData={initialData} />;
}