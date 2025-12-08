import { db } from "@/db/drizzle";
import { orders } from "@/db/schema";
import { format } from "date-fns";

export const revalidate = 0;  // Real-time refresh

export default async function AdminPage() {
  const allOrders = await db.select().from(orders).orderBy(orders.createdAt);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-600 mb-8">Admin – Weekly Orders</h1>
        {allOrders.length === 0 ? (
          <p className="text-gray-600">No orders yet – waiting for your first customer!</p>
        ) : (
          <div className="space-y-6">
            {allOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Order #{order.id}</h2>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">Week starting: {format(new Date(order.deliveryWeek), "PPP")}</p>
                <p className="font-medium mb-2">Phone: {order.phone}</p>
                {order.notes && <p className="italic text-gray-500 mb-4">Notes: "{order.notes}"</p>}
                <div className="border-t pt-4">
                  <p className="text-2xl font-bold text-green-600">Total: Rs.{order.totalAmount}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}