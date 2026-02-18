import { Hono, type Context } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const prefix = "/stocks-server";

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

// Helper to define routes both with and without prefix to ensure 100% compatibility
const defineRoute = (method: string, path: string, handler: (c: Context) => any) => {
    const fullPath = path.startsWith("/") ? path : `/${path}`;
    const prefixedPath = `${prefix}${fullPath}`;

    if (method === "GET") {
        app.get(fullPath, handler);
        app.get(prefixedPath, handler);
    } else if (method === "POST") {
        app.post(fullPath, handler);
        app.post(prefixedPath, handler);
    } else if (method === "PUT") {
        app.put(fullPath, handler);
        app.put(prefixedPath, handler);
    } else if (method === "DELETE") {
        app.delete(fullPath, handler);
        app.delete(prefixedPath, handler);
    }
};

// Health check
defineRoute("GET", "/health", (c: Context) => c.json({ status: "ok", version: "STOCKS-SERVER-v2.3", received_path: c.req.path }));

// Phone Stocks (DEFINED EARLY)
defineRoute("GET", "/phone-stocks", async (c: Context) => {
    try {
        const data = await kv.getByPrefix("phonestock:");
        return c.json({ success: true, data });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

defineRoute("POST", "/phone-stocks", async (c: Context) => {
    try {
        const data = await c.req.json();
        const id = data.id || Date.now().toString();
        await kv.set(`phonestock:${id}`, { ...data, id });
        return c.json({ success: true, data: { ...data, id } });
    } catch (error) {
        console.error("DEBUG POST phone-stocks error:", error);
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("PUT", "/phone-stocks/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        const data = await c.req.json();
        await kv.set(`phonestock:${id}`, { ...data, id });
        return c.json({ success: true, data: { ...data, id } });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

defineRoute("DELETE", "/phone-stocks/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        await kv.del(`phonestock:${id}`);
        return c.json({ success: true });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// Categories
defineRoute("GET", "/categories", async (c: Context) => {
    try {
        const categories = await kv.getByPrefix("category:");
        return c.json({ success: true, data: categories });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("POST", "/categories", async (c: Context) => {
    try {
        const category = await c.req.json();
        const id = category.id || Date.now().toString();
        await kv.set(`category:${id}`, { ...category, id });
        return c.json({ success: true, data: { ...category, id } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("PUT", "/categories/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        const category = await c.req.json();
        await kv.set(`category:${id}`, { ...category, id });
        return c.json({ success: true, data: { ...category, id } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("DELETE", "/categories/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        await kv.del(`category:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

// Products
defineRoute("GET", "/products", async (c: Context) => {
    try {
        const products = await kv.getByPrefix("product:");
        return c.json({ success: true, data: products });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("POST", "/products", async (c: Context) => {
    try {
        const product = await c.req.json();
        const id = product.id || Date.now().toString();
        await kv.set(`product:${id}`, { ...product, id });
        return c.json({ success: true, data: { ...product, id } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("PUT", "/products/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        const product = await c.req.json();
        await kv.set(`product:${id}`, { ...product, id });
        return c.json({ success: true, data: { ...product, id } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("DELETE", "/products/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        await kv.del(`product:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("POST", "/products/bulk", async (c: Context) => {
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
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("GET", "/products/search", async (c: Context) => {
    try {
        const query = c.req.query("q")?.toLowerCase() || "";
        if (!query) return c.json({ success: false, error: "Query required" }, 400);
        const allProducts = await kv.getByPrefix("product:");
        const results = allProducts.filter((p: any) => p.name?.toLowerCase().includes(query));
        return c.json({ success: true, data: results });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

// Sales
defineRoute("GET", "/sales", async (c: Context) => {
    try {
        const sales = await kv.getByPrefix("sale:");
        return c.json({ success: true, data: sales });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("POST", "/sales", async (c: Context) => {
    try {
        const sale = await c.req.json();
        const id = Date.now().toString();
        await kv.set(`sale:${id}`, { ...sale, id });
        for (const item of sale.items) {
            const product = await kv.get(`product:${item.productId}`);
            if (product) {
                product.stock = Math.max(0, product.stock - item.quantity);
                await kv.set(`product:${item.productId}`, product);
            }
        }
        return c.json({ success: true, data: { ...sale, id } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("DELETE", "/sales/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        const sale = await kv.get(`sale:${id}`);
        if (sale) {
            for (const item of sale.items) {
                const product = await kv.get(`product:${item.productId}`);
                if (product) {
                    product.stock += item.quantity;
                    await kv.set(`product:${item.productId}`, product);
                }
            }
        }
        await kv.del(`sale:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

// Reports
defineRoute("GET", "/reports/summary", async (c: Context) => {
    try {
        const period = c.req.query("period") || "daily";
        const sales = await kv.getByPrefix("sale:");
        const now = new Date();
        let startDate: Date;
        switch (period) {
            case "daily": startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
            case "weekly": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 100 * 1000); break;
            case "monthly": startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
            default: startDate = new Date(0);
        }
        const filtered = sales.filter((s: any) => new Date(s.date) >= startDate);
        const totalRev = filtered.reduce((sum: number, s: any) => sum + s.totalPrice, 0);
        const totalProf = filtered.reduce((sum: number, s: any) => sum + s.totalProfit, 0);
        return c.json({ success: true, data: { totalSales: filtered.length, totalRevenue: totalRev, totalProfit: totalProf, sales: filtered } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

// Repairs
defineRoute("GET", "/repairs", async (c: Context) => {
    try {
        const repairs = await kv.getByPrefix("repair:");
        return c.json({ success: true, data: repairs });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("POST", "/repairs", async (c: Context) => {
    try {
        const repair = await c.req.json();
        const id = Date.now().toString();
        await kv.set(`repair:${id}`, { ...repair, id });
        return c.json({ success: true, data: { ...repair, id } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("PUT", "/repairs/:id/status", async (c: Context) => {
    try {
        const id = c.req.param("id");
        const { status } = await c.req.json();
        const repair = await kv.get(`repair:${id}`);
        if (!repair) return c.json({ success: false, error: "Not found" }, 404);
        const updated = { ...repair, status, deliveredAt: status === "delivered" ? new Date().toISOString() : repair.deliveredAt };
        await kv.set(`repair:${id}`, updated);
        return c.json({ success: true, data: updated });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("PUT", "/repairs/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        const data = await c.req.json();
        const repair = await kv.get(`repair:${id}`);
        if (!repair) return c.json({ success: false, error: "Not found" }, 404);
        const updated = { ...repair, ...data, id };
        await kv.set(`repair:${id}`, updated);
        return c.json({ success: true, data: updated });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("DELETE", "/repairs/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        await kv.del(`repair:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

// Customers
defineRoute("GET", "/customers", async (c: Context) => {
    try {
        const customers = await kv.getByPrefix("customer:");
        return c.json({ success: true, data: customers });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("POST", "/customers", async (c: Context) => {
    try {
        const customer = await c.req.json();
        const id = customer.id || Date.now().toString();
        await kv.set(`customer:${id}`, { ...customer, id });
        return c.json({ success: true, data: { ...customer, id } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("PUT", "/customers/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        const customer = await c.req.json();
        await kv.set(`customer:${id}`, { ...customer, id });
        return c.json({ success: true, data: { ...customer, id } });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

defineRoute("DELETE", "/customers/:id", async (c: Context) => {
    try {
        const id = c.req.param("id");
        await kv.del(`customer:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
    }
});

// Phone Sales
defineRoute("GET", "/phone-sales", async (c: Context) => {
    try {
        const data = await kv.getByPrefix("phonesale:");
        return c.json({ success: true, data });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

defineRoute("POST", "/phone-sales", async (c: Context) => {
    try {
        const data = await c.req.json();
        const id = data.id || Date.now().toString();
        await kv.set(`phonesale:${id}`, { ...data, id });
        return c.json({ success: true, data: { ...data, id } });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// Expenses
defineRoute("GET", "/expenses", async (c: Context) => {
    try {
        const data = await kv.getByPrefix("expense:");
        return c.json({ success: true, data });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

defineRoute("POST", "/expenses", async (c: Context) => {
    try {
        const data = await c.req.json();
        const id = data.id || Date.now().toString();
        await kv.set(`expense:${id}`, { ...data, id });
        return c.json({ success: true, data: { ...data, id } });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// Customer Requests
defineRoute("GET", "/customer-requests", async (c: Context) => {
    try {
        const requests = await kv.getByPrefix("customer-request:");
        return c.json({ success: true, data: requests });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

defineRoute("POST", "/customer-requests", async (c: Context) => {
    try {
        const request = await c.req.json();
        const id = request.id || Date.now().toString();
        await kv.set(`customer-request:${id}`, { ...request, id });
        return c.json({ success: true, data: { ...request, id } });
    } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// Not Found Handler - DEBUG MODE
app.notFound((c: Context) => {
    console.log(`⚠️ 404 NOT FOUND: ${c.req.method} ${c.req.path}`);
    return c.json({
        success: false,
        error: "Route not found",
        debug: {
            api_name: "stocks-server",
            received_path: c.req.path,
            received_method: c.req.method,
            received_url: c.req.url,
            expected_example: `/phone-stocks`
        }
    }, 404);
});

Deno.serve(app.fetch);
