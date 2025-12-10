
"use client";

import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { Loader2, Check, ArrowLeft } from "lucide-react";


// const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const deliveryDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));
// FIXED: Dynamic day names based on actual delivery dates (not hardcoded "Monday")
  const dayNames = deliveryDates.map(date => format(date, "EEEE")); // e.g. "Thursday" for Dec 11

  // FIXED: Map delivery date by index (real date for selected day)
const getDeliveryDateByIndex = (idx: number) => deliveryDates[idx];
  
// Fetch the correct menu from DB at runtime
async function getActiveMenu() {
  const res = await fetch("/api/menu/active");
  if (!res.ok) {
    console.error("Failed to load menu");
    return null;
  }
  return res.json();
}


export default function OrderPage() {
  const [step, setStep] = useState<"days" | "order" | "summary">("days");
  const [selectedDay, setSelectedDay] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

// Active menu from DB
  const [activeMenu, setActiveMenu] = useState<any>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Cart: one object per day
  const [dayOrders, setDayOrders] = useState<{
    [day: string]: {
      main: { name: string; qty: number; price: number }[];
      snacks: string;
      egg: string;
      appetizer: string;
    };
  }>({});
  
 // Load menu on mount (unchanged)
  useEffect(() => {
    fetch("/api/menu/active")
      .then(res => res.json())
      .then((menu) => {
        setActiveMenu(menu);
        setLoadingMenu(false);
      })
      .catch(err => {
        console.error("Menu load failed:", err);
        setLoadingMenu(false);
      });
  }, []);

  if (loadingMenu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
        <p className="ml-4 text-xl">Loading this week's menu...</p>
      </div>
    );
  }



  // Get menu for selected day
  const currentMainMenu = activeMenu?.mainItems || [];
  const currentSnacks = activeMenu?.snacks || [];
  const currentEggs = activeMenu?.eggs || [];
  const currentAppetizers = activeMenu?.appetizers || [];

  const currentOrder = dayOrders[selectedDay] || {
    main: currentMainMenu.map((m: unknown) => ({ ...m, qty: 0 })),
    snacks: currentSnacks[0] || "None",
    egg: currentEggs[0] || "None",
    appetizer: currentAppetizers[0] || "None",
  };

  const updateMainQty = (name: string, delta: number) => {
    const updated = currentOrder.main.map(i =>
      i.name === name ? { ...i, qty: Math.max(0, i.qty + delta) } : i
    );
    setDayOrders({
      ...dayOrders,
      [selectedDay]: { ...currentOrder, main: updated },
    });
  };

  const storeDay = () => {
    setDayOrders({ ...dayOrders, [selectedDay]: currentOrder });
    setStep("days");
  };

  const grandTotal = Object.values(dayOrders).reduce((sum, day) => {
    const mainTotal = day.main.reduce((s, i) => s + i.price * i.qty, 0);
    const snackPrice = currentSnacks.find((s:unknown) => s.name === day.snacks)?.price || 0;
    const eggPrice = currentEggs.find((e:unknown) => e.name === day.egg)?.price || 0;
    const appPrice = currentAppetizers.find((a:unknown) => a.name === day.appetizer)?.price || 0;
    return sum + mainTotal + snackPrice + eggPrice + appPrice;
  }, 0);

    const submitAll = async () => {
  setSubmitting(true);

  // Build clean array of orders with VALID Date objects
  const ordersToSend = Object.entries(dayOrders).flatMap(([dayName, dayOrder]) => {
      const dayIndex = dayNames.findIndex(d => d === dayName);
    const deliveryDate = getDeliveryDateByIndex(dayIndex); // FIXED: Real date


    return [{
   dayName,
      deliveryDate: deliveryDate.toISOString(),
      mainItems: dayOrder.main.filter(i => i.qty > 0),
      snacks: dayOrder.snacks,
      egg: dayOrder.egg,
      appetizer: dayOrder.appetizer,
      // dayTotal: mainTotal + extrasTotal,
    }];
  });

  // const grandTotal = ordersToSend.reduce((sum, o) => sum + o.dayTotal, 0);

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessCode: "biryani2025",     // ← make sure this matches .env.local
      orders: ordersToSend,
      totalAmount: grandTotal,
      phone,
      notes,
    }),
  });

const data = await res.json();
  if (!res.ok) {
    alert("Error: " + (data.error || "Unknown"));
  } else {
    setSuccess(true);
    setTimeout(() => location.reload(), 3000);
  }
  setSubmitting(false);
    };
  

  // SUMMARY STEP
  if (step === "summary") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <button onClick={() => setStep("days")} className="flex items-center gap-2 text-green-600">
            <ArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-green-600">Final Summary</h1>

          {Object.entries(dayOrders).map(([day, order]) => (
            <div key={day} className="bg-white rounded-2xl p-6 shadow">
              <h3 className="font-bold text-xl mb-3">{day}</h3>
              {order.main.filter(i => i.qty > 0).map(i => (
                <div key={i.name} className="flex justify-between text-gray-700">
                  <span>{i.name} × {i.qty}</span>
                  <span>Rs.{i.price * i.qty}</span>
                </div>
              ))}
              <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                Snacks: <strong>{order.snacks}</strong><br />
                Egg: <strong>{order.egg}</strong><br />
                Appetizer: <strong>{order.appetizer}</strong>
              </div>
            </div>
          ))}

          <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-4 border rounded-xl" />
          <textarea placeholder="Notes for the week" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-4 border rounded-xl" />

          <div className="bg-green-500 text-white p-6 rounded-2xl text-center">
            <p className="text-4xl font-bold">HKD {grandTotal}</p>
          </div>

          <button onClick={submitAll} disabled={submitting || grandTotal === 0}
            className="w-full bg-green-600 text-white py-6 rounded-2xl text-xl font-bold disabled:opacity-50">
            {submitting ? <Loader2 className="animate-spin inline mr-2" /> : "Submit Weekly Order"}
          </button>
          {success && <p className="text-center text-green-600 font-bold">Order sent successfully!</p>}
        </div>
      </div>
    );
  }

  // ORDER PER DAY STEP
  if (step === "order") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <button onClick={() => setStep("days")} className="flex items-center gap-2 text-green-600">
            <ArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-green-600">{selectedDay} Menu</h1>

          {/* Main Items */}
          <div className="bg-white rounded-2xl p-6 shadow space-y-4">
            <h3 className="font-bold text-lg mb-3">Main Items</h3>
            {currentMainMenu.map((item: any, index: number) => {
          const cartItem = currentOrder.main.find((i: any) => i.name === item.name) || { ...item, qty: 0 };  
            
            {/* {currentMainMenu.map(m => {
              const item = currentOrder.main.find(i => i.name === m.name) || { ...m, qty: 0 }; */}
              return (
                <div key={item.name} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Rs.{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateMainQty(item.name, -1)} className="w-10 h-10 rounded-full bg-gray-300">−</button>
                    <span className="w-12 text-center font-bold text-lg">{cartItem.qty}</span>
                    <button onClick={() => updateMainQty(item.name, 1)} className="w-10 h-10 rounded-full bg-green-500 text-white">+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Snacks */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-bold text-lg mb-4">Snacks Choice</h3>
            {currentSnacks.map((s:string) => (
              <label key={s} className="flex items-center justify-between p-4 border-b last:border-0">
                <span>{s} </span>
                <input type="radio" name="snacks" checked={currentOrder.snacks === s}
                  onChange={() => setDayOrders({ ...dayOrders, [selectedDay]: { ...currentOrder, snacks: s } })} />
              </label>
            ))}
          </div>

          {/* Egg */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-bold text-lg mb-4">Egg Choice</h3>
            {currentEggs.map((e:string) => (
              <label key={e} className="flex items-center justify-between p-4 border-b last:border-0">
                <span>{e} </span>
                <input type="radio" name="egg" checked={currentOrder.egg === e}
                  onChange={() => setDayOrders({ ...dayOrders, [selectedDay]: { ...currentOrder, egg: e} })} />
              </label>
            ))}
          </div>

          {/* Appetizer */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-bold text-lg mb-4">Appetizer Choice</h3>
            {currentAppetizers.map((a:string)=> (
              <label key={a} className="flex items-center justify-between p-4 border-b last:border-0">
                <span>{a}</span>
                <input type="radio" name="app" checked={currentOrder.appetizer === a}
                  onChange={() => setDayOrders({ ...dayOrders, [selectedDay]: { ...currentOrder, appetizer: a } })} />
              </label>
            ))}
          </div>

          <button onClick={storeDay}
            className="w-full bg-green-600 text-white py-6 rounded-2xl text-xl font-bold flex items-center justify-center gap-2">
            <Check size={24} /> OK – Save This Day
          </button>
        </div>
      </div>
    );
  }

  // DAY SELECTION
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-green-600 text-center">Weekly Order</h1>
        {/* <p className="text-center text-gray-600">Tap a day to build your order</p> */}
<p className="text-center text-gray-600">
          Menu for week starting <strong>{activeMenu ? format(new Date(activeMenu.weekStartDate), "dd MMM yyyy") : "..."}</strong>
        </p>
        {dayNames.map((day, idx) => (
          <button
            key={day}
            onClick={() => { setSelectedDay(day); setStep("order"); }}
            className="w-full bg-white rounded-2xl p-6 shadow text-left flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-lg">{day}</p>
              <p className="text-gray-600">{format(deliveryDates[idx], "dd MMM yyyy")}</p>
            </div>
            {dayOrders[day] ? (
              <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium">Done</span>
            ) : (
              <span className="text-gray-400">→</span>
            )}
          </button>
        ))}

        <button
          onClick={() => setStep("summary")}
          disabled={!Object.keys(dayOrders).length}
          className="w-full bg-green-600 disabled:bg-gray-300 text-white py-6 rounded-2xl text-xl font-bold"
        >
          Review & Submit All
        </button>
      </div>
    </div>
  );
}