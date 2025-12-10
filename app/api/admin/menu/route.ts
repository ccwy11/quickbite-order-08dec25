// src/app/api/admin/menu/route.ts

import { getDb } from "@/db/drizzle";
import { menuWeeks } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const db = getDb();

    const menuData: any = {};
    const snacks: string[] = [];
    const eggs: string[] = [];
    const appetizers: string[] = [];

    // Parse form
    for (const [key, value] of form.entries()) {
      if (key.startsWith("menu[")) {
        const match = key.match(/menu\[([^]+)\]\[(\d+)\]/);
        if (match) {
          const week = match[1];
          const idx = Number(match[2]);
          if (!menuData[week]) menuData[week] = [];
          menuData[week][idx] = (value as string).trim();
        }
      } else if (key.startsWith("snacks[")) {
        if (value) snacks.push((value as string).trim());
      } else if (key.startsWith("eggs[")) {
        if (value) eggs.push((value as string).trim());
      } else if (key.startsWith("appetizers[")) {
        if (value) appetizers.push((value as string).trim());
      }
    }

    // Save each week
    for (const [weekIso, items] of Object.entries(menuData)) {
      const cleanItems = (items as string[])
        .filter(Boolean)
        .map(name => ({ name})); // price not used

      await db
        .insert(menuWeeks)
        .values({
          weekStartDate: weekIso,
          mainItems: cleanItems,
          snacks,
          eggs,
          appetizers,
        })
        .onConflictDoUpdate({
          target: menuWeeks.weekStartDate,
          set: { mainItems: cleanItems, snacks, eggs, appetizers },
        });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Menu save failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}