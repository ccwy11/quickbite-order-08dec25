// src/app/admin/menu/MenuEditorClient.tsx

"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export default function MenuEditorClient({ initialData }: { initialData: any }) {
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggleWeek = (iso: string) => {
    setCollapsed(prev =>
      prev.includes(iso) ? prev.filter(x => x !== iso) : [...prev, iso]
    );
  };

  // Auto-collapse past weeks
  useEffect(() => {
    const pastWeeks = initialData.weeks
      .filter((w: any) => w.isPast)
      .map((w: any) => w.iso);
    setCollapsed(pastWeeks);
  }, [initialData.weeks]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">
          Menu Editor – Next 4 Weeks
        </h1>

        <form action="/api/admin/menu" method="POST" className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="p-4 text-left font-bold">Week</th>
                {DAYS.map(day => (
                  <th key={day} className="p-4 text-center font-medium">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialData.weeks.map(({ monday, iso, label, isPast }: any) => {
                const saved = initialData.menuMap[iso];
                const items = saved?.mainItems?.map((i: any) => i.name) || initialData.defaultItems;
                const isCollapsed = collapsed.includes(iso);

                return (
                  <tr key={iso} className="border-b-2 border-gray-200">
                    <td className="p-6 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => toggleWeek(iso)}
                        className="flex items-center gap-3 font-bold text-gray-800 w-full text-left"
                      >
                        {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                        {label}
                        {isPast && <span className="ml-4 text-sm text-gray-500">(Past – Read Only)</span>}
                      </button>
                    </td>

                    {DAYS.map((day, idx) => (
                      <td key={day} className={`p-4 transition-all ${isCollapsed ? "hidden" : ""}`}>
                        {[0, 1, 2, 3].map(row => {
                          const index = idx * 4 + row;
                          const value = items[index] || "";

                          return (
                            <input
                              key={row}
                              type="text"
                              name={`menu[${iso}][${index}]`}
                              defaultValue={value}
                              placeholder={`Item ${row + 1}`}
                              disabled={isPast}
                              className={`w-full mb-3 px-4 py-3 border-2 rounded-lg focus:border-green-500 transition ${
                                isPast
                                  ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                                  : "border-gray-300 focus:ring-2 focus:ring-green-200"
                              }`}
                            />
                          );
                        })}
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
                {initialData.globalExtras.snacks.map((item: string, i: number) => (
                  <input
                    key={i}
                    type="text"
                    name={`snacks[${i}]`}
                    defaultValue={item}
                    className="w-full mb-3 px-4 py-3 border rounded-lg"
                  />
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Egg Choice</h3>
                {initialData.globalExtras.eggs.map((item: string, i: number) => (
                  <input
                    key={i}
                    type="text"
                    name={`eggs[${i}]`}
                    defaultValue={item}
                    className="w-full mb-3 px-4 py-3 border rounded-lg"
                  />
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Appetizer</h3>
                {initialData.globalExtras.appetizers.map((item: string, i: number) => (
                  <input
                    key={i}
                    type="text"
                    name={`appetizers[${i}]`}
                    defaultValue={item}
                    className="w-full mb-3 px-4 py-3 border rounded-lg"
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