// import { db } from "@/db";
// import { orders } from "@/db/schema";
// import { format } from "date-fns";

// export const revalidate = 0;

// export default async function Admin() {
//   const all = await db.select().from(orders).orderBy(orders.createdAt);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-10">
//         <div className="px-6 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-green-500">Biryani Weekly Orders</h1>
//           <div className="text-sm text-gray-600">Total today: {all.length}</div>
//         </div>
//       </header>

//       <main className="pt-20 px-4 pb-10">
//         <div className="max-w-6xl mx-auto">
//           {all.map(o => (
//             <div key={o.id} className="bg-white rounded-xl shadow mb-4 p-6 border border-gray-200">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="font-bold text-xl">{o.customerName} • {o.phone}</p>
//                   <p className="text-gray-600">{o.address}</p>
//                   <p className="mt-2">
//                     {(o.items as any[]).map(i => `${i.name} × ${i.qty}`).join(" • ")}
//                   </p>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Spice: {o.options?.spice} | Rice: {o.options?.rice} | Add-ons: {(o.options?.addons || []).join(", ")}
//                   </p>
//                   {o.notes && <p className="italic text-gray-600 mt-2">"{o.notes}"</p>}
//                 </div>
//                 <div className="text-right">
//                   <p className="text-2xl font-bold text-green-500">Rs.{o.total}</p>
//                   <p className="text-sm">#{o.id} • {format(new Date(o.deliveryTomorrow), "EEE, dd MMM")}</p>
//                   <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600 border border-green-200">
//                     {o.status}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }