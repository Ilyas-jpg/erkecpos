import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";

import categoriesRoutes from "../server/src/routes/categories.js";
import productsRoutes from "../server/src/routes/products.js";
import extrasRoutes from "../server/src/routes/extras.js";
import combosRoutes from "../server/src/routes/combos.js";
import ordersRoutes from "../server/src/routes/orders.js";
import campaignsRoutes from "../server/src/routes/campaigns.js";
import wasteRoutes from "../server/src/routes/waste.js";
import cashRegisterRoutes from "../server/src/routes/cash-register.js";
import reportsRoutes from "../server/src/routes/reports.js";
import settingsRoutes from "../server/src/routes/settings.js";
import syncRoutes from "../server/src/routes/sync.js";

const app = new Hono().basePath("/api");

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (c) => c.json({ status: "ok", time: new Date().toISOString() }));

app.route("/categories", categoriesRoutes);
app.route("/products", productsRoutes);
app.route("/extras", extrasRoutes);
app.route("/combos", combosRoutes);
app.route("/orders", ordersRoutes);
app.route("/campaigns", campaignsRoutes);
app.route("/waste", wasteRoutes);
app.route("/cash", cashRegisterRoutes);
app.route("/reports", reportsRoutes);
app.route("/settings", settingsRoutes);
app.route("/sync", syncRoutes);

export default handle(app);
