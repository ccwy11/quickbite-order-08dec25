"use client";
// app/menu/page.tsx   (or app/page.tsx if this is your homepage)
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  popular?: boolean;
}

const menuItems: MenuItem[] = [
  { id: "1", name: "Margherita Pizza",     description: "Fresh mozzarella, tomato sauce, basil", price: 12.99, popular: true },
  { id: "2", name: "Caesar Salad",         description: "Romaine, parmesan, croutons, caesar dressing", price: 9.99 },
  { id: "3", name: "Beef Burger",          description: "Angus beef, cheddar, lettuce, tomato, fries", price: 15.99, popular: true },
  { id: "4", name: "Pad Thai",             description: "Stir-fried noodles, shrimp, peanuts, lime", price: 13.99 },
  { id: "5", name: "Tiramisu",             description: "Classic Italian coffee-flavored dessert", price: 7.99 },
];

export default function CustomerMenu() {
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[id] > 1) updated[id]--;
      else delete updated[id];
      return updated;
    });
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = menuItems.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">FreshBites</h1>
            <button className="relative p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-green-500 text-white py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Order Your Favorite Food</h2>
            <p className="text-lg opacity-90">Fast delivery • Fresh ingredients • Made with love</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="bg-gray-200 border-2 border-dashed rounded-t-2xl w-full h-48" />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    {item.popular && (
                      <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                    
                    {cart[item.id] ? (
                      <div className="flex items-center gap-3">
                        <button onClick={() => removeFromCart(item.id)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold w-8 text-center">{cart[item.id]}</span>
                        <button onClick={() => addToCart(item.id)} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item.id)}
                        className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary (Sticky Bottom on Mobile) */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{cartCount} item{cartCount > 1 ? 's' : ''}</p>
                <p className="text-xl font-bold">${cartTotal.toFixed(2)}</p>
              </div>
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg">
                View Order
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}