import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
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

export const Users = sqliteTable(
  "Users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),

    // restrict role to ONLY two allowed values
    role: text("role", { enum: ["developer", "client"] }).notNull(),

    createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex("email_unique_idx").on(table.email),
  }),
);
