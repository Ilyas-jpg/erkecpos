import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, and, asc, desc, gte, lte, gt, sql } from "drizzle-orm";
import {
  sqliteTable, text, integer, real, index, uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ═══════════════════════════════════
// SCHEMA
// ═══════════════════════════════════
const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
  active: integer("active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

const products = sqliteTable("products", {
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
});

const extras = sqliteTable("extras", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  name: text("name").notNull(),
  type: text("type", { enum: ["sos", "malzeme", "porsiyon"] }).notNull(),
  price: real("price").default(0),
  active: integer("active").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

const productExtras = sqliteTable("product_extras", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  extraId: text("extra_id").notNull().references(() => extras.id, { onDelete: "cascade" }),
});

const combos = sqliteTable("combos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  active: integer("active").default(1),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

const comboItems = sqliteTable("combo_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  comboId: text("combo_id").notNull().references(() => combos.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  isSwappable: integer("is_swappable").default(0),
  swapCategoryId: text("swap_category_id").references(() => categories.id),
  sortOrder: integer("sort_order").default(0),
});

const campaigns = sqliteTable("campaigns", {
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

const orders = sqliteTable("orders", {
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
});

const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  comboId: text("combo_id").references(() => combos.id),
  quantity: integer("quantity").default(1),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  note: text("note"),
});

const orderItemExtras = sqliteTable("order_item_extras", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  orderItemId: text("order_item_id").notNull().references(() => orderItems.id, { onDelete: "cascade" }),
  extraId: text("extra_id").references(() => extras.id),
  price: real("price").notNull(),
});

const cashRegister = sqliteTable("cash_register", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  type: text("type", { enum: ["sale", "refund", "expense", "waste", "cash_in", "cash_out"] }).notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  orderId: text("order_id").references(() => orders.id),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

const wasteLog = sqliteTable("waste_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  productId: text("product_id").references(() => products.id),
  quantity: real("quantity").notNull(),
  reason: text("reason", { enum: ["expired", "damaged", "overcooked", "dropped", "other"] }).notNull(),
  note: text("note"),
  costEstimate: real("cost_estimate"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, "")),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

const dailyReports = sqliteTable("daily_reports", {
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

const changeLog = sqliteTable("change_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  action: text("action", { enum: ["insert", "update", "delete"] }).notNull(),
  payload: text("payload"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ═══════════════════════════════════
// DATABASE
// ═══════════════════════════════════
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(turso, {
  schema: {
    categories, products, extras, productExtras, combos, comboItems,
    campaigns, orders, orderItems, orderItemExtras, cashRegister,
    wasteLog, settings, dailyReports, changeLog,
  },
});

// ═══════════════════════════════════
// HELPERS
// ═══════════════════════════════════
function todayISO() { return new Date().toISOString().split("T")[0]; }
function nowISO() { return new Date().toISOString().replace("T", " ").substring(0, 19); }

async function trackChange(tableName: string, recordId: string, action: "insert" | "update" | "delete", payload?: any) {
  try {
    await db.insert(changeLog).values({
      tableName, recordId, action,
      payload: payload ? JSON.stringify(payload) : null,
    });
  } catch {}
}

// ═══════════════════════════════════
// APP
// ═══════════════════════════════════
const app = new Hono().basePath("/api");

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (c) => c.json({ status: "ok", time: new Date().toISOString() }));

// ── CATEGORIES ──
app.get("/categories", async (c) => {
  return c.json(await db.select().from(categories).orderBy(asc(categories.sortOrder)));
});
app.post("/categories", async (c) => {
  const body = await c.req.json();
  const [cat] = await db.insert(categories).values({ name: body.name, icon: body.icon, color: body.color, sortOrder: body.sort_order ?? 0, active: body.active ?? 1 }).returning();
  await trackChange("categories", cat.id, "insert", cat);
  return c.json(cat, 201);
});
app.put("/categories/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [cat] = await db.update(categories).set({ name: body.name, icon: body.icon, color: body.color, sortOrder: body.sort_order, active: body.active }).where(eq(categories.id, id)).returning();
  if (!cat) return c.json({ error: "Not found" }, 404);
  await trackChange("categories", cat.id, "update", cat);
  return c.json(cat);
});
app.delete("/categories/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(categories).where(eq(categories.id, id));
  await trackChange("categories", id, "delete");
  return c.json({ ok: true });
});

// ── PRODUCTS ──
app.get("/products", async (c) => {
  const categoryId = c.req.query("category");
  const active = c.req.query("active");
  let query = db.select().from(products).orderBy(asc(products.sortOrder)).$dynamic();
  const conditions: any[] = [];
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));
  if (active !== undefined) conditions.push(eq(products.active, Number(active)));
  if (conditions.length > 0) query = query.where(and(...conditions));
  return c.json(await query);
});
app.get("/products/:id", async (c) => {
  const id = c.req.param("id");
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) return c.json({ error: "Not found" }, 404);
  const assignedExtras = await db.select({ id: extras.id, name: extras.name, type: extras.type, price: extras.price }).from(productExtras).innerJoin(extras, eq(productExtras.extraId, extras.id)).where(eq(productExtras.productId, id));
  return c.json({ ...product, extras: assignedExtras });
});
app.post("/products", async (c) => {
  const body = await c.req.json();
  const [product] = await db.insert(products).values({ categoryId: body.category_id, name: body.name, description: body.description, price: body.price, imageUrl: body.image_url, active: body.active ?? 1, sortOrder: body.sort_order ?? 0 }).returning();
  if (body.extra_ids?.length) { for (const extraId of body.extra_ids) { await db.insert(productExtras).values({ productId: product.id, extraId }).onConflictDoNothing(); } }
  await trackChange("products", product.id, "insert", product);
  return c.json(product, 201);
});
app.put("/products/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [product] = await db.update(products).set({ categoryId: body.category_id, name: body.name, description: body.description, price: body.price, imageUrl: body.image_url, active: body.active, sortOrder: body.sort_order, updatedAt: sql`(datetime('now'))` }).where(eq(products.id, id)).returning();
  if (!product) return c.json({ error: "Not found" }, 404);
  if (body.extra_ids !== undefined) { await db.delete(productExtras).where(eq(productExtras.productId, id)); for (const extraId of body.extra_ids) { await db.insert(productExtras).values({ productId: id, extraId }).onConflictDoNothing(); } }
  await trackChange("products", product.id, "update", product);
  return c.json(product);
});
app.delete("/products/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(products).where(eq(products.id, id));
  await trackChange("products", id, "delete");
  return c.json({ ok: true });
});

// ── EXTRAS ──
app.get("/extras", async (c) => {
  const type = c.req.query("type");
  let query = db.select().from(extras).orderBy(asc(extras.name)).$dynamic();
  if (type) query = query.where(eq(extras.type, type as any));
  return c.json(await query);
});
app.post("/extras", async (c) => {
  const body = await c.req.json();
  const [extra] = await db.insert(extras).values({ name: body.name, type: body.type, price: body.price ?? 0, active: body.active ?? 1 }).returning();
  await trackChange("extras", extra.id, "insert", extra);
  return c.json(extra, 201);
});
app.put("/extras/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [extra] = await db.update(extras).set({ name: body.name, type: body.type, price: body.price, active: body.active }).where(eq(extras.id, id)).returning();
  if (!extra) return c.json({ error: "Not found" }, 404);
  await trackChange("extras", extra.id, "update", extra);
  return c.json(extra);
});
app.delete("/extras/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(extras).where(eq(extras.id, id));
  await trackChange("extras", id, "delete");
  return c.json({ ok: true });
});

// ── COMBOS ──
app.get("/combos", async (c) => {
  const allCombos = await db.select().from(combos).orderBy(asc(combos.sortOrder));
  const result = await Promise.all(allCombos.map(async (combo) => {
    const items = await db.select({ id: comboItems.id, productId: comboItems.productId, productName: products.name, productPrice: products.price, quantity: comboItems.quantity, isSwappable: comboItems.isSwappable, swapCategoryId: comboItems.swapCategoryId, sortOrder: comboItems.sortOrder }).from(comboItems).innerJoin(products, eq(comboItems.productId, products.id)).where(eq(comboItems.comboId, combo.id)).orderBy(asc(comboItems.sortOrder));
    const individualTotal = items.reduce((sum, item) => sum + (item.productPrice ?? 0) * (item.quantity ?? 1), 0);
    return { ...combo, items, individualTotal };
  }));
  return c.json(result);
});
app.post("/combos", async (c) => {
  const body = await c.req.json();
  const [combo] = await db.insert(combos).values({ name: body.name, description: body.description, price: body.price, imageUrl: body.image_url, sortOrder: body.sort_order ?? 0, active: body.active ?? 1 }).returning();
  if (body.items?.length) { for (const item of body.items) { await db.insert(comboItems).values({ comboId: combo.id, productId: item.product_id, quantity: item.quantity ?? 1, isSwappable: item.is_swappable ?? 0, swapCategoryId: item.swap_category_id, sortOrder: item.sort_order ?? 0 }); } }
  await trackChange("combos", combo.id, "insert", combo);
  return c.json(combo, 201);
});
app.put("/combos/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [combo] = await db.update(combos).set({ name: body.name, description: body.description, price: body.price, imageUrl: body.image_url, sortOrder: body.sort_order, active: body.active }).where(eq(combos.id, id)).returning();
  if (!combo) return c.json({ error: "Not found" }, 404);
  if (body.items !== undefined) { await db.delete(comboItems).where(eq(comboItems.comboId, id)); for (const item of body.items) { await db.insert(comboItems).values({ comboId: id, productId: item.product_id, quantity: item.quantity ?? 1, isSwappable: item.is_swappable ?? 0, swapCategoryId: item.swap_category_id, sortOrder: item.sort_order ?? 0 }); } }
  await trackChange("combos", combo.id, "update", combo);
  return c.json(combo);
});
app.delete("/combos/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(combos).where(eq(combos.id, id));
  await trackChange("combos", id, "delete");
  return c.json({ ok: true });
});

// ── SETTINGS ──
app.get("/settings", async (c) => {
  const rows = await db.select().from(settings);
  const result: Record<string, any> = {};
  for (const row of rows) { try { result[row.key] = JSON.parse(row.value); } catch { result[row.key] = row.value; } }
  return c.json(result);
});
app.get("/settings/:key", async (c) => {
  const key = c.req.param("key");
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  if (!row) return c.json({ error: "Not found" }, 404);
  try { return c.json(JSON.parse(row.value)); } catch { return c.json(row.value); }
});
app.put("/settings/:key", async (c) => {
  const key = c.req.param("key");
  const body = await c.req.json();
  const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value);
  const [existing] = await db.select().from(settings).where(eq(settings.key, key));
  if (existing) { await db.update(settings).set({ value, updatedAt: sql`(datetime('now'))` }).where(eq(settings.key, key)); }
  else { await db.insert(settings).values({ key, value }); }
  await trackChange("settings", key, "update", { key, value });
  return c.json({ key, value });
});

// ── ORDERS ──
app.get("/orders", async (c) => {
  const date = c.req.query("date"); const status = c.req.query("status");
  const limit = Number(c.req.query("limit") || 50); const offset = Number(c.req.query("offset") || 0);
  const conditions: any[] = [];
  if (date) { conditions.push(gte(orders.createdAt, `${date} 00:00:00`)); conditions.push(lte(orders.createdAt, `${date} 23:59:59`)); }
  if (status) conditions.push(eq(orders.status, status as any));
  let query = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  return c.json(await query);
});
app.get("/orders/:id", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return c.json({ error: "Not found" }, 404);
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.id));
  const itemsWithExtras = await Promise.all(items.map(async (item) => {
    const itemExtras = await db.select({ id: orderItemExtras.id, extraId: orderItemExtras.extraId, price: orderItemExtras.price, extraName: extras.name, extraType: extras.type }).from(orderItemExtras).leftJoin(extras, eq(orderItemExtras.extraId, extras.id)).where(eq(orderItemExtras.orderItemId, item.id));
    return { ...item, extras: itemExtras };
  }));
  return c.json({ ...order, items: itemsWithExtras });
});
app.post("/orders", async (c) => {
  const body = await c.req.json();
  const today = todayISO();
  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(and(gte(orders.createdAt, `${today} 00:00:00`), lte(orders.createdAt, `${today} 23:59:59`)));
  const orderNumber = (countResult?.count ?? 0) + 1;
  const settingsRows = await db.select().from(settings);
  const settingsMap: Record<string, any> = {};
  for (const s of settingsRows) { try { settingsMap[s.key] = JSON.parse(s.value); } catch { settingsMap[s.key] = s.value; } }
  const serviceConfig = settingsMap["service_charge"] || { enabled: true, type: "percent", value: 10 };
  const taxConfig = settingsMap["tax_rate"] || { rate: 10 };
  let subtotal = 0;
  const itemsToInsert: any[] = []; const extrasToInsert: any[] = [];
  for (const item of body.items || []) {
    const itemTotal = item.unit_price * item.quantity; subtotal += itemTotal;
    const itemId = crypto.randomUUID().replace(/-/g, "");
    itemsToInsert.push({ id: itemId, orderId: "", productId: item.product_id || null, comboId: item.combo_id || null, quantity: item.quantity, unitPrice: item.unit_price, totalPrice: itemTotal, note: item.note });
    for (const ext of item.extras || []) { extrasToInsert.push({ orderItemId: itemId, extraId: ext.extra_id, price: ext.price }); }
  }
  const discountAmount = body.discount_amount || 0;
  const afterDiscount = subtotal - discountAmount;
  const sc = serviceConfig.enabled ? Math.round(afterDiscount * (serviceConfig.value / 100) * 100) / 100 : 0;
  const taxAmount = Math.round((afterDiscount + sc) * (taxConfig.rate / 100) * 100) / 100;
  const total = Math.round((afterDiscount + sc + taxAmount) * 100) / 100;
  const [order] = await db.insert(orders).values({ orderNumber, status: body.status || "completed", subtotal, discountAmount, serviceCharge: sc, taxAmount, total, paymentMethod: body.payment_method, note: body.note, campaignId: body.campaign_id, completedAt: body.status === "completed" || !body.status ? nowISO() : null }).returning();
  for (const item of itemsToInsert) { item.orderId = order.id; await db.insert(orderItems).values(item); }
  for (const ext of extrasToInsert) { await db.insert(orderItemExtras).values(ext); }
  await db.insert(cashRegister).values({ type: "sale", amount: order.total!, description: `Sipariş #${String(orderNumber).padStart(3, "0")}`, orderId: order.id });
  await trackChange("orders", order.id, "insert", order);
  return c.json(order, 201);
});
app.put("/orders/:id/complete", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.update(orders).set({ status: "completed", completedAt: nowISO() }).where(eq(orders.id, id)).returning();
  if (!order) return c.json({ error: "Not found" }, 404);
  return c.json(order);
});
app.put("/orders/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, id)).returning();
  if (!order) return c.json({ error: "Not found" }, 404);
  return c.json(order);
});
app.put("/orders/:id/refund", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [existing] = await db.select().from(orders).where(eq(orders.id, id));
  if (!existing) return c.json({ error: "Not found" }, 404);
  const refundAmount = body.amount || existing.total || 0;
  const [order] = await db.update(orders).set({ status: "refunded", refundAmount: Math.round(refundAmount * 100) / 100, refundReason: body.reason || "İade", refundedAt: nowISO() }).where(eq(orders.id, id)).returning();
  await db.insert(cashRegister).values({ type: "refund", amount: -Math.abs(refundAmount), description: `İade - Sipariş #${String(existing.orderNumber).padStart(3, "0")}`, orderId: id });
  return c.json(order);
});

// ── CAMPAIGNS ──
app.get("/campaigns", async (c) => c.json(await db.select().from(campaigns).orderBy(desc(campaigns.createdAt))));
app.post("/campaigns", async (c) => {
  const body = await c.req.json();
  const [campaign] = await db.insert(campaigns).values({ name: body.name, type: body.type, value: body.value, appliesTo: body.applies_to, targetId: body.target_id, minOrderAmount: body.min_order_amount, startDate: body.start_date, endDate: body.end_date, active: body.active ?? 1 }).returning();
  await trackChange("campaigns", campaign.id, "insert", campaign);
  return c.json(campaign, 201);
});
app.put("/campaigns/:id", async (c) => {
  const id = c.req.param("id"); const body = await c.req.json();
  const [campaign] = await db.update(campaigns).set({ name: body.name, type: body.type, value: body.value, appliesTo: body.applies_to, targetId: body.target_id, minOrderAmount: body.min_order_amount, startDate: body.start_date, endDate: body.end_date, active: body.active }).where(eq(campaigns.id, id)).returning();
  if (!campaign) return c.json({ error: "Not found" }, 404);
  return c.json(campaign);
});
app.delete("/campaigns/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(campaigns).where(eq(campaigns.id, id));
  return c.json({ ok: true });
});

// ── WASTE ──
app.get("/waste", async (c) => {
  const date = c.req.query("date"); const conditions: any[] = [];
  if (date) { conditions.push(gte(wasteLog.createdAt, `${date} 00:00:00`)); conditions.push(lte(wasteLog.createdAt, `${date} 23:59:59`)); }
  let query = db.select({ id: wasteLog.id, productId: wasteLog.productId, productName: products.name, quantity: wasteLog.quantity, reason: wasteLog.reason, note: wasteLog.note, costEstimate: wasteLog.costEstimate, createdAt: wasteLog.createdAt }).from(wasteLog).leftJoin(products, eq(wasteLog.productId, products.id)).orderBy(desc(wasteLog.createdAt)).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  return c.json(await query);
});
app.post("/waste", async (c) => {
  const body = await c.req.json();
  const [waste] = await db.insert(wasteLog).values({ productId: body.product_id, quantity: body.quantity, reason: body.reason, note: body.note, costEstimate: body.cost_estimate }).returning();
  if (body.cost_estimate) { await db.insert(cashRegister).values({ type: "waste", amount: -Math.abs(body.cost_estimate), description: `Zayi - ${body.note || body.reason}` }); }
  await trackChange("waste_log", waste.id, "insert", waste);
  return c.json(waste, 201);
});

// ── CASH REGISTER ──
app.get("/cash", async (c) => {
  const date = c.req.query("date"); const conditions: any[] = [];
  if (date) { conditions.push(gte(cashRegister.createdAt, `${date} 00:00:00`)); conditions.push(lte(cashRegister.createdAt, `${date} 23:59:59`)); }
  let query = db.select().from(cashRegister).orderBy(desc(cashRegister.createdAt)).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  return c.json(await query);
});
app.get("/cash/summary", async (c) => {
  const date = c.req.query("date"); const conditions: any[] = [];
  if (date) { conditions.push(gte(cashRegister.createdAt, `${date} 00:00:00`)); conditions.push(lte(cashRegister.createdAt, `${date} 23:59:59`)); }
  let query = db.select({ type: cashRegister.type, total: sql<number>`SUM(${cashRegister.amount})`, count: sql<number>`COUNT(*)` }).from(cashRegister).groupBy(cashRegister.type).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  return c.json(await query);
});
app.post("/cash", async (c) => {
  const body = await c.req.json();
  const [entry] = await db.insert(cashRegister).values({ type: body.type, amount: body.amount, description: body.description, orderId: body.order_id }).returning();
  return c.json(entry, 201);
});

// ── REPORTS ──
async function generateDailyReport(date: string) {
  const dayStart = `${date} 00:00:00`; const dayEnd = `${date} 23:59:59`;
  const [orderStats] = await db.select({ totalOrders: sql<number>`COUNT(*)`, totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`, totalRefunds: sql<number>`COALESCE(SUM(${orders.refundAmount}), 0)`, totalDiscounts: sql<number>`COALESCE(SUM(${orders.discountAmount}), 0)`, totalServiceCharge: sql<number>`COALESCE(SUM(${orders.serviceCharge}), 0)`, totalTax: sql<number>`COALESCE(SUM(${orders.taxAmount}), 0)` }).from(orders).where(and(gte(orders.createdAt, dayStart), lte(orders.createdAt, dayEnd), eq(orders.status, "completed")));
  const [cashStats] = await db.select({ totalCash: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentMethod} = 'cash' THEN ${orders.total} ELSE 0 END), 0)`, totalCard: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentMethod} IN ('card', 'pos') THEN ${orders.total} ELSE 0 END), 0)` }).from(orders).where(and(gte(orders.createdAt, dayStart), lte(orders.createdAt, dayEnd), eq(orders.status, "completed")));
  const [wasteStats] = await db.select({ totalWasteCost: sql<number>`COALESCE(SUM(${wasteLog.costEstimate}), 0)` }).from(wasteLog).where(and(gte(wasteLog.createdAt, dayStart), lte(wasteLog.createdAt, dayEnd)));
  const netRevenue = (orderStats?.totalRevenue ?? 0) - (orderStats?.totalRefunds ?? 0) - Math.abs(wasteStats?.totalWasteCost ?? 0);
  return { reportDate: date, totalOrders: orderStats?.totalOrders ?? 0, totalRevenue: orderStats?.totalRevenue ?? 0, totalRefunds: orderStats?.totalRefunds ?? 0, totalDiscounts: orderStats?.totalDiscounts ?? 0, totalServiceCharge: orderStats?.totalServiceCharge ?? 0, totalTax: orderStats?.totalTax ?? 0, totalWasteCost: Math.abs(wasteStats?.totalWasteCost ?? 0), totalCash: cashStats?.totalCash ?? 0, totalCard: cashStats?.totalCard ?? 0, netRevenue: Math.round(netRevenue * 100) / 100 };
}
app.get("/reports/daily", async (c) => {
  const date = c.req.query("date") || todayISO();
  return c.json(await generateDailyReport(date));
});
app.get("/reports/range", async (c) => {
  const from = c.req.query("from"); const to = c.req.query("to");
  if (!from || !to) return c.json({ error: "from and to required" }, 400);
  const days: string[] = []; const start = new Date(from); const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days.push(d.toISOString().split("T")[0]);
  const reports = await Promise.all(days.map(generateDailyReport));
  const summary = reports.reduce((acc, r) => ({ totalOrders: acc.totalOrders + r.totalOrders, totalRevenue: acc.totalRevenue + r.totalRevenue, totalRefunds: acc.totalRefunds + r.totalRefunds, totalDiscounts: acc.totalDiscounts + r.totalDiscounts, totalServiceCharge: acc.totalServiceCharge + r.totalServiceCharge, totalTax: acc.totalTax + r.totalTax, totalWasteCost: acc.totalWasteCost + r.totalWasteCost, totalCash: acc.totalCash + r.totalCash, totalCard: acc.totalCard + r.totalCard, netRevenue: acc.netRevenue + r.netRevenue }), { totalOrders: 0, totalRevenue: 0, totalRefunds: 0, totalDiscounts: 0, totalServiceCharge: 0, totalTax: 0, totalWasteCost: 0, totalCash: 0, totalCard: 0, netRevenue: 0 });
  return c.json({ days: reports, summary });
});

// ── SYNC ──
app.get("/sync/changes", async (c) => {
  const since = c.req.query("since") || "1970-01-01T00:00:00";
  const changes = await db.select().from(changeLog).where(gt(changeLog.createdAt, since)).orderBy(asc(changeLog.id)).limit(100);
  return c.json(changes);
});

export default handle(app);
