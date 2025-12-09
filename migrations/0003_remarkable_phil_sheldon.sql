CREATE TABLE "menu_weeks" (
	"id" serial PRIMARY KEY NOT NULL,
	"week_start_date" date NOT NULL,
	"main_items" jsonb NOT NULL,
	"snacks" jsonb DEFAULT '[{"name":"None","price":0},{"name":"Samosa (2pcs)","price":120},{"name":"Pakora Plate","price":150}]'::jsonb NOT NULL,
	"eggs" jsonb DEFAULT '[{"name":"None","price":0},{"name":"Boiled Egg","price":40},{"name":"Fried Egg","price":50},{"name":"Omelette","price":80}]'::jsonb NOT NULL,
	"appetizers" jsonb DEFAULT '[{"name":"None","price":0},{"name":"Papadum","price":30},{"name":"Onion Bhaji","price":90},{"name":"Chicken Tikka (2pcs)","price":220}]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "menus" CASCADE;