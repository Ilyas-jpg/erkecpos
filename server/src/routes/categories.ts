import { Hono } from "hono";
import { db } from "../db/client.js";
import { categories } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";

const app = new Hono();

// GET all categories
app.get("/", async (c) => {
  const result = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));
  return c.json(result);
});

// POST new category
app.post("/", async (c) => {
  const body = await c.req.json();
  const [cat] = await db.insert(categories).values({
    name: body.name,
    icon: body.icon,
    color: body.color,
    sortOrder: body.sort_order ?? 0,
    active: body.active ?? 1,
  }).returning();
  await trackChange("categories", cat.id, "insert", cat);
  return c.json(cat, 201);
});

// PUT update category
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [cat] = await db
    .update(categories)
    .set({
      name: body.name,
      icon: body.icon,
      color: body.color,
      sortOrder: body.sort_order,
      active: body.active,
    })
    .where(eq(categories.id, id))
    .returning();
  if (!cat) return c.json({ error: "Not found" }, 404);
  await trackChange("categories", cat.id, "update", cat);
  return c.json(cat);
});

// DELETE category
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(categories).where(eq(categories.id, id));
  await trackChange("categories", id, "delete");
  return c.json({ ok: true });
});

export default app;
