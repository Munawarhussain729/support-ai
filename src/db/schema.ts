import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const tickets = sqliteTable("tickets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),
  status: text("status").default("new"), // values: "new", "in-progress", "done"
  assignedTo: text("assigned_to").default(""), // developer email or name
  category: text("category").notNull(),
  message: text("message").notNull(),
  videoUrl: text("video_url"),
  screenshotUrls: text("screenshot_urls").default("[]"),
  createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
