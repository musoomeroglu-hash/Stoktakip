import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();
// Trigger deployment: 2026-02-18 21:50

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
  return c.json({ status: "ok", version: "2.0" });
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

app.delete("/make-server-929c4905/sales/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Get the sale to restore stock
    const sale = await kv.get(`sale:${id}`);
    if (sale) {
      // Restore product stock
      for (const item of sale.items) {
        const product = await kv.get(`product:${item.productId}`);
        if (product) {
          product.stock += item.quantity;
          await kv.set(`product:${item.productId}`, product);
        }
      }
    }

    // Delete sale
    await kv.del(`sale:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting sale:", error);
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

// Repairs
app.get("/make-server-929c4905/repairs", async (c) => {
  try {
    const repairs = await kv.getByPrefix("repair:");
    return c.json({ success: true, data: repairs });
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/repairs", async (c) => {
  try {
    const repair = await c.req.json();
    const id = Date.now().toString();
    await kv.set(`repair:${id}`, { ...repair, id });
    return c.json({ success: true, data: { ...repair, id } });
  } catch (error) {
    console.error("Error adding repair:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update repair status
app.put("/make-server-929c4905/repairs/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();

    // Get existing repair
    const repair = await kv.get(`repair:${id}`);
    if (!repair) {
      return c.json({ success: false, error: "Repair not found" }, 404);
    }

    // Update status and deliveredAt if status is delivered
    const updatedRepair = {
      ...repair,
      status,
      deliveredAt: status === "delivered" ? new Date().toISOString() : repair.deliveredAt,
    };

    await kv.set(`repair:${id}`, updatedRepair);
    return c.json({ success: true, data: updatedRepair });
  } catch (error) {
    console.error("Error updating repair status:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update repair (full update)
app.put("/make-server-929c4905/repairs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const repairData = await c.req.json();

    // Get existing repair
    const repair = await kv.get(`repair:${id}`);
    if (!repair) {
      return c.json({ success: false, error: "Repair not found" }, 404);
    }

    // Merge with existing data
    const updatedRepair = {
      ...repair,
      ...repairData,
      id, // Preserve ID
    };

    await kv.set(`repair:${id}`, updatedRepair);
    return c.json({ success: true, data: updatedRepair });
  } catch (error) {
    console.error("Error updating repair:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete repair
app.delete("/make-server-929c4905/repairs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`repair:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting repair:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Customers
app.get("/make-server-929c4905/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    return c.json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/customers", async (c) => {
  try {
    const customer = await c.req.json();
    const id = customer.id || Date.now().toString();
    await kv.set(`customer:${id}`, { ...customer, id });
    return c.json({ success: true, data: { ...customer, id } });
  } catch (error) {
    console.error("Error adding customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-929c4905/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const customer = await c.req.json();
    await kv.set(`customer:${id}`, { ...customer, id });
    return c.json({ success: true, data: { ...customer, id } });
  } catch (error) {
    console.error("Error updating customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-929c4905/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`customer:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Customer transactions
app.get("/make-server-929c4905/customer-transactions", async (c) => {
  try {
    const transactions = await kv.getByPrefix("transaction:");
    return c.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/customer-transactions", async (c) => {
  try {
    const { customerId, type, amount, description } = await c.req.json();

    // Get customer
    const customer = await kv.get(`customer:${customerId}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }

    // Update customer balance
    switch (type) {
      case "debt":
        customer.debt += amount;
        break;
      case "credit":
        customer.credit += amount;
        break;
      case "payment_received":
        customer.debt = Math.max(0, customer.debt - amount);
        break;
      case "payment_made":
        customer.credit = Math.max(0, customer.credit - amount);
        break;
    }

    // Save updated customer
    await kv.set(`customer:${customerId}`, customer);

    // Save transaction record
    const transactionId = Date.now().toString();
    const transaction = {
      id: transactionId,
      customerId,
      type,
      amount,
      description,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`transaction:${transactionId}`, transaction);

    return c.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Error adding customer transaction:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Phone Sales
app.get("/make-server-929c4905/phone-sales", async (c) => {
  try {
    const phoneSales = await kv.getByPrefix("phonesale:");
    return c.json({ success: true, data: phoneSales });
  } catch (error) {
    console.error("Error fetching phone sales:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/phone-sales", async (c) => {
  try {
    const phoneSale = await c.req.json();
    const id = phoneSale.id || Date.now().toString();
    await kv.set(`phonesale:${id}`, { ...phoneSale, id });
    return c.json({ success: true, data: { ...phoneSale, id } });
  } catch (error) {
    console.error("Error adding phone sale:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-929c4905/phone-sales/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const phoneSale = await c.req.json();
    await kv.set(`phonesale:${id}`, { ...phoneSale, id });
    return c.json({ success: true, data: { ...phoneSale, id } });
  } catch (error) {
    console.error("Error updating phone sale:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-929c4905/phone-sales/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`phonesale:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting phone sale:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Expenses
app.get("/make-server-929c4905/expenses", async (c) => {
  try {
    const expenses = await kv.getByPrefix("expense:");
    return c.json({ success: true, data: expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/expenses", async (c) => {
  try {
    const expense = await c.req.json();
    const id = expense.id || Date.now().toString();
    await kv.set(`expense:${id}`, { ...expense, id });
    return c.json({ success: true, data: { ...expense, id } });
  } catch (error) {
    console.error("Error adding expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-929c4905/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const expense = await c.req.json();
    await kv.set(`expense:${id}`, { ...expense, id });
    return c.json({ success: true, data: { ...expense, id } });
  } catch (error) {
    console.error("Error updating expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-929c4905/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`expense:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Customer Requests
app.get("/make-server-929c4905/customer-requests", async (c) => {
  try {
    const requests = await kv.getByPrefix("request:");
    return c.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching customer requests:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/customer-requests", async (c) => {
  try {
    const request = await c.req.json();
    const id = request.id || Date.now().toString();
    await kv.set(`request:${id}`, { ...request, id });
    return c.json({ success: true, data: { ...request, id } });
  } catch (error) {
    console.error("Error adding customer request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-929c4905/customer-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const request = await c.req.json();
    await kv.set(`request:${id}`, { ...request, id });
    return c.json({ success: true, data: { ...request, id } });
  } catch (error) {
    console.error("Error updating customer request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-929c4905/customer-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`request:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer request:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Phone Stocks
app.get("/make-server-929c4905/phone-stocks", async (c) => {
  try {
    const stocks = await kv.getByPrefix("phonestock:");
    return c.json({ success: true, data: stocks });
  } catch (error) {
    console.error("Error fetching phone stocks:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-929c4905/phone-stocks", async (c) => {
  try {
    const stock = await c.req.json();
    const id = stock.id || Date.now().toString();
    await kv.set(`phonestock:${id}`, { ...stock, id });
    return c.json({ success: true, data: { ...stock, id } });
  } catch (error) {
    console.error("Error adding phone stock:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-929c4905/phone-stocks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const stock = await c.req.json();
    await kv.set(`phonestock:${id}`, { ...stock, id });
    return c.json({ success: true, data: { ...stock, id } });
  } catch (error) {
    console.error("Error updating phone stock:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-929c4905/phone-stocks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`phonestock:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting phone stock:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);