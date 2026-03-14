import { Hono } from "hono";
import { db } from "../db/client.js";
import { campaigns } from "../db/schema.js";
import { eq, and, lte, gte, sql, desc } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";

const app = new Hono();

app.get("/", async (c) => {
  return c.json(await db.select().from(campaigns).orderBy(desc(campaigns.createdAt)));
});

app.get("/active", async (c) => {
  const now = new Date().toISOString();
  const result = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.active, 1),
        lte(campaigns.startDate, now),
        gte(campaigns.endDate, now)
      )
    );
  return c.json(result);
});

app.post("/", async (c) => {
  const body = await c.req.json();
  const [campaign] = await db.insert(campaigns).values({
    name: body.name,
    type: body.type,
    value: body.value,
    appliesTo: body.applies_to,
    targetId: body.target_id,
    minOrderAmount: body.min_order_amount,
    startDate: body.start_date,
    endDate: body.end_date,
    active: body.active ?? 1,
  }).returning();
  await trackChange("campaigns", campaign.id, "insert", campaign);
  return c.json(campaign, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [campaign] = await db.update(campaigns).set({
    name: body.name,
    type: body.type,
    value: body.value,
    appliesTo: body.applies_to,
    targetId: body.target_id,
    minOrderAmount: body.min_order_amount,
    startDate: body.start_date,
    endDate: body.end_date,
    active: body.active,
  }).where(eq(campaigns.id, id)).returning();
  if (!campaign) return c.json({ error: "Not found" }, 404);
  await trackChange("campaigns", campaign.id, "update", campaign);
  return c.json(campaign);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(campaigns).where(eq(campaigns.id, id));
  await trackChange("campaigns", id, "delete");
  return c.json({ ok: true });
});

export default app;
