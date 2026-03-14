import { Hono } from "hono";
import { db } from "../db/client.js";
import { settings } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";

const app = new Hono();

app.get("/", async (c) => {
  const rows = await db.select().from(settings);
  const result: Record<string, any> = {};
  for (const row of rows) {
    try { result[row.key] = JSON.parse(row.value); } catch { result[row.key] = row.value; }
  }
  return c.json(result);
});

app.get("/:key", async (c) => {
  const key = c.req.param("key");
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  if (!row) return c.json({ error: "Not found" }, 404);
  try { return c.json(JSON.parse(row.value)); } catch { return c.json(row.value); }
});

app.put("/:key", async (c) => {
  const key = c.req.param("key");
  const body = await c.req.json();
  const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value);

  const [existing] = await db.select().from(settings).where(eq(settings.key, key));
  if (existing) {
    await db.update(settings).set({
      value,
      updatedAt: sql`(datetime('now'))`,
    }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }

  await trackChange("settings", key, "update", { key, value });
  return c.json({ key, value });
});

export default app;
