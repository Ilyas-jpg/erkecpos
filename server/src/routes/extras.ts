import { Hono } from "hono";
import { db } from "../db/client.js";
import { extras } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";

const app = new Hono();

app.get("/", async (c) => {
  const type = c.req.query("type");
  let query = db.select().from(extras).orderBy(asc(extras.name)).$dynamic();
  if (type) query = query.where(eq(extras.type, type as any));
  return c.json(await query);
});

app.post("/", async (c) => {
  const body = await c.req.json();
  const [extra] = await db.insert(extras).values({
    name: body.name,
    type: body.type,
    price: body.price ?? 0,
    active: body.active ?? 1,
  }).returning();
  await trackChange("extras", extra.id, "insert", extra);
  return c.json(extra, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [extra] = await db.update(extras).set({
    name: body.name,
    type: body.type,
    price: body.price,
    active: body.active,
  }).where(eq(extras.id, id)).returning();
  if (!extra) return c.json({ error: "Not found" }, 404);
  await trackChange("extras", extra.id, "update", extra);
  return c.json(extra);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(extras).where(eq(extras.id, id));
  await trackChange("extras", id, "delete");
  return c.json({ ok: true });
});

export default app;
