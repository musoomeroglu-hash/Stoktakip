import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server`;

export { projectId, API_URL };

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  console.log('🔵 API Request:', url);

  // 10 second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    console.log(`🔵 Response status [${endpoint}]:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API Hatası (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`❌ API Timeout: ${url} (10s passed)`);
      throw new Error(`İnternet bağlantısı yavaş veya sunucu yanıt vermiyor (Timeout: ${endpoint})`);
    }
    console.error('❌ Fetch Error:', error);
    throw error;
  }
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
  categoryId?: string;
}

export type PaymentMethod = "cash" | "card" | "transfer" | "mixed";

export interface PaymentDetails {
  cash?: number;
  card?: number;
  transfer?: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalPrice: number;
  totalProfit: number;
  date: string;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
  customerInfo?: {
    name: string;
    phone: string;
  };
}

export interface RepairRecord {
  id: string;
  customerId?: string; // Opsiyonel müşteri bağlantısı
  customerName: string;
  customerPhone: string;
  deviceInfo: string;
  imei: string;
  problemDescription: string;
  repairCost: number;
  partsCost: number;
  profit: number;
  status: "in_progress" | "completed" | "delivered";
  createdAt: string;
  deliveredAt?: string;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  debt: number; // Borç (müşterinin bize olan borcu)
  credit: number; // Alacak (bizim müşteriye olan borcumuz)
  notes?: string;
  createdAt: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  type: "debt" | "credit" | "payment_received" | "payment_made";
  amount: number;
  description: string;
  createdAt: string;
}

export interface PhoneSale {
  id: string;
  brand: string;
  model: string;
  imei: string;
  purchasePrice: number;
  salePrice: number;
  profit: number;
  customerName: string;
  customerPhone: string;
  notes: string;
  date: string;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
}

export interface PhoneStock {
  id: string;
  brand: string;
  model: string;
  imei: string;
  purchasePrice: number;
  salePrice: number;
  notes: string;
  status: 'in_stock' | 'sold';
  createdAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
}

export interface CustomerRequest {
  id: string;
  customerName: string;
  phoneNumber: string;
  productName: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'completed';
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

  async searchProducts(query: string): Promise<Product[]> {
    const result = await fetchAPI(`/products/search?q=${encodeURIComponent(query)}`);
    return result.data || [];
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

  async updateSale(id: string, sale: Sale): Promise<Sale> {
    const result = await fetchAPI(`/sales/${id}`, {
      method: "PUT",
      body: JSON.stringify(sale),
    });
    return result.data;
  },

  async deleteSale(id: string): Promise<void> {
    await fetchAPI(`/sales/${id}`, {
      method: "DELETE",
    });
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

  async updateRepairStatus(id: string, status: "in_progress" | "completed" | "delivered"): Promise<RepairRecord> {
    const result = await fetchAPI(`/repairs/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return result.data;
  },

  async updateRepair(id: string, repair: Partial<RepairRecord>): Promise<RepairRecord> {
    const result = await fetchAPI(`/repairs/${id}`, {
      method: "PUT",
      body: JSON.stringify(repair),
    });
    return result.data;
  },

  async deleteRepair(id: string): Promise<void> {
    await fetchAPI(`/repairs/${id}`, {
      method: "DELETE",
    });
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const result = await fetchAPI("/customers");
    return result.data || [];
  },

  async addCustomer(customer: Omit<Customer, "id">): Promise<Customer> {
    const result = await fetchAPI("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });
    return result.data;
  },

  async updateCustomer(id: string, customer: Customer): Promise<Customer> {
    const result = await fetchAPI(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    });
    return result.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await fetchAPI(`/customers/${id}`, {
      method: "DELETE",
    });
  },

  async addCustomerTransaction(
    customerId: string,
    type: "debt" | "credit" | "payment_received" | "payment_made",
    amount: number,
    description: string
  ): Promise<void> {
    await fetchAPI("/customer-transactions", {
      method: "POST",
      body: JSON.stringify({ customerId, type, amount, description }),
    });
  },

  async getCustomerTransactions(): Promise<CustomerTransaction[]> {
    const result = await fetchAPI("/customer-transactions");
    return result.data || [];
  },

  // WhatsApp Bot
  async initWhatsAppSession(): Promise<{ sessionId: string }> {
    const result = await fetchAPI("/whatsapp/init", {
      method: "POST",
    });
    return result.data;
  },

  async authenticateWhatsApp(sessionId: string, phoneNumber: string): Promise<any> {
    const result = await fetchAPI("/whatsapp/authenticate", {
      method: "POST",
      body: JSON.stringify({ sessionId, phoneNumber }),
    });
    return result.data;
  },

  async getWhatsAppSession(sessionId: string): Promise<any> {
    const result = await fetchAPI(`/whatsapp/session/${sessionId}`);
    return result.data;
  },

  async disconnectWhatsApp(sessionId: string): Promise<void> {
    await fetchAPI("/whatsapp/disconnect", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  },

  async sendWhatsAppMessage(sessionId: string, from: string, message: string): Promise<{ message: string; resultsCount: number }> {
    const result = await fetchAPI("/whatsapp/webhook", {
      method: "POST",
      body: JSON.stringify({ sessionId, from, message }),
    });
    return result.data;
  },

  async getWhatsAppStats(sessionId: string): Promise<{ totalSearches: number; totalResults: number; recentSearches: any[] }> {
    const result = await fetchAPI(`/whatsapp/stats/${sessionId}`);
    return result.data;
  },

  // Phone Sales
  async getPhoneSales(): Promise<PhoneSale[]> {
    const result = await fetchAPI("/phone-sales");
    return result.data || [];
  },

  async addPhoneSale(phoneSale: Omit<PhoneSale, "id">): Promise<PhoneSale> {
    const result = await fetchAPI("/phone-sales", {
      method: "POST",
      body: JSON.stringify(phoneSale),
    });
    return result.data;
  },

  async updatePhoneSale(id: string, phoneSale: PhoneSale): Promise<PhoneSale> {
    const result = await fetchAPI(`/phone-sales/${id}`, {
      method: "PUT",
      body: JSON.stringify(phoneSale),
    });
    return result.data;
  },

  async deletePhoneSale(id: string): Promise<void> {
    await fetchAPI(`/phone-sales/${id}`, {
      method: "DELETE",
    });
  },

  // Phone Stocks
  async getPhoneStocks(): Promise<PhoneStock[]> {
    const result = await fetchAPI("/phone-stocks");
    return result.data || [];
  },

  async addPhoneStock(phoneStock: Omit<PhoneStock, "id">): Promise<PhoneStock> {
    const result = await fetchAPI("/phone-stocks", {
      method: "POST",
      body: JSON.stringify(phoneStock),
    });
    return result.data;
  },

  async updatePhoneStock(id: string, phoneStock: Partial<PhoneStock>): Promise<PhoneStock> {
    const result = await fetchAPI(`/phone-stocks/${id}`, {
      method: "PUT",
      body: JSON.stringify(phoneStock),
    });
    return result.data;
  },

  async deletePhoneStock(id: string): Promise<void> {
    await fetchAPI(`/phone-stocks/${id}`, {
      method: "DELETE",
    });
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const result = await fetchAPI("/expenses");
    return result.data || [];
  },

  async addExpense(expense: Omit<Expense, "id">): Promise<Expense> {
    const result = await fetchAPI("/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
    return result.data;
  },

  async updateExpense(id: string, expense: Expense): Promise<Expense> {
    const result = await fetchAPI(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    });
    return result.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await fetchAPI(`/expenses/${id}`, {
      method: "DELETE",
    });
  },

  // Customer Requests
  async getCustomerRequests(): Promise<CustomerRequest[]> {
    const result = await fetchAPI("/customer-requests");
    return result.data || [];
  },

  async addCustomerRequest(request: Omit<CustomerRequest, "id">): Promise<CustomerRequest> {
    const result = await fetchAPI("/customer-requests", {
      method: "POST",
      body: JSON.stringify(request),
    });
    return result.data;
  },

  async updateCustomerRequest(id: string, request: CustomerRequest): Promise<CustomerRequest> {
    const result = await fetchAPI(`/customer-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
    return result.data;
  },

  async deleteCustomerRequest(id: string): Promise<void> {
    await fetchAPI(`/customer-requests/${id}`, {
      method: "DELETE",
    });
  },
};