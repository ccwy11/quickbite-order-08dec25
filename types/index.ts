export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}

export interface OrderData {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  cart: CartItem[];
  total: number;
}

export interface SheetOrder {
  Date: string;
  Name: string;
  Phone: string;
  Address: string;
  Items: string;
  Total: number;
  Notes: string;
  Timestamp: string;
}