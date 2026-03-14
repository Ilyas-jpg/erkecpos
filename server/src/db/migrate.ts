import "dotenv/config";
import { turso } from "./client.js";

const migrations = [
  // Categories
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Products
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0,
    image_url TEXT,
    active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_active ON products(active)`,

  // Extras
  `CREATE TABLE IF NOT EXISTS extras (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sos', 'malzeme', 'porsiyon')),
    price REAL DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Product Extras
  `CREATE TABLE IF NOT EXISTS product_extras (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    extra_id TEXT NOT NULL REFERENCES extras(id) ON DELETE CASCADE,
    UNIQUE(product_id, extra_id)
  )`,

  // Combos
  `CREATE TABLE IF NOT EXISTS combos (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    active INTEGER DEFAULT 1,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS combo_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    combo_id TEXT NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    is_swappable INTEGER DEFAULT 0,
    swap_category_id TEXT REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0
  )`,

  // Campaigns
  `CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percent', 'fixed', 'bogo', 'free_extra')),
    value REAL,
    applies_to TEXT CHECK (applies_to IN ('all', 'category', 'product', 'combo')),
    target_id TEXT,
    min_order_amount REAL,
    start_date TEXT,
    end_date TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Orders
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_number INTEGER,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled', 'refunded')),
    subtotal REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    service_charge REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    total REAL DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'pos', 'mixed')),
    note TEXT,
    campaign_id TEXT REFERENCES campaigns(id),
    refund_amount REAL DEFAULT 0,
    refund_reason TEXT,
    refunded_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`,

  `CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    combo_id TEXT REFERENCES combos(id),
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    note TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,

  `CREATE TABLE IF NOT EXISTS order_item_extras (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_item_id TEXT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    extra_id TEXT REFERENCES extras(id),
    price REAL NOT NULL
  )`,

  // Cash Register
  `CREATE TABLE IF NOT EXISTS cash_register (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    type TEXT NOT NULL CHECK (type IN ('sale', 'refund', 'expense', 'waste', 'cash_in', 'cash_out')),
    amount REAL NOT NULL,
    description TEXT,
    order_id TEXT REFERENCES orders(id),
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_cash_register_created ON cash_register(created_at)`,

  // Waste Log
  `CREATE TABLE IF NOT EXISTS waste_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    product_id TEXT REFERENCES products(id),
    quantity REAL NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('expired', 'damaged', 'overcooked', 'dropped', 'other')),
    note TEXT,
    cost_estimate REAL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_waste_log_created ON waste_log(created_at)`,

  // Settings
  `CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )`,

  // Default settings
  `INSERT OR IGNORE INTO settings (id, key, value) VALUES
    (lower(hex(randomblob(16))), 'service_charge', '{"enabled": true, "type": "percent", "value": 10, "label": "Servis Ücreti"}'),
    (lower(hex(randomblob(16))), 'tax_rate', '{"rate": 10, "label": "KDV"}'),
    (lower(hex(randomblob(16))), 'business_info', '{"name": "Dinlenme Tesisi", "address": "", "phone": "", "tax_id": ""}'),
    (lower(hex(randomblob(16))), 'daily_target', '{"amount": 10000}')`,

  // Daily Reports
  `CREATE TABLE IF NOT EXISTS daily_reports (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    report_date TEXT UNIQUE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    total_refunds REAL DEFAULT 0,
    total_discounts REAL DEFAULT 0,
    total_service_charge REAL DEFAULT 0,
    total_tax REAL DEFAULT 0,
    total_waste_cost REAL DEFAULT 0,
    total_cash REAL DEFAULT 0,
    total_card REAL DEFAULT 0,
    net_revenue REAL DEFAULT 0,
    notes TEXT,
    closed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Change Log
  `CREATE TABLE IF NOT EXISTS change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
    payload TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_change_log_created ON change_log(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_change_log_table ON change_log(table_name)`,
];

async function migrate() {
  console.log("Running migrations...");
  for (const sql of migrations) {
    try {
      await turso.execute(sql);
      console.log("✓", sql.substring(0, 60).replace(/\n/g, " ") + "...");
    } catch (err: any) {
      // Ignore "already exists" errors
      if (!err.message?.includes("already exists")) {
        console.error("✗ Migration failed:", err.message);
        console.error("  SQL:", sql.substring(0, 100));
      }
    }
  }
  console.log("Migrations complete!");
  process.exit(0);
}

migrate();
