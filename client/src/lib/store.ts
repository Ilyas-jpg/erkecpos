import { create } from "zustand";
import { api } from "./api";

// ── Types ──
export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  active: number;
}

export interface Product {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  active: number;
  sortOrder: number;
}

export interface Extra {
  id: string;
  name: string;
  type: "sos" | "malzeme" | "porsiyon";
  price: number;
  active: number;
}

export interface ProductWithExtras extends Product {
  extras?: Extra[];
}

export interface Combo {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: number;
  image_url: string | null;
  items: ComboItem[];
  individualTotal?: number;
}

export interface ComboItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  isSwappable: number;
  swapCategoryId: string | null;
  sortOrder: number;
}

export interface OrderItemExtra {
  extra_id: string;
  name: string;
  type: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item id
  product_id?: string;
  combo_id?: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  extras: OrderItemExtra[];
  note?: string;
}

export interface Settings {
  service_charge: { enabled: boolean; type: string; value: number; label: string };
  tax_rate: { rate: number; label: string };
  business_info: { name: string; address: string; phone: string; tax_id: string };
  daily_target: { amount: number };
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ── Store ──
interface AppState {
  // Data
  categories: Category[];
  products: Product[];
  extras: Extra[];
  combos: Combo[];
  settings: Settings | null;

  // UI State
  selectedCategory: string | null;
  cart: CartItem[];
  theme: "dark" | "light";
  toasts: Toast[];
  loading: boolean;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchExtras: () => Promise<void>;
  fetchCombos: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchAll: () => Promise<void>;

  setSelectedCategory: (id: string | null) => void;

  addToCart: (item: Omit<CartItem, "id">) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  toggleTheme: () => void;
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  categories: [],
  products: [],
  extras: [],
  combos: [],
  settings: null,
  selectedCategory: null,
  cart: [],
  theme: "dark",
  toasts: [],
  loading: false,

  fetchCategories: async () => {
    const data = await api.get<any[]>("/api/categories");
    set({ categories: data });
  },

  fetchProducts: async () => {
    const data = await api.get<any[]>("/api/products?active=1");
    set({ products: data });
  },

  fetchExtras: async () => {
    const data = await api.get<any[]>("/api/extras");
    set({ extras: data });
  },

  fetchCombos: async () => {
    const data = await api.get<any[]>("/api/combos");
    set({ combos: data });
  },

  fetchSettings: async () => {
    const data = await api.get<Settings>("/api/settings");
    set({ settings: data });
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().fetchCategories(),
        get().fetchProducts(),
        get().fetchExtras(),
        get().fetchCombos(),
        get().fetchSettings(),
      ]);
    } catch (err) {
      get().addToast("Veriler yüklenemedi", "error");
    } finally {
      set({ loading: false });
    }
  },

  setSelectedCategory: (id) => set({ selectedCategory: id }),

  addToCart: (item) => {
    const cart = get().cart;
    // Check if same product (no extras) already in cart
    const existing = cart.find(
      (c) =>
        c.product_id === item.product_id &&
        !item.combo_id &&
        !c.combo_id &&
        c.extras.length === 0 &&
        item.extras.length === 0
    );

    if (existing) {
      set({
        cart: cart.map((c) =>
          c.id === existing.id
            ? { ...c, quantity: c.quantity + 1, total_price: c.unit_price * (c.quantity + 1) }
            : c
        ),
      });
    } else {
      set({
        cart: [...cart, { ...item, id: crypto.randomUUID() }],
      });
    }
  },

  updateCartItemQuantity: (id, quantity) => {
    if (quantity <= 0) {
      set({ cart: get().cart.filter((c) => c.id !== id) });
    } else {
      set({
        cart: get().cart.map((c) =>
          c.id === id ? { ...c, quantity, total_price: c.unit_price * quantity } : c
        ),
      });
    }
  },

  removeFromCart: (id) => {
    set({ cart: get().cart.filter((c) => c.id !== id) });
  },

  clearCart: () => set({ cart: [] }),

  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: newTheme });
    document.documentElement.classList.toggle("light", newTheme === "light");
  },

  addToast: (message, type = "success") => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().removeToast(id), 3000);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
