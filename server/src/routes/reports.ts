import { Hono } from "hono";
import { db } from "../db/client.js";
import { orders, cashRegister, wasteLog, dailyReports } from "../db/schema.js";
import { and, gte, lte, eq, sql } from "drizzle-orm";
import { todayISO, nowISO } from "../lib/utils.js";

const app = new Hono();

async function generateDailyReport(date: string) {
  const dayStart = `${date} 00:00:00`;
  const dayEnd = `${date} 23:59:59`;

  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      totalRefunds: sql<number>`COALESCE(SUM(${orders.refundAmount}), 0)`,
      totalDiscounts: sql<number>`COALESCE(SUM(${orders.discountAmount}), 0)`,
      totalServiceCharge: sql<number>`COALESCE(SUM(${orders.serviceCharge}), 0)`,
      totalTax: sql<number>`COALESCE(SUM(${orders.taxAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, dayStart),
        lte(orders.createdAt, dayEnd),
        eq(orders.status, "completed")
      )
    );

  const [cashStats] = await db
    .select({
      totalCash: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentMethod} = 'cash' THEN ${orders.total} ELSE 0 END), 0)`,
      totalCard: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentMethod} IN ('card', 'pos') THEN ${orders.total} ELSE 0 END), 0)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, dayStart),
        lte(orders.createdAt, dayEnd),
        eq(orders.status, "completed")
      )
    );

  const [wasteStats] = await db
    .select({
      totalWasteCost: sql<number>`COALESCE(SUM(${wasteLog.costEstimate}), 0)`,
    })
    .from(wasteLog)
    .where(and(gte(wasteLog.createdAt, dayStart), lte(wasteLog.createdAt, dayEnd)));

  const netRevenue =
    (orderStats?.totalRevenue ?? 0) -
    (orderStats?.totalRefunds ?? 0) -
    Math.abs(wasteStats?.totalWasteCost ?? 0);

  return {
    reportDate: date,
    totalOrders: orderStats?.totalOrders ?? 0,
    totalRevenue: orderStats?.totalRevenue ?? 0,
    totalRefunds: orderStats?.totalRefunds ?? 0,
    totalDiscounts: orderStats?.totalDiscounts ?? 0,
    totalServiceCharge: orderStats?.totalServiceCharge ?? 0,
    totalTax: orderStats?.totalTax ?? 0,
    totalWasteCost: Math.abs(wasteStats?.totalWasteCost ?? 0),
    totalCash: cashStats?.totalCash ?? 0,
    totalCard: cashStats?.totalCard ?? 0,
    netRevenue: Math.round(netRevenue * 100) / 100,
  };
}

// GET daily report
app.get("/daily", async (c) => {
  const date = c.req.query("date") || todayISO();
  const report = await generateDailyReport(date);
  return c.json(report);
});

// GET range report
app.get("/range", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  if (!from || !to) return c.json({ error: "from and to required" }, 400);

  const days: string[] = [];
  const start = new Date(from);
  const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split("T")[0]);
  }

  const reports = await Promise.all(days.map(generateDailyReport));

  const summary = reports.reduce(
    (acc, r) => ({
      totalOrders: acc.totalOrders + r.totalOrders,
      totalRevenue: acc.totalRevenue + r.totalRevenue,
      totalRefunds: acc.totalRefunds + r.totalRefunds,
      totalDiscounts: acc.totalDiscounts + r.totalDiscounts,
      totalServiceCharge: acc.totalServiceCharge + r.totalServiceCharge,
      totalTax: acc.totalTax + r.totalTax,
      totalWasteCost: acc.totalWasteCost + r.totalWasteCost,
      totalCash: acc.totalCash + r.totalCash,
      totalCard: acc.totalCard + r.totalCard,
      netRevenue: acc.netRevenue + r.netRevenue,
    }),
    {
      totalOrders: 0, totalRevenue: 0, totalRefunds: 0, totalDiscounts: 0,
      totalServiceCharge: 0, totalTax: 0, totalWasteCost: 0,
      totalCash: 0, totalCard: 0, netRevenue: 0,
    }
  );

  return c.json({ days: reports, summary });
});

// POST close day
app.post("/close-day", async (c) => {
  const body = await c.req.json();
  const date = body.date || todayISO();
  const report = await generateDailyReport(date);

  await db.insert(dailyReports).values({
    ...report,
    notes: body.notes,
    closedAt: nowISO(),
  }).onConflictDoNothing();

  return c.json({ ...report, closed: true });
});

export default app;
