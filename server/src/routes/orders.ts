import { Hono } from "hono";
import { db } from "../db/client.js";
import {
  orders, orderItems, orderItemExtras,
  cashRegister, settings, extras,
} from "../db/schema.js";
import { eq, and, gte, lte, desc, sql, asc } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";
import { todayISO, nowISO } from "../lib/utils.js";

const app = new Hono();

// GET orders with filters
app.get("/", async (c) => {
  const date = c.req.query("date");
  const status = c.req.query("status");
  const limit = Number(c.req.query("limit") || 50);
  const offset = Number(c.req.query("offset") || 0);

  const conditions = [];
  if (date) {
    conditions.push(gte(orders.createdAt, `${date} 00:00:00`));
    conditions.push(lte(orders.createdAt, `${date} 23:59:59`));
  }
  if (status) {
    conditions.push(eq(orders.status, status as any));
  }

  let query = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));

  return c.json(await query);
});

// GET single order with items and extras
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return c.json({ error: "Not found" }, 404);

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.id));

  const itemsWithExtras = await Promise.all(
    items.map(async (item) => {
      const itemExtras = await db
        .select({
          id: orderItemExtras.id,
          extraId: orderItemExtras.extraId,
          price: orderItemExtras.price,
          extraName: extras.name,
          extraType: extras.type,
        })
        .from(orderItemExtras)
        .leftJoin(extras, eq(orderItemExtras.extraId, extras.id))
        .where(eq(orderItemExtras.orderItemId, item.id));
      return { ...item, extras: itemExtras };
    })
  );

  return c.json({ ...order, items: itemsWithExtras });
});

// POST create order
app.post("/", async (c) => {
  const body = await c.req.json();

  // Get today's order count for order number
  const today = todayISO();
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(
      gte(orders.createdAt, `${today} 00:00:00`),
      lte(orders.createdAt, `${today} 23:59:59`),
    ));
  const orderNumber = (countResult?.count ?? 0) + 1;

  // Get settings
  const settingsRows = await db.select().from(settings);
  const settingsMap: Record<string, any> = {};
  for (const s of settingsRows) {
    try { settingsMap[s.key] = JSON.parse(s.value); } catch { settingsMap[s.key] = s.value; }
  }

  const serviceConfig = settingsMap["service_charge"] || { enabled: true, type: "percent", value: 10 };
  const taxConfig = settingsMap["tax_rate"] || { rate: 10 };

  // Calculate totals
  let subtotal = 0;
  const itemsToInsert: any[] = [];
  const extrasToInsert: any[] = [];

  for (const item of body.items || []) {
    const itemTotal = item.unit_price * item.quantity;
    subtotal += itemTotal;

    const itemId = crypto.randomUUID().replace(/-/g, "");
    itemsToInsert.push({
      id: itemId,
      orderId: "", // will set after order insert
      productId: item.product_id || null,
      comboId: item.combo_id || null,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: itemTotal,
      note: item.note,
    });

    for (const ext of item.extras || []) {
      extrasToInsert.push({
        orderItemId: itemId,
        extraId: ext.extra_id,
        price: ext.price,
      });
    }
  }

  const discountAmount = body.discount_amount || 0;
  const afterDiscount = subtotal - discountAmount;
  const serviceCharge = serviceConfig.enabled
    ? Math.round(afterDiscount * (serviceConfig.value / 100) * 100) / 100
    : 0;
  const taxAmount = Math.round((afterDiscount + serviceCharge) * (taxConfig.rate / 100) * 100) / 100;
  const total = Math.round((afterDiscount + serviceCharge + taxAmount) * 100) / 100;

  // Insert order
  const [order] = await db.insert(orders).values({
    orderNumber,
    status: body.status || "completed",
    subtotal,
    discountAmount,
    serviceCharge: body.no_service_charge ? 0 : serviceCharge,
    taxAmount,
    total: body.no_service_charge ? Math.round((afterDiscount + taxAmount) * 100) / 100 : total,
    paymentMethod: body.payment_method,
    note: body.note,
    campaignId: body.campaign_id,
    completedAt: body.status === "completed" || !body.status ? nowISO() : null,
  }).returning();

  // Insert items
  for (const item of itemsToInsert) {
    item.orderId = order.id;
    await db.insert(orderItems).values(item);
  }

  // Insert item extras
  for (const ext of extrasToInsert) {
    await db.insert(orderItemExtras).values(ext);
  }

  // Create cash register entry
  await db.insert(cashRegister).values({
    type: "sale",
    amount: order.total!,
    description: `Sipariş #${String(orderNumber).padStart(3, "0")}`,
    orderId: order.id,
  });

  await trackChange("orders", order.id, "insert", order);
  return c.json(order, 201);
});

// PUT complete order
app.put("/:id/complete", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.update(orders).set({
    status: "completed",
    completedAt: nowISO(),
  }).where(eq(orders.id, id)).returning();
  if (!order) return c.json({ error: "Not found" }, 404);
  await trackChange("orders", order.id, "update", order);
  return c.json(order);
});

// PUT cancel order
app.put("/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const [order] = await db.update(orders).set({
    status: "cancelled",
  }).where(eq(orders.id, id)).returning();
  if (!order) return c.json({ error: "Not found" }, 404);
  await trackChange("orders", order.id, "update", order);
  return c.json(order);
});

// PUT refund order
app.put("/:id/refund", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { amount, reason, refund_service_charge } = body;

  const [existing] = await db.select().from(orders).where(eq(orders.id, id));
  if (!existing) return c.json({ error: "Not found" }, 404);

  let refundAmount = amount || existing.total || 0;

  // If partial refund and don't refund service charge
  if (amount && !refund_service_charge && existing.serviceCharge) {
    // Keep service charge as-is
  } else if (refund_service_charge && existing.serviceCharge) {
    // Add proportional service charge to refund
    const ratio = refundAmount / (existing.subtotal || 1);
    refundAmount += (existing.serviceCharge || 0) * ratio;
  }

  const [order] = await db.update(orders).set({
    status: "refunded",
    refundAmount: Math.round(refundAmount * 100) / 100,
    refundReason: reason || "İade",
    refundedAt: nowISO(),
  }).where(eq(orders.id, id)).returning();

  // Cash register refund entry
  await db.insert(cashRegister).values({
    type: "refund",
    amount: -Math.abs(refundAmount),
    description: `İade - Sipariş #${String(existing.orderNumber).padStart(3, "0")}: ${reason || "İade"}`,
    orderId: id,
  });

  await trackChange("orders", order!.id, "update", order);
  return c.json(order);
});

export default app;
