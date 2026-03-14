import { Hono } from "hono";
import { db } from "../db/client.js";
import { wasteLog, products, cashRegister } from "../db/schema.js";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";

const app = new Hono();

app.get("/", async (c) => {
  const date = c.req.query("date");
  const conditions = [];
  if (date) {
    conditions.push(gte(wasteLog.createdAt, `${date} 00:00:00`));
    conditions.push(lte(wasteLog.createdAt, `${date} 23:59:59`));
  }

  let query = db
    .select({
      id: wasteLog.id,
      productId: wasteLog.productId,
      productName: products.name,
      quantity: wasteLog.quantity,
      reason: wasteLog.reason,
      note: wasteLog.note,
      costEstimate: wasteLog.costEstimate,
      createdAt: wasteLog.createdAt,
    })
    .from(wasteLog)
    .leftJoin(products, eq(wasteLog.productId, products.id))
    .orderBy(desc(wasteLog.createdAt))
    .$dynamic();

  if (conditions.length > 0) query = query.where(and(...conditions));
  return c.json(await query);
});

app.get("/summary", async (c) => {
  const date = c.req.query("date");
  const conditions = [];
  if (date) {
    conditions.push(gte(wasteLog.createdAt, `${date} 00:00:00`));
    conditions.push(lte(wasteLog.createdAt, `${date} 23:59:59`));
  }

  let query = db
    .select({
      totalCost: sql<number>`COALESCE(SUM(${wasteLog.costEstimate}), 0)`,
      totalItems: sql<number>`COUNT(*)`,
    })
    .from(wasteLog)
    .$dynamic();

  if (conditions.length > 0) query = query.where(and(...conditions));
  const [result] = await query;
  return c.json(result);
});

app.post("/", async (c) => {
  const body = await c.req.json();
  const [waste] = await db.insert(wasteLog).values({
    productId: body.product_id,
    quantity: body.quantity,
    reason: body.reason,
    note: body.note,
    costEstimate: body.cost_estimate,
  }).returning();

  // Cash register waste entry
  if (body.cost_estimate) {
    await db.insert(cashRegister).values({
      type: "waste",
      amount: -Math.abs(body.cost_estimate),
      description: `Zayi - ${body.note || body.reason}`,
    });
  }

  await trackChange("waste_log", waste.id, "insert", waste);
  return c.json(waste, 201);
});

export default app;
