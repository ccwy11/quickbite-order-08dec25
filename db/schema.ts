import { pgTable, serial, timestamp, integer, jsonb, text, varchar, date } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),                  // Auto ID for each weekly batch
  deliveryWeek: timestamp("delivery_week").notNull(), // Start of week (for easy grouping)

  // Main items: JSON array matching frontend cart
  mainItems: jsonb("main_items").notNull().default([]), // e.g. [{day: "Monday", items: [{name: "Chicken Biryani", qty: 2, price: 480}, ...]}]

  // Choices: JSON object for extras per day
  choices: jsonb("choices").notNull().default({}), // e.g. {Monday: {snacks: "Samosa", egg: "Boiled Egg", appetizer: "Papadum"}, ...}

  // totalAmount: integer("total_amount").notNull(), // Grand total Rs.
  phone: varchar("phone", { length: 20 }).notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("pending"),
});
export const menuWeeks = pgTable("menu_weeks", {
  id: serial("id").primaryKey(),
  weekStartDate: date("week_start_date").notNull(), // e.g. "2025-04-07" (Monday)
  mainItems: jsonb("main_items").notNull(), // [{name: "Chicken Biryani", price: 480}, ...]
  snacks: jsonb("snacks").notNull().default([
    { name: "None", price: 0 },
    { name: "Samosa (2pcs)", price: 120 },
    { name: "Pakora Plate", price: 150 },
  ]),
  eggs: jsonb("eggs").notNull().default([
    { name: "None", price: 0 },
    { name: "Boiled Egg", price: 40 },
    { name: "Fried Egg", price: 50 },
    { name: "Omelette", price: 80 },
  ]),
  appetizers: jsonb("appetizers").notNull().default([
    { name: "None", price: 0 },
    { name: "Papadum", price: 30 },
    { name: "Onion Bhaji", price: 90 },
    { name: "Chicken Tikka (2pcs)", price: 220 },
  ]),
  createdAt: timestamp("created_at").defaultNow(),
});


export type Order = typeof orders.$inferSelect;