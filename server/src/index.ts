import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import "dotenv/config";

import { loggerMiddleware } from "./middleware/logger.js";
import { authMiddleware } from "./middleware/auth.js";

import categoriesRoutes from "./routes/categories.js";
import productsRoutes from "./routes/products.js";
import extrasRoutes from "./routes/extras.js";
import combosRoutes from "./routes/combos.js";
import ordersRoutes from "./routes/orders.js";
import campaignsRoutes from "./routes/campaigns.js";
import wasteRoutes from "./routes/waste.js";
import cashRegisterRoutes from "./routes/cash-register.js";
import reportsRoutes from "./routes/reports.js";
import settingsRoutes from "./routes/settings.js";
import syncRoutes from "./routes/sync.js";

const app = new Hono();

// Middleware
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));
app.use("*", loggerMiddleware);
app.use("/api/*", authMiddleware);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", time: new Date().toISOString() }));

// Routes
app.route("/api/categories", categoriesRoutes);
app.route("/api/products", productsRoutes);
app.route("/api/extras", extrasRoutes);
app.route("/api/combos", combosRoutes);
app.route("/api/orders", ordersRoutes);
app.route("/api/campaigns", campaignsRoutes);
app.route("/api/waste", wasteRoutes);
app.route("/api/cash", cashRegisterRoutes);
app.route("/api/reports", reportsRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/sync", syncRoutes);

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 POS API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
