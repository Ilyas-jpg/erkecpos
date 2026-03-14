import { Hono } from "hono";
import { db } from "../db/client.js";
import { combos, comboItems, products } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { trackChange } from "../lib/change-tracker.js";

const app = new Hono();

app.get("/", async (c) => {
  const allCombos = await db.select().from(combos).orderBy(asc(combos.sortOrder));

  const result = await Promise.all(
    allCombos.map(async (combo) => {
      const items = await db
        .select({
          id: comboItems.id,
          productId: comboItems.productId,
          productName: products.name,
          productPrice: products.price,
          quantity: comboItems.quantity,
          isSwappable: comboItems.isSwappable,
          swapCategoryId: comboItems.swapCategoryId,
          sortOrder: comboItems.sortOrder,
        })
        .from(comboItems)
        .innerJoin(products, eq(comboItems.productId, products.id))
        .where(eq(comboItems.comboId, combo.id))
        .orderBy(asc(comboItems.sortOrder));

      const individualTotal = items.reduce(
        (sum, item) => sum + (item.productPrice ?? 0) * (item.quantity ?? 1),
        0
      );

      return { ...combo, items, individualTotal };
    })
  );

  return c.json(result);
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [combo] = await db.select().from(combos).where(eq(combos.id, id));
  if (!combo) return c.json({ error: "Not found" }, 404);

  const items = await db
    .select({
      id: comboItems.id,
      productId: comboItems.productId,
      productName: products.name,
      productPrice: products.price,
      quantity: comboItems.quantity,
      isSwappable: comboItems.isSwappable,
      swapCategoryId: comboItems.swapCategoryId,
      sortOrder: comboItems.sortOrder,
    })
    .from(comboItems)
    .innerJoin(products, eq(comboItems.productId, products.id))
    .where(eq(comboItems.comboId, id))
    .orderBy(asc(comboItems.sortOrder));

  return c.json({ ...combo, items });
});

app.post("/", async (c) => {
  const body = await c.req.json();
  const [combo] = await db.insert(combos).values({
    name: body.name,
    description: body.description,
    price: body.price,
    imageUrl: body.image_url,
    sortOrder: body.sort_order ?? 0,
    active: body.active ?? 1,
  }).returning();

  if (body.items?.length) {
    for (const item of body.items) {
      await db.insert(comboItems).values({
        comboId: combo.id,
        productId: item.product_id,
        quantity: item.quantity ?? 1,
        isSwappable: item.is_swappable ?? 0,
        swapCategoryId: item.swap_category_id,
        sortOrder: item.sort_order ?? 0,
      });
    }
  }

  await trackChange("combos", combo.id, "insert", combo);
  return c.json(combo, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const [combo] = await db.update(combos).set({
    name: body.name,
    description: body.description,
    price: body.price,
    imageUrl: body.image_url,
    sortOrder: body.sort_order,
    active: body.active,
  }).where(eq(combos.id, id)).returning();

  if (!combo) return c.json({ error: "Not found" }, 404);

  if (body.items !== undefined) {
    await db.delete(comboItems).where(eq(comboItems.comboId, id));
    for (const item of body.items) {
      await db.insert(comboItems).values({
        comboId: id,
        productId: item.product_id,
        quantity: item.quantity ?? 1,
        isSwappable: item.is_swappable ?? 0,
        swapCategoryId: item.swap_category_id,
        sortOrder: item.sort_order ?? 0,
      });
    }
  }

  await trackChange("combos", combo.id, "update", combo);
  return c.json(combo);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(combos).where(eq(combos.id, id));
  await trackChange("combos", id, "delete");
  return c.json({ ok: true });
});

export default app;
