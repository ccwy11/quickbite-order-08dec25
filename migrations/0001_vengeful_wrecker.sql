ALTER TABLE "orders" ADD COLUMN "delivery_week" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "main_items" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "choices" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "delivery_date";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "item_name";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "item_qty";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "addons";