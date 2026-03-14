import { Hono } from "hono";
import { db } from "../db/client.js";
import { products, productExtras, extras } from "../db/schema.js";
import { eq, and, asc, sql } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";

const app = new Hono();

// GET all products with optional filters
app.get("/", async (c) => {
  const categoryId = c.req.query("category");
  const active = c.req.query("active");

  let query = db.select().from(products).orderBy(asc(products.sortOrder)).$dynamic();

  const conditions = [];
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));
  if (active !== undefined) conditions.push(eq(products.active, Number(active)));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return c.json(result);
});

// GET single product with extras
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) return c.json({ error: "Not found" }, 404);

  const assignedExtras = await db
    .select({
      id: extras.id,
      name: extras.name,
      type: extras.type,
      price: extras.price,
    })
    .from(productExtras)
    .innerJoin(extras, eq(productExtras.extraId, extras.id))
    .where(eq(productExtras.productId, id));

  return c.json({ ...product, extras: assignedExtras });
});

// POST new product
app.post("/", async (c) => {
  const body = await c.req.json();
  const [product] = await db.insert(products).values({
    categoryId: body.category_id,
    name: body.name,
    description: body.description,
    price: body.price,
    imageUrl: body.image_url,
    active: body.active ?? 1,
    sortOrder: body.sort_order ?? 0,
  }).returning();

  // Assign extras if provided
  if (body.extra_ids?.length) {
    for (const extraId of body.extra_ids) {
      await db.insert(productExtras).values({
        productId: product.id,
        extraId,
      }).onConflictDoNothing();
    }
  }

  await trackChange("products", product.id, "insert", product);
  return c.json(product, 201);
});

// PUT update product
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [product] = await db
    .update(products)
    .set({
      categoryId: body.category_id,
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.image_url,
      active: body.active,
      sortOrder: body.sort_order,
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(products.id, id))
    .returning();

  if (!product) return c.json({ error: "Not found" }, 404);

  // Update extras if provided
  if (body.extra_ids !== undefined) {
    await db.delete(productExtras).where(eq(productExtras.productId, id));
    for (const extraId of body.extra_ids) {
      await db.insert(productExtras).values({
        productId: id,
        extraId,
      }).onConflictDoNothing();
    }
  }

  await trackChange("products", product.id, "update", product);
  return c.json(product);
});

// DELETE product
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(products).where(eq(products.id, id));
  await trackChange("products", id, "delete");
  return c.json({ ok: true });
});

// PATCH bulk price update
app.patch("/bulk-price", async (c) => {
  const body = await c.req.json();
  // body: { category_id?, mode: "percent"|"fixed", value: number }
  const { category_id, mode, value } = body;

  let query = db.select().from(products).$dynamic();
  if (category_id) {
    query = query.where(eq(products.categoryId, category_id));
  }
  const prods = await query;

  for (const prod of prods) {
    let newPrice = prod.price;
    if (mode === "percent") {
      newPrice = Math.round(prod.price * (1 + value / 100) * 100) / 100;
    } else {
      newPrice = prod.price + value;
    }
    if (newPrice < 0) newPrice = 0;

    await db
      .update(products)
      .set({ price: newPrice, updatedAt: sql`(datetime('now'))` })
      .where(eq(products.id, prod.id));
    await trackChange("products", prod.id, "update", { ...prod, price: newPrice });
  }

  return c.json({ updated: prods.length });
});

export default app;
