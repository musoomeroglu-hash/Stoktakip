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

// Get all products
app.get("/make-server-929c4905/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a product
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

// Update a product
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

// Delete a product
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

// Get phone models
app.get("/make-server-929c4905/phone-models", async (c) => {
  try {
    const models = await kv.get("phone_models");
    return c.json({ success: true, data: models || {} });
  } catch (error) {
    console.error("Error fetching phone models:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add phone model
app.post("/make-server-929c4905/phone-models", async (c) => {
  try {
    const { brand, model } = await c.req.json();
    const currentModels = (await kv.get("phone_models")) || {};
    
    if (!currentModels[brand]) {
      currentModels[brand] = [];
    }
    
    if (!currentModels[brand].includes(model)) {
      currentModels[brand].push(model);
      await kv.set("phone_models", currentModels);
    }
    
    return c.json({ success: true, data: currentModels });
  } catch (error) {
    console.error("Error adding phone model:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);