import { pgTable, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const productStatusEnum = pgEnum("product_status", ["available", "sold"]);
export const productCategoryEnum = pgEnum("product_category", ["microcontroller", "electronic_component", "module", "tool", "book_module", "laptop_accessory", "clothing", "stationery", "other"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "offer", "offer_accept", "offer_reject", "system"]);
export const listingTypeEnum = pgEnum("listing_type", ["sell", "barter"]);

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  full_name: text("full_name").notNull(),
  nim: text("nim"),
  department: text("department"),
  campus_email: text("campus_email").notNull(),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  whatsapp_number: text("whatsapp_number"),
  total_listings: integer("total_listings").default(0),
  total_sold: integer("total_sold").default(0),
  rating: integer("rating"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  password_hash: text("password_hash").notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  seller_id: text("seller_id").references(() => profiles.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price"),
  listing_type: listingTypeEnum("listing_type").default("sell").notNull(),
  category: productCategoryEnum("category").notNull(),
  condition: text("condition").notNull(),
  status: productStatusEnum("status").default("available").notNull(),
  booked_by: text("booked_by").references(() => profiles.id),
  image_urls: text("image_urls").array().notNull(),
  stock: integer("stock").default(1).notNull(),
  campus_location: text("campus_location"),
  is_negotiable: boolean("is_negotiable").default(false).notNull(),
  is_deleted: boolean("is_deleted").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  product_id: text("product_id").references(() => products.id).notNull(),
  buyer_id: text("buyer_id").references(() => profiles.id).notNull(),
  seller_id: text("seller_id").references(() => profiles.id).notNull(),
  last_message_at: timestamp("last_message_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  chat_id: text("chat_id").references(() => chats.id).notNull(),
  sender_id: text("sender_id").references(() => profiles.id).notNull(),
  message_type: messageTypeEnum("message_type").default("text").notNull(),
  content: text("content"),
  payload: jsonb("payload"),
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const wishlists = pgTable("wishlists", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: text("user_id").references(() => profiles.id).notNull(),
  product_id: text("product_id").references(() => products.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  product_id: text("product_id").references(() => products.id).notNull(),
  seller_id: text("seller_id").references(() => profiles.id).notNull(),
  reviewer_id: text("reviewer_id").references(() => profiles.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  products: many(products, { relationName: "seller_products" }),
  chatsAsBuyer: many(chats, { relationName: "buyer_chats" }),
  chatsAsSeller: many(chats, { relationName: "seller_chats" }),
  sentMessages: many(messages, { relationName: "sender_messages" }),
  wishlists: many(wishlists),
  reviewsReceived: many(reviews, { relationName: "seller_reviews" }),
  reviewsWritten: many(reviews, { relationName: "reviewer_reviews" }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(profiles, {
    fields: [products.seller_id],
    references: [profiles.id],
    relationName: "seller_products",
  }),
  bookedBy: one(profiles, {
    fields: [products.booked_by],
    references: [profiles.id],
  }),
  chats: many(chats),
  wishlists: many(wishlists),
  reviews: many(reviews),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  product: one(products, {
    fields: [chats.product_id],
    references: [products.id],
  }),
  buyer: one(profiles, {
    fields: [chats.buyer_id],
    references: [profiles.id],
    relationName: "buyer_chats",
  }),
  seller: one(profiles, {
    fields: [chats.seller_id],
    references: [profiles.id],
    relationName: "seller_chats",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chat_id],
    references: [chats.id],
  }),
  sender: one(profiles, {
    fields: [messages.sender_id],
    references: [profiles.id],
    relationName: "sender_messages",
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(profiles, {
    fields: [wishlists.user_id],
    references: [profiles.id],
  }),
  product: one(products, {
    fields: [wishlists.product_id],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.product_id],
    references: [products.id],
  }),
  seller: one(profiles, {
    fields: [reviews.seller_id],
    references: [profiles.id],
    relationName: "seller_reviews",
  }),
  reviewer: one(profiles, {
    fields: [reviews.reviewer_id],
    references: [profiles.id],
    relationName: "reviewer_reviews",
  }),
}));
