// import { getDb } from "@/db/drizzle";
// import { orders } from "@/db/schema";
// import { format } from "date-fns";

// export const revalidate = 0;  // Real-time refresh

// export default async function AdminPage() {
//   // Lazy DB connection – only runs at request time (not build time)
//   const db = getDb();
//   const allOrders = await db.select().from(orders).orderBy(orders.createdAt);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold text-green-600 mb-8">Admin – Weekly Orders</h1>
//         {allOrders.length === 0 ? (
//           <p className="text-gray-600">No orders yet – waiting for your first customer!</p>
//         ) : (
//           <div className="space-y-6">
//             {allOrders.map((order) => (
//               <div key={order.id} className="bg-white rounded-2xl p-6 shadow border border-gray-200">
//                 <div className="flex justify-between items-start mb-4">
//                   <h2 className="text-2xl font-bold">Order #{order.id}</h2>
//                   <span className={`px-3 py-1 text-xs rounded-full ${
//                     order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                     order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {order.status}
//                   </span>
//                 </div>
//                 <p className="text-gray-600 mb-2">Week starting: {format(new Date(order.deliveryWeek), "PPP")}</p>
//                     <p className="font-medium mb-2">Phone: {order.phone}</p>
                
//                 {order.notes && <p className="italic text-gray-500 mb-4">Notes: &rdquo;{order.notes}&rdquo;</p>}
//                 <div className="border-t pt-4">
//                   {/* <p className="text-2xl font-bold text-green-600">Total: Rs.{order.totalAmount}</p> */}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// src/app/admin/page.tsx

import { getDb } from "@/db/drizzle";
import { orders } from "@/db/schema";
import { format } from "date-fns";

export const revalidate = 0;

export default async function AdminPage() {
  const db = getDb();
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(orders.createdAt);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-green-600 mb-10 text-center">
          Admin – All Weekly Orders
        </h1>

        {allOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No orders yet — waiting for your first customer!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {allOrders.map((order) => {
              // Calculate total from mainItems (since we removed total_amount)
              const total = (order.mainItems as any[])
                .flatMap((day: any) => day.items || [])
                .reduce((sum: number, item: any) => sum + (item.price || 0) * item.qty, 0);

              return (
                <div key={order.id} className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold">Order #{order.id}</h2>
                      <div className="text-right">
                        {/* <p className="text-xl">Rs. {total}</p> */}
                        <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold ${
                          order.status === "pending" ? "bg-yellow-300 text-yellow-900" :
                          order.status === "delivered" ? "bg-white text-green-700" :
                          "bg-gray-200 text-gray-700"
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 bg-gray-50 border-b">
                    <p className="text-lg">
                      <strong>Week:</strong> {format(new Date(order.deliveryWeek), "dd MMM yyyy")}
                    </p>
                    <p className="text-lg mt-2">
                      <strong>Phone:</strong> {order.phone}
                    </p>
                    {order.notes && (
                      <p className="mt-3 text-gray-700 italic bg-white p-4 rounded-lg border">
                        <strong>Note:</strong> "{order.notes}"
                      </p>
                    )}
                  </div>

                  {/* Items per Day */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Ordered Items</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {(order.mainItems as any[]).map((day: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-5 border">
                          <h4 className="font-bold text-green-700 text-lg mb-3">{day.day}</h4>
                          
                          {/* Main Items */}
                          {day.items?.length > 0 ? (
                            <ul className="space-y-2 mb-4">
                              {day.items.map((item: any, i: number) => (
                                <li key={i} className="flex justify-between">
                                  <span>{item.name}</span>
                                  <span className="font-medium">× {item.qty}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic">No main items</p>
                          )}

                          {/* Extras */}
                          <div className="text-sm text-gray-600 border-t pt-3">
                            <p>Snacks: <strong>{order.choices?.[day.day]?.snacks || "None"}</strong></p>
                            <p>Egg: <strong>{order.choices?.[day.day]?.egg || "None"}</strong></p>
                            <p>Appetizer: <strong>{order.choices?.[day.day]?.appetizer || "None"}</strong></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}