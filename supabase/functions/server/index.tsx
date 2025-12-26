import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-929c4905/health", (c) => {
  return c.json({ status: "ok" });
});

// Categories
app.get("/make-server-929c4905/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix("category:");
    return c.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/categories", async (c) => {
  try {
    const category = await c.req.json();
    const id = category.id || Date.now().toString();
    await kv.set(`category:${id}`, { ...category, id });
    return c.json({ success: true, data: { ...category, id } });
  } catch (error) {
    console.error("Error adding category:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-929c4905/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const category = await c.req.json();
    await kv.set(`category:${id}`, { ...category, id });
    return c.json({ success: true, data: { ...category, id } });
  } catch (error) {
    console.error("Error updating category:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-929c4905/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`category:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Products
app.get("/make-server-929c4905/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/products", async (c) => {
  try {
    const product = await c.req.json();
    const id = product.id || Date.now().toString();
    await kv.set(`product:${id}`, { ...product, id });
    return c.json({ success: true, data: { ...product, id } });
  } catch (error) {
    console.error("Error adding product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-929c4905/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await c.req.json();
    await kv.set(`product:${id}`, { ...product, id });
    return c.json({ success: true, data: { ...product, id } });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-929c4905/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Bulk import products
app.post("/make-server-929c4905/products/bulk", async (c) => {
  try {
    const { products } = await c.req.json();
    const results = [];
    
    for (const product of products) {
      const id = product.id || Date.now().toString() + Math.random();
      await kv.set(`product:${id}`, { ...product, id });
      results.push({ ...product, id });
    }
    
    return c.json({ success: true, data: results, count: results.length });
  } catch (error) {
    console.error("Error bulk importing products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Sales
app.get("/make-server-929c4905/sales", async (c) => {
  try {
    const sales = await kv.getByPrefix("sale:");
    return c.json({ success: true, data: sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/sales", async (c) => {
  try {
    const sale = await c.req.json();
    const id = Date.now().toString();
    
    // Save sale
    await kv.set(`sale:${id}`, { ...sale, id });
    
    // Update product stock
    for (const item of sale.items) {
      const product = await kv.get(`product:${item.productId}`);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await kv.set(`product:${item.productId}`, product);
      }
    }
    
    return c.json({ success: true, data: { ...sale, id } });
  } catch (error) {
    console.error("Error adding sale:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reports
app.get("/make-server-929c4905/reports/summary", async (c) => {
  try {
    const period = c.req.query("period") || "daily";
    const sales = await kv.getByPrefix("sale:");
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    const filteredSales = sales.filter((sale: any) => 
      new Date(sale.date) >= startDate
    );
    
    const totalRevenue = filteredSales.reduce((sum: number, sale: any) => 
      sum + sale.totalPrice, 0
    );
    
    const totalProfit = filteredSales.reduce((sum: number, sale: any) => 
      sum + sale.totalProfit, 0
    );
    
    return c.json({
      success: true,
      data: {
        totalSales: filteredSales.length,
        totalRevenue,
        totalProfit,
        sales: filteredSales,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
