// src/app/admin/menu/page.tsx

import { getDb } from "@/db/drizzle";
import { menuWeeks } from "@/db/schema";
import { addWeeks, startOfWeek, format } from "date-fns";
import { inArray } from "drizzle-orm";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export default async function MenuEditor() {
  const db = getDb();

  const weeks = Array.from({ length: 4 }, (_, i) => {
    const monday = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
    return {
      monday,
      iso: format(monday, "yyyy-MM-dd"),
      label: `Week ${i + 1} – ${format(monday, "dd MMM")}`,
    };
  });

  const savedMenus = await db
    .select()
    .from(menuWeeks)
    .where(inArray(menuWeeks.weekStartDate, weeks.map(w => w.iso)));

  const menuMap = Object.fromEntries(savedMenus.map(m => [m.weekStartDate, m]));

  const defaultItems = ["Chicken Biryani", "Seekh Kebab", "Raita", "Salad", "Extra Rice"];

  const globalExtras = savedMenus[0] || {
    snacks: ["None", "Samosa (2pcs)", "Pakora Plate", "Spring Rolls"],
    eggs: ["None", "Boiled Egg", "Fried Egg", "Omelette"],
    appetizers: ["None", "Papadum", "Onion Bhaji", "Chicken Tikka (2pcs)"],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">
          Menu Editor – Next 4 Weeks
        </h1>

        {/* SINGLE FORM FOR EVERYTHING */}
        <form action="/api/admin/menu" method="POST" className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* MAIN MENU TABLE */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="p-4 text-left">Week</th>
                {WEEK_DAYS.map(day => (
                  <th key={day} className="p-4 text-center font-medium">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map(({ monday, iso, label }) => {
                const saved = menuMap[iso];
                const items = saved?.mainItems?.map((i: any) => i.name) || defaultItems;

                return (
                  <tr key={iso} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-700">{label}</td>
                    {WEEK_DAYS.map((day, idx) => (
                      <td key={day} className="p-4 text-center">
                        <textarea
                          name={`menu[${iso}][${idx}]`}
                          defaultValue={items[idx] || ""}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                          placeholder="e.g. Chicken Biryani"
                          required
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* SHARED EXTRAS */}
          <div className="p-8 bg-gray-50 border-t">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Shared Extras (All Weeks)</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">Snacks</h3>
                {globalExtras.snacks.map((item: string, i: number) => (
                  <input
                    key={i}
                    type="text"
                    name={`snacks[${i}]`}
                    defaultValue={item}
                    className="w-full mb-3 px-4 py-3 border rounded-lg"
                    placeholder="e.g. Samosa (2pcs)"
                  />
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Egg Choice</h3>
                {globalExtras.eggs.map((item: string, i: number) => (
                  <input
                    key={i}
                    type="text"
                    name={`eggs[${i}]`}
                    defaultValue={item}
                    className="w-full mb-3 px-4 py-3 border rounded-lg"
                    placeholder="e.g. Boiled Egg"
                  />
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Appetizer</h3>
                {globalExtras.appetizers.map((item: string, i: number) => (
                  <input
                    key={i}
                    type="text"
                    name={`appetizers[${i}]`}
                    defaultValue={item}
                    className="w-full mb-3 px-4 py-3 border rounded-lg"
                    placeholder="e.g. Papadum"
                  />
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-20 py-6 rounded-xl shadow-lg transition"
              >
                Save All Menus + Extras
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}