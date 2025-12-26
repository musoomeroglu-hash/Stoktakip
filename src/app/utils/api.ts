import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-929c4905`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "API request failed");
  }

  return response.json();
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  salePrice: number;
  barcode?: string;
  description?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
  purchasePrice: number;
  profit: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalPrice: number;
  totalProfit: number;
  date: string;
}

export interface RepairRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceInfo: string;
  problemDescription: string;
  repairCost: number;
  partsCost: number;
  profit: number;
  createdAt: string;
}

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const result = await fetchAPI("/categories");
    return result.data || [];
  },

  async addCategory(category: Omit<Category, "id">): Promise<Category> {
    const result = await fetchAPI("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
    return result.data;
  },

  async updateCategory(id: string, category: Category): Promise<Category> {
    const result = await fetchAPI(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    });
    return result.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await fetchAPI(`/categories/${id}`, {
      method: "DELETE",
    });
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const result = await fetchAPI("/products");
    return result.data || [];
  },

  async addProduct(product: Omit<Product, "id">): Promise<Product> {
    const result = await fetchAPI("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
    return result.data;
  },

  async updateProduct(id: string, product: Product): Promise<Product> {
    const result = await fetchAPI(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
    return result.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await fetchAPI(`/products/${id}`, {
      method: "DELETE",
    });
  },

  async bulkImportProducts(products: Omit<Product, "id">[]): Promise<Product[]> {
    const result = await fetchAPI("/products/bulk", {
      method: "POST",
      body: JSON.stringify({ products }),
    });
    return result.data;
  },

  // Sales
  async getSales(): Promise<Sale[]> {
    const result = await fetchAPI("/sales");
    return result.data || [];
  },

  async addSale(sale: Omit<Sale, "id">): Promise<Sale> {
    const result = await fetchAPI("/sales", {
      method: "POST",
      body: JSON.stringify(sale),
    });
    return result.data;
  },

  // Reports
  async getReportSummary(period: "daily" | "weekly" | "monthly"): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    sales: Sale[];
  }> {
    const result = await fetchAPI(`/reports/summary?period=${period}`);
    return result.data;
  },

  // Repairs
  async getRepairs(): Promise<RepairRecord[]> {
    const result = await fetchAPI("/repairs");
    return result.data || [];
  },

  async addRepair(repair: Omit<RepairRecord, "id">): Promise<RepairRecord> {
    const result = await fetchAPI("/repairs", {
      method: "POST",
      body: JSON.stringify(repair),
    });
    return result.data;
  },
};