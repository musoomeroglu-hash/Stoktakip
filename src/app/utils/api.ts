import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-929c4905`;

interface Product {
  id: string;
  name: string;
  category: string;
  phoneModel?: string;
  quantity: number;
  minQuantity: number;
  price: number;
  description: string;
  createdAt: string;
}

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

export const api = {
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

  async bulkImportProducts(products: Omit<Product, "id" | "createdAt">[]): Promise<Product[]> {
    const result = await fetchAPI("/products/bulk", {
      method: "POST",
      body: JSON.stringify({ products }),
    });
    return result.data;
  },

  // Phone Models
  async getPhoneModels(): Promise<Record<string, string[]>> {
    const result = await fetchAPI("/phone-models");
    return result.data || {};
  },

  async addPhoneModel(brand: string, model: string): Promise<Record<string, string[]>> {
    const result = await fetchAPI("/phone-models", {
      method: "POST",
      body: JSON.stringify({ brand, model }),
    });
    return result.data;
  },
};