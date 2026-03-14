import "dotenv/config";
import { db } from "./client.js";
import { categories, products, extras, productExtras, combos, comboItems } from "./schema.js";

async function seed() {
  console.log("Seeding database...");

  // ── Categories ──
  const cats = [
    { id: "cat-corbalar", name: "Çorbalar", icon: "🍲", color: "#F59E0B", sortOrder: 1, active: 1 },
    { id: "cat-ana-yemek", name: "Ana Yemekler", icon: "🥩", color: "#EF4444", sortOrder: 2, active: 1 },
    { id: "cat-pilav-makarna", name: "Pilav & Makarna", icon: "🍚", color: "#F97316", sortOrder: 3, active: 1 },
    { id: "cat-salatalar", name: "Salatalar", icon: "🥗", color: "#10B981", sortOrder: 4, active: 1 },
    { id: "cat-tatlilar", name: "Tatlılar", icon: "🍮", color: "#A855F7", sortOrder: 5, active: 1 },
    { id: "cat-icecekler", name: "İçecekler", icon: "🥤", color: "#3B82F6", sortOrder: 6, active: 1 },
    { id: "cat-kahvalti", name: "Kahvaltı", icon: "🍳", color: "#EAB308", sortOrder: 7, active: 1 },
    { id: "cat-yan-urunler", name: "Yan Ürünler", icon: "🍟", color: "#EC4899", sortOrder: 8, active: 1 },
  ];

  for (const cat of cats) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }
  console.log("✓ Categories seeded");

  // ── Products ──
  const prods = [
    // Çorbalar
    { id: "p-mercimek", categoryId: "cat-corbalar", name: "Mercimek Çorbası", description: "Geleneksel kırmızı mercimek", price: 45, sortOrder: 1 },
    { id: "p-ezogelin", categoryId: "cat-corbalar", name: "Ezogelin Çorbası", description: "Bulgurlu, nohutlu", price: 45, sortOrder: 2 },
    { id: "p-tavuk-suyu", categoryId: "cat-corbalar", name: "Tavuk Suyu Çorba", description: "Şehriyeli tavuk suyu", price: 50, sortOrder: 3 },
    { id: "p-iskembe", categoryId: "cat-corbalar", name: "İşkembe Çorbası", description: "Sarımsaklı, sirkeli", price: 65, sortOrder: 4 },

    // Ana Yemekler
    { id: "p-adana", categoryId: "cat-ana-yemek", name: "Adana Kebap", description: "Acılı el yapımı kebap", price: 180, sortOrder: 1 },
    { id: "p-urfa", categoryId: "cat-ana-yemek", name: "Urfa Kebap", description: "Acısız kebap", price: 180, sortOrder: 2 },
    { id: "p-tavuk-sis", categoryId: "cat-ana-yemek", name: "Tavuk Şiş", description: "Marine tavuk göğsü", price: 140, sortOrder: 3 },
    { id: "p-izgara-kofte", categoryId: "cat-ana-yemek", name: "Izgara Köfte", description: "4 adet ızgara köfte", price: 150, sortOrder: 4 },
    { id: "p-karışık-izgara", categoryId: "cat-ana-yemek", name: "Karışık Izgara", description: "Adana, tavuk, köfte", price: 220, sortOrder: 5 },

    // Pilav & Makarna
    { id: "p-pilav", categoryId: "cat-pilav-makarna", name: "Tereyağlı Pilav", description: "Arpa şehriyeli", price: 40, sortOrder: 1 },
    { id: "p-bulgur", categoryId: "cat-pilav-makarna", name: "Bulgur Pilavı", description: "Domatesli bulgur", price: 40, sortOrder: 2 },
    { id: "p-makarna", categoryId: "cat-pilav-makarna", name: "Makarna", description: "Domates soslu penne", price: 55, sortOrder: 3 },
    { id: "p-tavuklu-makarna", categoryId: "cat-pilav-makarna", name: "Tavuklu Makarna", description: "Kremalı tavuklu penne", price: 75, sortOrder: 4 },

    // Salatalar
    { id: "p-coban", categoryId: "cat-salatalar", name: "Çoban Salata", description: "Domates, biber, salatalık", price: 40, sortOrder: 1 },
    { id: "p-mevsim", categoryId: "cat-salatalar", name: "Mevsim Salata", description: "Mevsim yeşillikleri", price: 45, sortOrder: 2 },
    { id: "p-sezar", categoryId: "cat-salatalar", name: "Sezar Salata", description: "Tavuklu, krutonlu", price: 70, sortOrder: 3 },

    // Tatlılar
    { id: "p-kunefe", categoryId: "cat-tatlilar", name: "Künefe", description: "Antep fıstıklı sıcak künefe", price: 90, sortOrder: 1 },
    { id: "p-sutlac", categoryId: "cat-tatlilar", name: "Sütlaç", description: "Fırında sütlaç", price: 50, sortOrder: 2 },
    { id: "p-baklava", categoryId: "cat-tatlilar", name: "Baklava", description: "4 dilim Antep baklavası", price: 80, sortOrder: 3 },
    { id: "p-kazandibi", categoryId: "cat-tatlilar", name: "Kazandibi", description: "Karamelize muhallebi", price: 55, sortOrder: 4 },

    // İçecekler
    { id: "p-ayran", categoryId: "cat-icecekler", name: "Ayran", description: "Açık ayran", price: 20, sortOrder: 1 },
    { id: "p-kola", categoryId: "cat-icecekler", name: "Coca Cola", description: "330ml kutu", price: 35, sortOrder: 2 },
    { id: "p-cay", categoryId: "cat-icecekler", name: "Çay", description: "Demlik çay", price: 15, sortOrder: 3 },
    { id: "p-su", categoryId: "cat-icecekler", name: "Su", description: "500ml", price: 10, sortOrder: 4 },
    { id: "p-salgam", categoryId: "cat-icecekler", name: "Şalgam", description: "Acılı şalgam suyu", price: 25, sortOrder: 5 },

    // Kahvaltı
    { id: "p-serpme", categoryId: "cat-kahvalti", name: "Serpme Kahvaltı", description: "2 kişilik zengin kahvaltı tabağı", price: 250, sortOrder: 1 },
    { id: "p-sahanda-yumurta", categoryId: "cat-kahvalti", name: "Sahanda Yumurta", description: "3 yumurtalı kaşarlı", price: 60, sortOrder: 2 },
    { id: "p-menemen", categoryId: "cat-kahvalti", name: "Menemen", description: "Biberli, domatesli", price: 55, sortOrder: 3 },

    // Yan Ürünler
    { id: "p-patates-kizartma", categoryId: "cat-yan-urunler", name: "Patates Kızartma", description: "Çıtır patates", price: 40, sortOrder: 1 },
    { id: "p-pide-ekmek", categoryId: "cat-yan-urunler", name: "Pide Ekmek", description: "Sıcak pide", price: 10, sortOrder: 2 },
    { id: "p-lavas", categoryId: "cat-yan-urunler", name: "Lavaş", description: "İnce lavaş ekmeği", price: 10, sortOrder: 3 },
    { id: "p-humus", categoryId: "cat-yan-urunler", name: "Humus", description: "Nohut ezmesi", price: 35, sortOrder: 4 },
  ];

  for (const prod of prods) {
    await db.insert(products).values({ ...prod, active: 1 }).onConflictDoNothing();
  }
  console.log("✓ Products seeded");

  // ── Extras ──
  const extrasData = [
    // Soslar
    { id: "e-aci-sos", name: "Acı Sos", type: "sos" as const, price: 5 },
    { id: "e-nar-eksisi", name: "Nar Ekşisi", type: "sos" as const, price: 5 },
    { id: "e-mayonez", name: "Mayonez", type: "sos" as const, price: 5 },
    { id: "e-ketcap", name: "Ketçap", type: "sos" as const, price: 0 },
    { id: "e-ranch", name: "Ranch", type: "sos" as const, price: 5 },
    { id: "e-bbq", name: "BBQ Sos", type: "sos" as const, price: 5 },

    // Malzemeler
    { id: "e-ekstra-peynir", name: "Ekstra Peynir", type: "malzeme" as const, price: 15 },
    { id: "e-ekstra-et", name: "Ekstra Et", type: "malzeme" as const, price: 30 },
    { id: "e-mantar", name: "Mantar", type: "malzeme" as const, price: 10 },
    { id: "e-misir", name: "Mısır", type: "malzeme" as const, price: 8 },
    { id: "e-zeytin", name: "Zeytin", type: "malzeme" as const, price: 5 },

    // Porsiyonlar
    { id: "e-yarim", name: "Yarım Porsiyon", type: "porsiyon" as const, price: -20 },
    { id: "e-1-5", name: "1.5 Porsiyon", type: "porsiyon" as const, price: 40 },
    { id: "e-buyuk", name: "Büyük Boy", type: "porsiyon" as const, price: 25 },
  ];

  for (const ext of extrasData) {
    await db.insert(extras).values({ ...ext, active: 1 }).onConflictDoNothing();
  }
  console.log("✓ Extras seeded");

  // ── Product Extras (assign extras to main dishes) ──
  const mainDishes = ["p-adana", "p-urfa", "p-tavuk-sis", "p-izgara-kofte", "p-karışık-izgara"];
  const allSosIds = ["e-aci-sos", "e-nar-eksisi", "e-mayonez", "e-ketcap", "e-ranch", "e-bbq"];
  const allMalzIds = ["e-ekstra-peynir", "e-ekstra-et", "e-mantar", "e-misir", "e-zeytin"];
  const allPorsIds = ["e-yarim", "e-1-5", "e-buyuk"];

  let peIdx = 0;
  for (const prodId of mainDishes) {
    for (const extId of [...allSosIds, ...allMalzIds, ...allPorsIds]) {
      await db.insert(productExtras).values({
        id: `pe-${peIdx++}`,
        productId: prodId,
        extraId: extId,
      }).onConflictDoNothing();
    }
  }

  // Porsiyonlar for soups & pasta
  const soupPasta = ["p-mercimek", "p-ezogelin", "p-tavuk-suyu", "p-iskembe", "p-makarna", "p-tavuklu-makarna"];
  for (const prodId of soupPasta) {
    for (const extId of allPorsIds) {
      await db.insert(productExtras).values({
        id: `pe-${peIdx++}`,
        productId: prodId,
        extraId: extId,
      }).onConflictDoNothing();
    }
  }

  // Soslar for patates
  for (const extId of allSosIds) {
    await db.insert(productExtras).values({
      id: `pe-${peIdx++}`,
      productId: "p-patates-kizartma",
      extraId: extId,
    }).onConflictDoNothing();
  }
  console.log("✓ Product extras seeded");

  // ── Combos ──
  await db.insert(combos).values([
    { id: "combo-tavuk-pilav", name: "Tavuk Pilav Menü", description: "Tavuk Şiş + Pilav + Ayran", price: 120, sortOrder: 1 },
    { id: "combo-kofte", name: "Köfte Menü", description: "Izgara Köfte + Pilav + Ayran", price: 110, sortOrder: 2 },
    { id: "combo-kebap", name: "Kebap Menü", description: "Adana + Bulgur + Çoban Salata + Ayran", price: 160, sortOrder: 3 },
  ]).onConflictDoNothing();

  await db.insert(comboItems).values([
    // Tavuk Pilav Menü
    { id: "ci-1", comboId: "combo-tavuk-pilav", productId: "p-tavuk-sis", quantity: 1, isSwappable: 0, sortOrder: 1 },
    { id: "ci-2", comboId: "combo-tavuk-pilav", productId: "p-pilav", quantity: 1, isSwappable: 0, sortOrder: 2 },
    { id: "ci-3", comboId: "combo-tavuk-pilav", productId: "p-ayran", quantity: 1, isSwappable: 1, swapCategoryId: "cat-icecekler", sortOrder: 3 },

    // Köfte Menü
    { id: "ci-4", comboId: "combo-kofte", productId: "p-izgara-kofte", quantity: 1, isSwappable: 0, sortOrder: 1 },
    { id: "ci-5", comboId: "combo-kofte", productId: "p-pilav", quantity: 1, isSwappable: 0, sortOrder: 2 },
    { id: "ci-6", comboId: "combo-kofte", productId: "p-ayran", quantity: 1, isSwappable: 1, swapCategoryId: "cat-icecekler", sortOrder: 3 },

    // Kebap Menü
    { id: "ci-7", comboId: "combo-kebap", productId: "p-adana", quantity: 1, isSwappable: 0, sortOrder: 1 },
    { id: "ci-8", comboId: "combo-kebap", productId: "p-bulgur", quantity: 1, isSwappable: 0, sortOrder: 2 },
    { id: "ci-9", comboId: "combo-kebap", productId: "p-coban", quantity: 1, isSwappable: 1, swapCategoryId: "cat-salatalar", sortOrder: 3 },
    { id: "ci-10", comboId: "combo-kebap", productId: "p-ayran", quantity: 1, isSwappable: 1, swapCategoryId: "cat-icecekler", sortOrder: 4 },
  ]).onConflictDoNothing();
  console.log("✓ Combos seeded");

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
