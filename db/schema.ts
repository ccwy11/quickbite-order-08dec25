import { pgTable, serial, timestamp, integer, jsonb, text, varchar } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),                  // Auto ID for each weekly batch
  deliveryWeek: timestamp("delivery_week").notNull(), // Start of week (for easy grouping)

  // Main items: JSON array matching frontend cart
  mainItems: jsonb("main_items").notNull().default([]), // e.g. [{day: "Monday", items: [{name: "Chicken Biryani", qty: 2, price: 480}, ...]}]

  // Choices: JSON object for extras per day
  choices: jsonb("choices").notNull().default({}), // e.g. {Monday: {snacks: "Samosa", egg: "Boiled Egg", appetizer: "Papadum"}, ...}

  totalAmount: integer("total_amount").notNull(), // Grand total Rs.
  phone: varchar("phone", { length: 20 }).notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("pending"),
});

export type Order = typeof orders.$inferSelect;