CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_date" timestamp NOT NULL,
	"item_name" varchar(100) NOT NULL,
	"item_qty" integer DEFAULT 1 NOT NULL,
	"addons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_amount" integer NOT NULL,
	"phone" varchar(20) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'pending'
);
