import { Hono } from "hono";
import { db } from "../db/client.js";
import { cashRegister } from "../db/schema.js";
import { and, gte, lte, desc, sql } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";

const app = new Hono();

app.get("/", async (c) => {
  const date = c.req.query("date");
  const conditions = [];
  if (date) {
    conditions.push(gte(cashRegister.createdAt, `${date} 00:00:00`));
    conditions.push(lte(cashRegister.createdAt, `${date} 23:59:59`));
  }

  let query = db.select().from(cashRegister).orderBy(desc(cashRegister.createdAt)).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  return c.json(await query);
});

app.get("/summary", async (c) => {
  const date = c.req.query("date");
  const conditions = [];
  if (date) {
    conditions.push(gte(cashRegister.createdAt, `${date} 00:00:00`));
    conditions.push(lte(cashRegister.createdAt, `${date} 23:59:59`));
  }

  let baseQuery = db
    .select({
      type: cashRegister.type,
      total: sql<number>`SUM(${cashRegister.amount})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(cashRegister)
    .groupBy(cashRegister.type)
    .$dynamic();

  if (conditions.length > 0) baseQuery = baseQuery.where(and(...conditions));
  return c.json(await baseQuery);
});

app.post("/", async (c) => {
  const body = await c.req.json();
  const [entry] = await db.insert(cashRegister).values({
    type: body.type,
    amount: body.amount,
    description: body.description,
    orderId: body.order_id,
  }).returning();
  await trackChange("cash_register", entry.id, "insert", entry);
  return c.json(entry, 201);
});

export default app;
