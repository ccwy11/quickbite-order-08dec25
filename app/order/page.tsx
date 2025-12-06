"use client";

import { useState, useMemo } from "react";
import weeklyMenu from "@/data/weekly-menu.json";
import { format, addDays, getDay } from "date-fns";
import { Loader2 } from "lucide-react";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const deliveryDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

export default function OrderPage() {
  const [selectedDate, setSelectedDate] = useState(deliveryDates[0]);
  const [items, setItems] = useState([{ id: "", qty: 1 }]);
  const [options, setOptions] = useState({ spice: "Medium", rice: "Normal", addons: [] as string[] });
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get menu for selected day
  const dayName = dayNames[getDay(selectedDate)];
  const todayMenu = weeklyMenu.weeklyMenu[dayName as keyof typeof weeklyMenu.weeklyMenu] || [];

  // Auto-reset items when date changes
  useMemo(() => {
    if (todayMenu.length > 0 && items[0]?.id === "") {
      setItems([{ id: todayMenu[0].id, qty: 1 }]);
    }
  }, [selectedDate]);

  const total = items.reduce((sum, item) => {
    const menuItem = todayMenu.find(m => m.id === item.id);
    return sum + (menuItem?.price || 0) * item.qty;
  }, 0);

  const onSubmit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        accessCode: "biryani2025",
        customerName: customer.name,
        phone: customer.phone,
        address: customer.address,
        items: items.map(i => ({ ...todayMenu.find(m => m.id === i.id), qty: i.qty })),
        options,
        notes: customer.notes,
        deliveryDate: selectedDate,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => location.reload(), 4000);
    } else {
      alert("Failed — check console");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-500 text-white p-6 text-center">
        <h1 className="text-3xl font-bold">Weekly Menu Order</h1>
        <p className="mt-mt-1 opacity-90">Pick your day → See today's specials</p>
      </div>

      {success && (
        <div className="mx-4 mt-6 bg-green-50 border-2 border-green-300 text-green-800 p-6 rounded-2xl text-center font-bold text-xl">
          Order Confirmed for {format(selectedDate, "EEEE, dd MMM")}!
        </div>
      )}

      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24">
        {/* Date Picker */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="font-bold text-lg mb-4">Select Delivery Day</h3>
          <div className="grid grid-cols-4 gap-3">
            {deliveryDates.map(d => {
              const dName = dayNames[getDay(d)];
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => { setSelectedDate(d); setItems([{ id: "", qty: 1 }]); }}
                  className={`py-4 rounded-2xl font-medium transition ${
                    selectedDate.toDateString() === d.toDateString()
                      ? "bg-green-500 text-white shadow-lg scale-105"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="text-xs opacity-80">{dName}</div>
                  <div className="text-lg">{format(d, "dd")}</div>
                  <div className="text-xs">{format(d, "MMM")}</div>
                </button>
              );
            })}
          </div>
          <p className="text-center mt-4 font-bold text-green-600">
            {dayName} Special: {todayMenu.map(i => i.name).join(" + ")}
          </p>
        </div>

        {/* Menu Items — Only for selected day */}
        {todayMenu.length === 0 ? (
          <div className="bg-red-50 border border-red-300 text-red-700 p-6 rounded-2xl text-center">
            No items available on {dayName}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow space-y-4">
            <h3 className="font-bold text-lg">{dayName} Menu</h3>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-green-50 p-4 rounded-xl">
                <select
                  value={item.id}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].id = e.target.value;
                    setItems(newItems);
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">Select item</option>
                  {todayMenu.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} – Rs.{m.price}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-3">
                  <button onClick={() => setItems(items.map((i, ci) => ci === idx ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                    className="w-10 h-10 rounded-full bg-gray-300">−</button>
                  <span className="w-12 text-center font-bold text-lg">{item.qty}</span>
                  <button onClick={() => setItems(items.map((i, ci) => ci === idx ? { ...i, qty: i.qty + 1 } : i))}
                    className="w-10 h-10 rounded-full bg-green-500 text-white">+</button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setItems([...items, { id: "", qty: 1 }])}
              className="w-full py-3 border-2 border-dashed border-green-500 text-green-600 rounded-xl text-sm font-medium"
            >
              + Add Another Item
            </button>
          </div>
        )}

        {/* Options & Customer Info — same as before */}
        {/* ... (keep your existing options + customer fields) */}

        {/* Total */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 shadow-lg">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-3xl font-bold text-green-500">Rs. {total}</p>
            </div>
            <button
              onClick={onSubmit}
              disabled={submitting || todayMenu.length === 0 || items[0].id === ""}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-2xl text-xl"
            >
              {submitting ? <Loader2 className="animate-spin inline" /> : "Confirm Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}