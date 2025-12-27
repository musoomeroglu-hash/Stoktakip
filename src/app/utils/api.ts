import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-929c4905`;

async function fetchAPI(action: string, data?: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({
      action,
      data,
    }),
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
  parent_id?: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id?: string | null;
  stock: number;
  purchase_price: number;
  sale_price: number;
  created_at: string;
}

/* =======================
   CATEGORIES
======================= */

export const api = {
  async getCategories(): Promise<Category[]> {
    return fetchAPI("getCategories");
  },

  async addCategory(data: { name: string; parent_id?: string | null }): Promise<Category> {
    return fetchAPI("addCategory", data);
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return fetchAPI("updateCategory", { id, ...data });
  },

  async deleteCategory(id: string): Promise<void> {
    await fetchAPI("deleteCategory", { id });
  },

  /* =======================
     PRODUCTS
  ======================= */

  async getProducts(): Promise<Product[]> {
    return fetchAPI("getProducts");
  },

  async addProduct(data: {
    name: string;
    category_id?: string | null;
    stock: number;
    purchase_price: number;
    sale_price: number;
  }): Promise<Product> {
    return fetchAPI("addProduct", data);
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return fetchAPI("updateProduct", { id, ...data });
  },

  async deleteProduct(id: string): Promise<void> {
    await fetchAPI("deleteProduct", { id });
  },

  async bulkAddProducts(products: any[]): Promise<Product[]> {
    return fetchAPI("bulkAddProducts", { products });
  },

  /* =======================
     SALES
  ======================= */

  async getSales() {
    return fetchAPI("getSales");
  },

  async addSale(data: any) {
    return fetchAPI("addSale", data);
  },

  async getStats(period: "daily" | "weekly" | "monthly") {
    return fetchAPI("getStats", { period });
  },
};
