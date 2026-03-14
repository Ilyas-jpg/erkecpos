import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Helper for default ID
const genId = sql`(lower(hex(randomblob(16))))`;
const now = sql`(datetime('now'))`;

// ══════════════════════════════════
// KATEGORİLER
// ══════════════════════════════════
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
  active: integer("active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ══════════════════════════════════
// ÜRÜNLER
// ══════════════════════════════════
export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description"),
    price: real("price").notNull().default(0),
    imageUrl: text("image_url"),
    active: integer("active").default(1),
    sortOrder: integer("sort_order").default(0),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_products_category").on(table.categoryId),
    index("idx_products_active").on(table.active),
  ]
);

// ══════════════════════════════════
// EK MALZEME / SOS / PORSİYON
// ══════════════════════════════════
export const extras = sqliteTable("extras", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  name: text("name").notNull(),
  type: text("type", { enum: ["sos", "malzeme", "porsiyon"] }).notNull(),
  price: real("price").default(0),
  active: integer("active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const productExtras = sqliteTable(
  "product_extras",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    extraId: text("extra_id").notNull().references(() => extras.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("unique_product_extra").on(table.productId, table.extraId),
  ]
);

// ══════════════════════════════════
// MENÜLER (COMBO PAKETLER)
// ══════════════════════════════════
export const combos = sqliteTable("combos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  active: integer("active").default(1),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const comboItems = sqliteTable("combo_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  comboId: text("combo_id").notNull().references(() => combos.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  isSwappable: integer("is_swappable").default(0),
  swapCategoryId: text("swap_category_id").references(() => categories.id),
  sortOrder: integer("sort_order").default(0),
});

// ══════════════════════════════════
// KAMPANYALAR
// ══════════════════════════════════
export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  name: text("name").notNull(),
  type: text("type", { enum: ["percent", "fixed", "bogo", "free_extra"] }).notNull(),
  value: real("value"),
  appliesTo: text("applies_to", { enum: ["all", "category", "product", "combo"] }),
  targetId: text("target_id"),
  minOrderAmount: real("min_order_amount"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  active: integer("active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ══════════════════════════════════
// SİPARİŞLER
// ══════════════════════════════════
export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
    orderNumber: integer("order_number"),
    status: text("status", { enum: ["open", "completed", "cancelled", "refunded"] }).default("open"),
    subtotal: real("subtotal").default(0),
    discountAmount: real("discount_amount").default(0),
    serviceCharge: real("service_charge").default(0),
    taxAmount: real("tax_amount").default(0),
    total: real("total").default(0),
    paymentMethod: text("payment_method", { enum: ["cash", "card", "pos", "mixed"] }),
    note: text("note"),
    campaignId: text("campaign_id").references(() => campaigns.id),
    refundAmount: real("refund_amount").default(0),
    refundReason: text("refund_reason"),
    refundedAt: text("refunded_at"),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
    completedAt: text("completed_at"),
  },
  (table) => [
    index("idx_orders_status").on(table.status),
    index("idx_orders_created").on(table.createdAt),
  ]
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id),
    comboId: text("combo_id").references(() => combos.id),
    quantity: integer("quantity").default(1),
    unitPrice: real("unit_price").notNull(),
    totalPrice: real("total_price").notNull(),
    note: text("note"),
  },
  (table) => [index("idx_order_items_order").on(table.orderId)]
);

export const orderItemExtras = sqliteTable("order_item_extras", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  orderItemId: text("order_item_id").notNull().references(() => orderItems.id, { onDelete: "cascade" }),
  extraId: text("extra_id").references(() => extras.id),
  price: real("price").notNull(),
});

// ══════════════════════════════════
// KASA HAREKETLERİ
// ══════════════════════════════════
export const cashRegister = sqliteTable(
  "cash_register",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
    type: text("type", { enum: ["sale", "refund", "expense", "waste", "cash_in", "cash_out"] }).notNull(),
    amount: real("amount").notNull(),
    description: text("description"),
    orderId: text("order_id").references(() => orders.id),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
  },
  (table) => [index("idx_cash_register_created").on(table.createdAt)]
);

// ══════════════════════════════════
// ZAYİ ÜRÜN TAKİBİ
// ══════════════════════════════════
export const wasteLog = sqliteTable(
  "waste_log",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
    productId: text("product_id").references(() => products.id),
    quantity: real("quantity").notNull(),
    reason: text("reason", { enum: ["expired", "damaged", "overcooked", "dropped", "other"] }).notNull(),
    note: text("note"),
    costEstimate: real("cost_estimate"),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
  },
  (table) => [index("idx_waste_log_created").on(table.createdAt)]
);

// ══════════════════════════════════
// AYARLAR
// ══════════════════════════════════
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ══════════════════════════════════
// GÜNLÜK KASA RAPORU
// ══════════════════════════════════
export const dailyReports = sqliteTable("daily_reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  reportDate: text("report_date").unique().notNull(),
  totalOrders: integer("total_orders").default(0),
  totalRevenue: real("total_revenue").default(0),
  totalRefunds: real("total_refunds").default(0),
  totalDiscounts: real("total_discounts").default(0),
  totalServiceCharge: real("total_service_charge").default(0),
  totalTax: real("total_tax").default(0),
  totalWasteCost: real("total_waste_cost").default(0),
  totalCash: real("total_cash").default(0),
  totalCard: real("total_card").default(0),
  netRevenue: real("net_revenue").default(0),
  notes: text("notes"),
  closedAt: text("closed_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ══════════════════════════════════
// DEĞİŞİKLİK LOG (Realtime sync)
// ══════════════════════════════════
export const changeLog = sqliteTable(
  "change_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    action: text("action", { enum: ["insert", "update", "delete"] }).notNull(),
    payload: text("payload"),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_change_log_created").on(table.createdAt),
    index("idx_change_log_table").on(table.tableName),
  ]
);
