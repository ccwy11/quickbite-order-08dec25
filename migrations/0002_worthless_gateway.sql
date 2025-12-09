CREATE TABLE "menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"menu_date" timestamp NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "menus_menu_date_unique" UNIQUE("menu_date")
);
