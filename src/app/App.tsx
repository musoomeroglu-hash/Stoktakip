// Vercel deployment trigger
import { useState, useEffect, useMemo, useRef } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { RepairsView } from "./components/RepairsView";
import { PhoneSalesView } from "./components/PhoneSalesView";
import { PhoneStockDialog } from "./components/PhoneStockDialog";
import { SalesPanelView } from "./components/SalesPanelView";
import { SalesManagementView } from "./components/SalesManagementView";
import { CategoryManagementDialog } from "./components/CategoryManagementDialog";
import { StockValueDialog } from "./components/StockValueDialog";
import { CalculatorView } from "./components/CalculatorView";
import { CariView } from "./components/CariView";
import { CustomerRequestsView } from "./components/CustomerRequestsView";
import { ExpensesView } from "./components/ExpensesView";
import { WhatsAppBotPro } from "./components/WhatsAppBotPro";
import { CategoryDialog } from "./components/CategoryDialog";
import { ProductDialog } from "./components/ProductDialog";
import { ProductDetailDialog } from "./components/ProductDetailDialog";
import { SalesDialog } from "./components/SalesDialog";
import { BulkUploadDialog } from "./components/BulkUploadDialog";
import { SalesTypeDialog } from "./components/SalesTypeDialog";
import { RepairDialog } from "./components/RepairDialog";
import { PhoneSaleDialog } from "./components/PhoneSaleDialog";
import type { PhoneSale, PhoneStock } from "./utils/api";
import { CashRegisterWidget } from "./components/CashRegisterWidget";
import { SalesAnalyticsView } from "./components/SalesAnalyticsView";
import { CustomerProfileView } from "./components/CustomerProfileView";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Checkbox } from "./components/ui/checkbox";
import { toast, Toaster } from "sonner";
import * as XLSX from "xlsx";
import { api, projectId, API_URL } from "./utils/api";
import type { Category, Product, Sale, SaleItem, RepairRecord, Customer, CustomerTransaction, PaymentMethod, PaymentDetails } from "./utils/api";
import { motion, AnimatePresence } from "motion/react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { IstatistikKartlari } from "./components/IstatistikKartlari";
import { StokTablosu } from "./components/StokTablosu";
import { StokFiltre } from "./components/StokFiltre";
import { StokBadge } from "./components/StokBadge";
import { StokAnalizDialog } from "./components/StokAnalizDialog";
import {
  Package,
  Plus,
  ShoppingCart,
  BarChart3,
  FolderTree,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Settings,
  User,
  Wrench,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  Calculator,
  ClipboardList,
  Receipt,
  Moon,
  Sun,
  LogOut,
  ArrowUpDown,
  Smartphone
} from "lucide-react";

// Success sound function using Web Audio API
const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create oscillator for first note
    const oscillator1 = audioContext.createOscillator();
    const gainNode1 = audioContext.createGain();

    oscillator1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);

    oscillator1.frequency.value = 800; // C note
    oscillator1.type = 'sine';

    gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator1.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.15);

    // Create oscillator for second note (higher)
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();

    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);

    oscillator2.frequency.value = 1000; // E note
    oscillator2.type = 'sine';

    gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
    gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator2.start(audioContext.currentTime + 0.1);
    oscillator2.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};

// Soft click sound for menu navigation
const playMenuSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 600; // Soft tone
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime); // Lower volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08); // Shorter duration

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch (error) {
    console.error("Error playing menu sound:", error);
  }
};

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is remembered
    const remembered = localStorage.getItem('technocep_auth');
    return remembered === 'true';
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [repairs, setRepairs] = useState<RepairRecord[]>([]);
  const [phoneSales, setPhoneSales] = useState<PhoneSale[]>([]);
  const [phoneStocks, setPhoneStocks] = useState<PhoneStock[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly" | "all">("monthly");
  const [activeView, setActiveView] = useState<"products" | "salesManagement" | "repairs" | "phoneSales" | "caris" | "calculator" | "requests" | "expenses" | "salesAnalytics" | "customers">("salesManagement");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryManagementOpen, setCategoryManagementOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [salesTypeOpen, setSalesTypeOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const [phoneSaleOpen, setPhoneSaleOpen] = useState(false);
  const [phoneStockOpen, setPhoneStockOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [stockValueDialogOpen, setStockValueDialogOpen] = useState(false);
  const [saleDetailOpen, setSaleDetailOpen] = useState(false);
  const [selectedSaleForDetail, setSelectedSaleForDetail] = useState<Sale | null>(null);
  const [stokAnalizOpen, setStokAnalizOpen] = useState(false);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [usdRate, setUsdRate] = useState<number>(0);
  const [currency, setCurrency] = useState<"TRY" | "USD">(() => {
    // Check localStorage for saved currency preference
    const savedCurrency = localStorage.getItem('currency');
    return (savedCurrency === 'USD' ? 'USD' : 'TRY') as "TRY" | "USD";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isPrivacyMode, setIsPrivacyMode] = useState(true);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // 🧹 Cleanup stale Supabase sessions in LocalStorage
    console.log("🧹 Tarayıcı oturumları kontrol ediliyor...");
    try {
      const keys = Object.keys(localStorage);
      const staleKeys = keys.filter(key =>
        (key.startsWith('sb-') && !key.includes(projectId)) ||
        key.includes('supabase.auth.token')
      );

      if (staleKeys.length > 0) {
        console.warn(`⚠️ ${staleKeys.length} adet eski oturum anahtarı bulundu, temizleniyor:`, staleKeys);
        staleKeys.forEach(key => localStorage.removeItem(key));
        console.log("✅ Eski oturumlar temizlendi.");
      }
    } catch (e) {
      console.error("LocalStorage temizleme hatası:", e);
    }

    // Initial data load
    loadData();
    fetchUsdRate();

    // Forced fallback timeout for early app interaction if network is slow
    const forcedTimeout = setTimeout(() => {
      setLoading(currentLoading => {
        if (currentLoading) {
          console.warn("⚠️ Forced loading timeout triggered after 15s - unlocking UI");
          return false;
        }
        return false;
      });
    }, 15000);

    return () => clearTimeout(forcedTimeout);
  }, []); // Run only once on mount

  useEffect(() => {
    // Update USD rate every hour
    const interval = setInterval(fetchUsdRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔵 Veriler yükleniyor (Mount)...");

      const startTime = Date.now();

      // Parallel fetch with individual error catching for logging
      const fetchCategories = async () => {
        console.log("  ⏳ Kategoriler çekiliyor...");
        const data = await api.getCategories();
        console.log(`  ✅ Kategoriler yüklendi (${data.length})`);
        return data;
      };

      const fetchProducts = async () => {
        console.log("  ⏳ Ürünler çekiliyor...");
        const data = await api.getProducts();
        console.log(`  ✅ Ürünler yüklendi (${data.length})`);
        return data;
      };

      const fetchSales = async () => {
        console.log("  ⏳ Satışlar çekiliyor...");
        const data = await api.getSales();
        console.log(`  ✅ Satışlar yüklendi (${data.length})`);
        return data;
      };

      const [categoriesData, productsData, salesData, repairsData, customersData, customerTransactionsData, phoneSalesData, phoneStocksData] = await Promise.all([
        fetchCategories().catch(err => { console.error("❌ Categories fetch failed:", err); return []; }),
        fetchProducts().catch(err => { console.error("❌ Products fetch failed:", err); return []; }),
        fetchSales().catch(err => { console.error("❌ Sales fetch failed:", err); return []; }),
        api.getRepairs().catch(err => { console.error("❌ Repairs fetch failed:", err); return []; }),
        api.getCustomers().catch(err => { console.error("❌ Customers fetch failed:", err); return []; }),
        api.getCustomerTransactions().catch(err => { console.error("❌ Transactions fetch failed:", err); return []; }),
        api.getPhoneSales().catch(err => { console.error("❌ PhoneSales fetch failed:", err); return []; }),
        api.getPhoneStocks().catch(err => { console.error("❌ PhoneStocks fetch failed:", err); return []; }),
      ]);

      const duration = (Date.now() - startTime) / 1000;
      console.log(`✅ Tüm veriler ${duration.toFixed(2)}sn içinde yüklendi`);

      setCategories(categoriesData);
      setProducts(productsData);
      setSales(salesData);
      setRepairs(repairsData);
      setCustomers(customersData);
      setCustomerTransactions(customerTransactionsData);
      setPhoneSales(phoneSalesData);
      setPhoneStocks(phoneStocksData);

    } catch (error: any) {
      console.error("❌ Error loading data:", error);
      setError(error.message || "Veriler yüklenirken bir hata oluştu");
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsdRate = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await response.json();
      const tryRate = data.rates.TRY;
      setUsdRate(tryRate); // 1 USD = X TRY
      console.log("USD/TRY Kuru:", tryRate);
    } catch (error) {
      console.error("Error fetching USD rate:", error);
      // Fallback rate
      setUsdRate(35); // Yaklaşık değer
      toast.error("USD kuru alınamadı, varsayılan kur kullanılıyor");
    }
  };

  // Get all unique customers from sales, repairs, and phone sales
  const getAllUniqueCustomers = (): Customer[] => {
    const customerMap = new Map<string, Customer>();

    // Add existing customers
    customers.forEach(customer => {
      customerMap.set(customer.phone, customer);
    });

    // From sales
    sales.forEach(sale => {
      if (sale.customerInfo && !customerMap.has(sale.customerInfo.phone)) {
        customerMap.set(sale.customerInfo.phone, {
          id: `auto-${sale.customerInfo.phone}`,
          name: sale.customerInfo.name,
          phone: sale.customerInfo.phone,
          email: "",
          debt: 0,
          credit: 0,
          notes: "",
          createdAt: sale.date,
        });
      }
    });

    // From repairs
    repairs.forEach(repair => {
      if (repair.customerPhone && !customerMap.has(repair.customerPhone)) {
        customerMap.set(repair.customerPhone, {
          id: `auto-${repair.customerPhone}`,
          name: repair.customerName,
          phone: repair.customerPhone,
          email: "",
          debt: 0,
          credit: 0,
          notes: "",
          createdAt: repair.createdAt,
        });
      }
    });

    // From phone sales
    phoneSales.forEach(phoneSale => {
      if (phoneSale.customerPhone && !customerMap.has(phoneSale.customerPhone)) {
        customerMap.set(phoneSale.customerPhone, {
          id: `auto-${phoneSale.customerPhone}`,
          name: phoneSale.customerName,
          phone: phoneSale.customerPhone,
          email: "",
          debt: 0,
          credit: 0,
          notes: "",
          createdAt: phoneSale.date,
        });
      }
    });

    return Array.from(customerMap.values());
  };

  const allUniqueCustomers = getAllUniqueCustomers();

  // Category handlers
  const handleAddCategory = async (category: Omit<Category, "id">) => {
    try {
      const newCategory = await api.addCategory(category);
      setCategories([...categories, newCategory]);
      toast.success("Kategori eklendi");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Kategori eklenirken hata oluştu");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const hasProducts = products.some((p) => p.categoryId === id);
    const hasSubCategories = categories.some((c) => c.parentId === id);

    if (hasProducts) {
      toast.error("Bu kategoride ürünler var, önce onları silin");
      return;
    }

    if (hasSubCategories) {
      toast.error("Bu kategorinin alt kategorileri var, önce onları silin");
      return;
    }

    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Kategori silindi");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Kategori silinirken hata oluştu");
    }
  };

  // Product handlers
  const handleSaveProduct = async (product: Omit<Product, "id"> | Product) => {
    try {
      if ("id" in product) {
        const updated = await api.updateProduct(product.id, product);
        setProducts(products.map((p) => (p.id === product.id ? updated : p)));
        toast.success("Ürün güncellendi");
      } else {
        const newProduct = await api.addProduct(product);
        setProducts([...products, newProduct]);
        toast.success("Ürün eklendi");
      }
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Ürün kaydedilirken hata oluştu");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Ürün silindi");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Ürün silinirken hata oluştu");
    }
  };

  // Sale handler
  const handleCompleteSale = async (
    items: SaleItem[],
    totalPrice: number,
    totalProfit: number,
    paymentMethod?: PaymentMethod,
    paymentDetails?: PaymentDetails,
    customerInfo?: { name: string; phone: string }
  ) => {
    try {
      const sale: Omit<Sale, "id"> = {
        items,
        totalPrice,
        totalProfit,
        date: new Date().toISOString(),
        paymentMethod,
        paymentDetails,
        customerInfo: customerInfo && customerInfo.name && customerInfo.phone ? customerInfo : undefined,
      };

      const newSale = await api.addSale(sale);
      setSales([newSale, ...sales]);

      // Refresh products to get updated stock
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);

      // Play success sound
      playSuccessSound();
      toast.success("Satış tamamlandı!");
    } catch (error) {
      console.error("Error completing sale:", error);
      toast.error("Satış kaydedilirken hata oluştu");
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!window.confirm("Bu satışı silmek istediğinize emin misiniz?")) return;

    try {
      // Check if this sale is related to a repair
      const sale = sales.find(s => s.id === id);
      if (sale && sale.items.length > 0) {
        const repairItem = sale.items[0];
        if (repairItem.productId && repairItem.productId.startsWith("repair-")) {
          // Extract repair ID
          const repairId = repairItem.productId.replace("repair-", "");

          // Revert repair status to completed
          const repair = repairs.find(r => r.id === repairId);
          if (repair && repair.status === "delivered") {
            await api.updateRepairStatus(repairId, "completed");
            const updatedRepairs = await api.getRepairs();
            setRepairs(updatedRepairs);
          }
        }
      }

      await api.deleteSale(id);
      setSales(sales.filter((s) => s.id !== id));

      // Refresh products to update stock
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);

      toast.success("Satış silindi ve stoklar güncellendi");
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Satış silinirken hata oluştu");
    }
  };

  const handleUpdateSale = async (id: string, sale: Sale) => {
    try {
      const updated = await api.updateSale(id, sale);
      setSales(sales.map((s) => (s.id === id ? updated : s)));
      toast.success("Satış güncellendi");
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.error("Satış güncellenirken hata oluştu");
    }
  };

  // Filtering and Sorting
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryId ? product.categoryId === selectedCategoryId : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, 'tr');
      } else if (sortBy === "stock") {
        // Sort by stock (ascending - lowest to highest)
        return a.stock - b.stock;
      } else {
        // Sort by sale price
        return b.salePrice - a.salePrice;
      }
    });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return "Bilinmeyen";

    if (category.parentId) {
      const parent = categories.find((c) => c.id === category.parentId);
      return parent ? `${parent.name} > ${category.name}` : category.name;
    }

    return category.name;
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle currency
  const toggleCurrency = () => {
    const newCurrency = currency === "TRY" ? "USD" : "TRY";
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    toast.success(`Para birimi ${newCurrency === "TRY" ? "₺ TL" : "$ USD"} olarak değiştirildi`);
  };

  // Format price based on currency
  const formatPrice = (price: number) => {
    if (currency === "USD") {
      if (usdRate <= 0) {
        return `$--.--`; // Dolar kuru yüklenene kadar
      }
      const usdValue = price / usdRate;
      return `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Excel Export
  const handleExportToExcel = () => {
    try {
      const exportData = products.map((product) => ({
        "Ürün Adı": product.name,
        "Kategori": getCategoryName(product.categoryId),
        "Barkod": product.barcode || "",
        "Stok": product.stock,
        "Min Stok": product.minStock,
        "Alış Fiyatı": product.purchasePrice,
        "Satış Fiyatı": product.salePrice,
        "Kâr Marjı": product.salePrice - product.purchasePrice,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

      XLSX.writeFile(wb, `urunler_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Excel dosyası indirildi");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Excel dosyası oluşturulamadı");
    }
  };

  // Excel Import
  const handleImportFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<{
          "Ürün Adı": string;
          "Kategori": string;
          "Barkod"?: string;
          "Stok": number;
          "Min Stok": number;
          "Alış Fiyatı": number;
          "Satış Fiyatı": number;
        }>(worksheet);

        // Filter out empty rows
        const validRows = jsonData.filter(row =>
          row["Ürün Adı"] &&
          row["Ürün Adı"].toString().trim() !== "" &&
          row["Kategori"] &&
          row["Kategori"].toString().trim() !== "" &&
          typeof row["Stok"] === "number" &&
          typeof row["Alış Fiyatı"] === "number" &&
          typeof row["Satış Fiyatı"] === "number"
        );

        console.log(`Excel'den okunan toplam satır: ${jsonData.length}`);
        console.log(`Geçerli satır sayısı: ${validRows.length}`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const row of validRows) {
          try {
            // Find existing product by name or barcode
            const existingProduct = products.find(
              (p) => p.name === row["Ürün Adı"] || (row["Barkod"] && p.barcode === row["Barkod"])
            );

            if (existingProduct) {
              // Update prices
              await api.updateProduct(existingProduct.id, {
                ...existingProduct,
                purchasePrice: row["Alış Fiyatı"],
                salePrice: row["Satış Fiyatı"],
                stock: row["Stok"],
                minStock: row["Min Stok"],
              });
              updatedCount++;
            }
          } catch (error) {
            console.error(`Error updating product ${row["Ürün Adı"]}:`, error);
            errorCount++;
          }
        }

        // Refresh products
        const updatedProducts = await api.getProducts();
        setProducts(updatedProducts);

        if (updatedCount > 0) {
          toast.success(`${updatedCount} ürün güncellendi`);
        }
        if (errorCount > 0) {
          toast.error(`${errorCount} ürün güncellenemedi`);
        }
        if (validRows.length === 0) {
          toast.error("Excel'de geçerli ürün bulunamadı");
        }
      } catch (error) {
        console.error("Excel import error:", error);
        toast.error("Excel dosyası okunamadı");
      }
    };

    reader.readAsArrayBuffer(file);
    // Reset input
    event.target.value = "";
  };

  // Bulk product upload handler
  const handleBulkAdd = async (products: Omit<Product, "id">[]) => {
    try {
      const added = await api.bulkImportProducts(products);
      setProducts([...products, ...added]);
      toast.success(`${added.length} ürün eklendi`);
    } catch (error) {
      console.error("Bulk add error:", error);
      toast.error("Toplu ürün eklenirken hata oluştu");
    }
  };

  // Handle repair
  const handleAddRepair = async (repair: Omit<RepairRecord, "id">) => {
    try {
      const newRepair = await api.addRepair(repair);
      setRepairs([newRepair, ...repairs]);
      toast.success("Tamir kaydı oluşturuldu!");
    } catch (error) {
      console.error("Repair add error:", error);
      toast.error("Tamir kaydı oluşturulamadı");
    }
  };

  // Handle repair status update
  const handleUpdateRepairStatus = async (id: string, status: "in_progress" | "completed" | "delivered") => {
    try {
      const updated = await api.updateRepairStatus(id, status);

      // If delivered, add to sales
      if (status === "delivered") {
        const sale: Omit<Sale, "id"> = {
          items: [{
            productId: "repair-" + id,
            productName: `Tamir: ${updated.deviceInfo}`,
            quantity: 1,
            salePrice: updated.repairCost,
            purchasePrice: updated.partsCost,
            profit: updated.profit,
          }],
          totalPrice: updated.repairCost,
          totalProfit: updated.profit,
          date: new Date().toISOString(),
          paymentMethod: updated.paymentMethod,
          paymentDetails: updated.paymentDetails,
          customerInfo: {
            name: updated.customerName,
            phone: updated.customerPhone,
          },
        };

        await api.addSale(sale);
        const updatedSales = await api.getSales();
        setSales(updatedSales);
      }

      const updatedRepairs = repairs.map((r) => (r.id === id ? updated : r));
      setRepairs(updatedRepairs);

      toast.success("Tamir durumu güncellendi");
      playSuccessSound();
    } catch (error) {
      console.error("Repair status update error:", error);
      toast.error("Tamir durumu güncellenemedi");
    }
  };

  const handleAddPhoneStock = async (stock: Omit<PhoneStock, "id" | "createdAt" | "status">) => {
    try {
      const newStock = await api.addPhoneStock({
        ...stock,
        status: 'in_stock',
        createdAt: new Date().toISOString()
      });
      setPhoneStocks([newStock, ...phoneStocks]);
    } catch (error) {
      console.error("Error adding phone stock:", error);
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast.error(`Stok eklenirken hata oluştu: ${message}`);
    }
  };

  const handleDeletePhoneStock = async (id: string) => {
    if (!window.confirm("Bu stok kaydını silmek istediğinize emin misiniz?")) return;
    try {
      await api.deletePhoneStock(id);
      setPhoneStocks(phoneStocks.filter(s => s.id !== id));
      toast.success("Stok kaydı silindi");
    } catch (error) {
      console.error("Error deleting phone stock:", error);
      toast.error("Stok silinirken hata oluştu");
    }
  };

  // Handle phone sale
  const handleAddPhoneSale = async (phoneSale: PhoneSale) => {
    try {
      console.log("📱 Telefon satışı ekleniyor...", phoneSale);
      const newPhoneSale = await api.addPhoneSale(phoneSale);
      const updatedPhoneSales = [newPhoneSale, ...phoneSales];
      setPhoneSales(updatedPhoneSales);
      console.log("✅ Telefon satışı Supabase'e kaydedildi. Toplam:", updatedPhoneSales.length);
      console.log("📱 Kaydedilen satış:", newPhoneSale);
      playSuccessSound();
      toast.success("Telefon satışı başarıyla kaydedildi ve Telefon Satışları görünümünde görüntülenebilir!");
    } catch (error) {
      console.error("❌ Telefon satışı kaydedilemedi:", error);
      toast.error("Telefon satışı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleDeletePhoneSale = async (id: string) => {
    if (!window.confirm("Bu telefon satışını silmek istediğinize emin misiniz?")) return;

    try {
      await api.deletePhoneSale(id);
      const updatedPhoneSales = phoneSales.filter((ps) => ps.id !== id);
      setPhoneSales(updatedPhoneSales);
      console.log("✅ Telefon satışı Supabase'den silindi. Kalan:", updatedPhoneSales.length);
      toast.success("Telefon satışı silindi");
    } catch (error) {
      console.error("❌ Telefon satışı silinemedi:", error);
      toast.error("Telefon satışı silinemedi");
    }
  };

  const handleUpdatePhoneSale = async (id: string, phoneSale: PhoneSale) => {
    try {
      const updated = await api.updatePhoneSale(id, phoneSale);
      const updatedPhoneSales = phoneSales.map((ps) => (ps.id === id ? updated : ps));
      setPhoneSales(updatedPhoneSales);
      toast.success("Telefon satışı güncellendi");
    } catch (error) {
      console.error("❌ Telefon satışı güncellenemedi:", error);
      toast.error("Telefon satışı güncellenemedi");
    }
  };

  // Handle repair update
  const handleUpdateRepair = async (id: string, data: Partial<RepairRecord>) => {
    try {
      const updated = await api.updateRepair(id, data);
      setRepairs(repairs.map((r) => (r.id === id ? updated : r)));
      toast.success("Tamir güncellendi");
    } catch (error) {
      console.error("Error updating repair:", error);
      toast.error("Tamir güncellenemedi");
    }
  };

  const handleDeleteRepair = async (id: string) => {
    if (!window.confirm("Bu tamir kaydını silmek istediğinize emin misiniz?")) return;
    try {
      await api.deleteRepair(id);
      setRepairs(repairs.filter((r) => r.id !== id));
      toast.success("Tamir kaydı silindi");
    } catch (error) {
      console.error("Error deleting repair:", error);
      toast.error("Tamir kaydı silinemedi");
    }
  };

  // Handle sales type selection
  const handleSalesTypeSelect = (type: "sale" | "repair" | "phone") => {
    if (type === "sale") {
      setSalesDialogOpen(true);
    } else if (type === "repair") {
      setRepairOpen(true);
    } else if (type === "phone") {
      setPhoneSaleOpen(true);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Lütfen silinecek ürünleri seçin");
      return;
    }

    if (!window.confirm(`${selectedProducts.size} ürünü silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      let deletedCount = 0;
      let errorCount = 0;

      for (const productId of selectedProducts) {
        try {
          await api.deleteProduct(productId);
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting product ${productId}:`, error);
          errorCount++;
        }
      }

      // Refresh products
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
      setSelectedProducts(new Set());

      if (deletedCount > 0) {
        toast.success(`${deletedCount} ürün silindi`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} ürün silinemedi`);
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Toplu silme işlemi başarısız oldu");
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Toggle all products selection
  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Customer handlers
  const handleAddCustomer = async (customer: Omit<Customer, "id">) => {
    try {
      const newCustomer = await api.addCustomer(customer);
      setCustomers([...customers, newCustomer]);
      toast.success("Cari eklendi");
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("Cari eklenirken hata oluştu");
    }
  };

  const handleUpdateCustomer = async (id: string, customer: Customer) => {
    try {
      const updated = await api.updateCustomer(id, customer);
      setCustomers(customers.map((c) => (c.id === id ? updated : c)));
      toast.success("Cari güncellendi");
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Cari güncellenirken hata oluştu");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm("Bu cari kaydını silmek istediğinize emin misiniz?")) return;

    try {
      await api.deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
      toast.success("Cari silindi");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Cari silinirken hata oluştu");
    }
  };

  const handleAddCustomerTransaction = async (
    customerId: string,
    type: "debt" | "credit" | "payment_received" | "payment_made",
    amount: number,
    description: string
  ) => {
    try {
      await api.addCustomerTransaction(customerId, type, amount, description);

      // Refresh customers and transactions
      const [updatedCustomers, updatedTransactions] = await Promise.all([
        api.getCustomers(),
        api.getCustomerTransactions(),
      ]);
      setCustomers(updatedCustomers);
      setCustomerTransactions(updatedTransactions);

      toast.success("İşlem eklendi");
    } catch (error) {
      console.error("Error adding customer transaction:", error);
      toast.error("İşlem eklenirken hata oluştu");
    }
  };

  // Handle login
  const handleLogin = (rememberMe: boolean) => {
    setIsAuthenticated(true);
    if (rememberMe) {
      localStorage.setItem('technocep_auth', 'true');
    } else {
      sessionStorage.setItem('technocep_session', 'true');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('technocep_auth');
    sessionStorage.removeItem('technocep_session');
    toast.success("Çıkış yapıldı");
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);

  // Function to get stock color based on stock level
  const getStockColor = (stock: number) => {
    if (sortBy !== "stock" || filteredProducts.length === 0) return "";

    // Find min and max stock values for gradient
    const stockValues = filteredProducts.map(p => p.stock);
    const minStock = Math.min(...stockValues);
    const maxStock = Math.max(...stockValues);

    // Avoid division by zero
    if (minStock === maxStock) {
      return "bg-yellow-100 dark:bg-yellow-900/30";
    }

    // Normalize stock value between 0 and 1
    const normalized = (stock - minStock) / (maxStock - minStock);

    // Create color gradient from red (low) to light green (high)
    if (normalized < 0.2) {
      return "bg-red-100 dark:bg-red-900/40"; // Darkest red
    } else if (normalized < 0.4) {
      return "bg-orange-100 dark:bg-orange-900/40";
    } else if (normalized < 0.6) {
      return "bg-yellow-100 dark:bg-yellow-900/40";
    } else if (normalized < 0.8) {
      return "bg-lime-100 dark:bg-lime-900/40";
    } else {
      return "bg-green-50 dark:bg-green-900/20"; // Lightest green
    }
  };

  // Function to get stock badge color
  const getStockBadgeColor = (stock: number, isLowStock: boolean): "destructive" | "secondary" | "outline" => {
    if (sortBy !== "stock" || filteredProducts.length === 0) {
      return isLowStock ? "destructive" : "secondary";
    }

    // Find min and max stock values for gradient
    const stockValues = filteredProducts.map(p => p.stock);
    const minStock = Math.min(...stockValues);
    const maxStock = Math.max(...stockValues);

    // Avoid division by zero
    if (minStock === maxStock) {
      return "secondary";
    }

    // Normalize stock value between 0 and 1
    const normalized = (stock - minStock) / (maxStock - minStock);

    // Return appropriate badge variant based on stock level
    if (normalized < 0.2) {
      return "destructive"; // Red
    } else if (normalized < 0.6) {
      return "outline"; // Yellow/Orange
    } else {
      return "secondary"; // Green
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium animate-pulse">Yükleniyor...</p>
        <p className="text-sm text-muted-foreground mt-2">Lütfen bekleyin, veriler sunucudan çekiliyor.</p>
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border text-[10px] font-mono opacity-50">
          <p>Project: {projectId}</p>
          <p>Status: Connecting to Supabase Edge...</p>
        </div>
      </div>
    );
  }

  if (error && (categories.length === 0 && products.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <div className="bg-destructive/10 p-6 rounded-full mb-6">
          <Package className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bağlantı Hatası</h2>
        <p className="text-muted-foreground max-w-md mb-2">
          {error}
        </p>

        <div className="mb-6 p-3 bg-destructive/5 rounded border text-xs font-mono text-left overflow-auto max-w-md mx-auto">
          <p className="font-bold border-b mb-1 pb-1">🔍 Diagnostik Bilgi:</p>
          <p>Project ID: <span className="text-blue-600 font-bold">{projectId}</span></p>
          <p className="break-all">API Endpoint: {API_URL}</p>
          <hr className="my-2 border-destructive/20" />
          <p className="text-[10px] text-muted-foreground italic">
            💡 Eğer yukarıdaki Project ID hatalıysa, Vercel paneline gidip Environment Variables kısmından projenizi güncelleyin.
          </p>
        </div>

        <Button onClick={() => loadData()} size="lg" className="gap-2">
          <Plus className="w-4 h-4 rotate-45" />
          Yeniden Dene
        </Button>
      </div>
    );
  }

  const mainCategories = categories.filter(c => !c.parentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Toaster position="top-right" />

      <SidebarProvider>
        <AppSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={handleLogout}
          onOpenCategoryManagement={() => setCategoryManagementOpen(true)}
        />
        <SidebarInset className="flex flex-col min-h-screen bg-slate-50/30 dark:bg-slate-950/50">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-10 transition-all duration-300">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 group-data-[collapsible=icon]:hidden" />
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {activeView === "products" ? "Stok Envanteri" :
                    activeView === "salesManagement" ? "Satış & Raporlar" :
                      activeView === "repairs" ? "Tamir Kayıtları" :
                        activeView === "phoneSales" ? "Telefon Satışları" :
                          activeView === "caris" ? "Cari Hesaplar" :
                            activeView === "salesAnalytics" ? "Satış Analitiği" :
                              activeView === "expenses" ? "Gider Takibi" :
                                activeView === "requests" ? "İstek & Siparişler" :
                                  activeView === "calculator" ? "Hesap Makinesi" :
                                    activeView === "customers" ? "Müşteri Profilleri" : "Dashboard"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-full p-1 border border-slate-200 dark:border-slate-800">
                <Button
                  variant={currency === "TRY" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCurrency("TRY")}
                  className={`h-7 px-3 rounded-full text-[10px] uppercase font-bold transition-all ${currency === "TRY" ? "shadow-sm" : "text-slate-500"}`}
                >
                  ₺ TL
                </Button>
                <Button
                  variant={currency === "USD" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCurrency("USD")}
                  className={`h-7 px-3 rounded-full text-[10px] uppercase font-bold transition-all ${currency === "USD" ? "shadow-sm" : "text-slate-500"}`}
                >
                  $ USD
                </Button>
              </div>

              {usdRate > 0 && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-full text-slate-600 dark:text-slate-400">
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
                    $ 1.00 = <span className="text-slate-900 dark:text-slate-100">₺{usdRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </span>
                </div>
              )}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className={`h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 transition-all ${isPrivacyMode ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900" : "hover:bg-slate-100 dark:hover:bg-slate-900"}`}
                title={isPrivacyMode ? "Gizlilik Modunu Kapat" : "Gizlilik Modunu Aç"}
              >
                {isPrivacyMode ? (
                  <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
              </Button>

              <Button
                onClick={() => setSalesTypeOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 gap-2 h-9 rounded-xl px-4 ml-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">İşlem Ekle</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {activeView === "products" ? (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <IstatistikKartlari
                    products={products}
                    sales={sales}
                    repairs={repairs}
                    phoneSales={phoneSales}
                    formatPrice={formatPrice}
                    onOpenAnalysis={() => setStokAnalizOpen(true)}
                    isPrivacyMode={isPrivacyMode}
                  />

                  {/* Kasa Durumu Widget */}
                  <CashRegisterWidget
                    sales={sales}
                    repairs={repairs}
                    phoneSales={phoneSales}
                    formatPrice={formatPrice}
                    isPrivacyMode={isPrivacyMode}
                  />

                  {/* Search and Quick Filters */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm transition-all duration-300">
                    <StokFiltre
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedCategoryId={selectedCategoryId}
                      onCategoryChange={setSelectedCategoryId}
                      categories={categories}
                    />

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCategoryDialogOpen(true)} className="h-10 rounded-lg border-blue-200 dark:border-blue-900 shadow-sm">
                        <FolderTree className="w-4 h-4 mr-2 text-blue-500" />
                        Kategori Ekle
                      </Button>
                      <Button onClick={() => setProductDialogOpen(true)} className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 shadow-lg px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Ürün Ekle
                      </Button>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        {selectedCategoryId
                          ? `${getCategoryName(selectedCategoryId)} - Ürünler`
                          : "Tüm Ürün Listesi"
                        }
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
                          {filteredProducts.length} adet
                        </span>
                      </h3>

                      <div className="flex gap-2">
                        <Button onClick={handleExportToExcel} variant="outline" size="sm" className="h-9 rounded-lg px-4 border-slate-200 dark:border-slate-800">
                          <Download className="w-4 h-4 mr-2 text-orange-500" />
                          Excel İndir
                        </Button>
                        {selectedProducts.size > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="h-9 px-4 rounded-lg shadow-lg shadow-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Seçili Sil ({selectedProducts.size})
                          </Button>
                        )}
                      </div>
                    </div>

                    <StokTablosu
                      products={filteredProducts}
                      categories={categories}
                      selectedProducts={selectedProducts}
                      onToggleSelection={toggleProductSelection}
                      onToggleAll={toggleAllProducts}
                      onEdit={(p) => {
                        setEditingProduct(p);
                        setProductDialogOpen(true);
                      }}
                      onDelete={handleDeleteProduct}
                      onViewDetail={(p) => {
                        setSelectedProductForDetail(p);
                        setProductDetailOpen(true);
                      }}
                      getCategoryName={getCategoryName}
                      formatPrice={formatPrice}
                      isPrivacyMode={isPrivacyMode}
                    />
                  </div>
                </motion.div>
              ) : activeView === "salesManagement" ? (
                // Satış & Raporlar Görünümü
                <motion.div
                  key="salesManagement"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Satış Raporları</h2>
                    <div className="flex gap-2">
                      <Button
                        variant={reportPeriod === "daily" ? "default" : "outline"}
                        onClick={() => setReportPeriod("daily")}
                      >
                        Günlük
                      </Button>
                      <Button
                        variant={reportPeriod === "weekly" ? "default" : "outline"}
                        onClick={() => setReportPeriod("weekly")}
                      >
                        Haftalık
                      </Button>
                      <Button
                        variant={reportPeriod === "monthly" ? "default" : "outline"}
                        onClick={() => setReportPeriod("monthly")}
                      >
                        Aylık
                      </Button>
                      <Button
                        variant={reportPeriod === "all" ? "default" : "outline"}
                        onClick={() => setReportPeriod("all")}
                      >
                        Tümü
                      </Button>
                    </div>
                  </div>

                  <SalesManagementView
                    sales={sales}
                    repairs={repairs}
                    phoneSales={phoneSales}
                    customers={customers}
                    customerTransactions={customerTransactions}
                    onDeleteSale={handleDeleteSale}
                    onUpdateSale={handleUpdateSale}
                    onUpdateRepair={handleUpdateRepair}
                    onDeleteRepair={handleDeleteRepair}
                    onDeletePhoneSale={handleDeletePhoneSale}
                    currency={currency}
                    usdRate={usdRate}
                    formatPrice={formatPrice}
                    isPrivacyMode={isPrivacyMode}
                  />
                </motion.div>
              ) : activeView === "repairs" ? (
                <motion.div
                  key="repairs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">Tamir Kayıtları</h2>
                  <RepairsView
                    repairs={repairs}
                    onUpdateStatus={handleUpdateRepairStatus}
                    onUpdateRepair={handleUpdateRepair}
                    onDeleteRepair={handleDeleteRepair}
                    currency={currency}
                    usdRate={usdRate}
                    formatPrice={formatPrice}
                    isPrivacyMode={isPrivacyMode}
                  />
                </motion.div>
              ) : activeView === "phoneSales" ? (
                // Telefon Satışları Görünümü
                <motion.div
                  key="phoneSales"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">Telefon Satışları</h2>
                  <PhoneSalesView
                    phoneSales={phoneSales}
                    phoneStocks={phoneStocks}
                    onDeletePhoneSale={handleDeletePhoneSale}
                    onDeletePhoneStock={handleDeletePhoneStock}
                    onAddPhoneStock={() => setPhoneStockOpen(true)}
                    isPrivacyMode={isPrivacyMode}
                  />
                </motion.div>
              ) : activeView === "caris" ? (
                <motion.div
                  key="caris"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">Cariler</h2>
                  <CariView
                    customers={customers}
                    onAddCustomer={handleAddCustomer}
                    onUpdateCustomer={handleUpdateCustomer}
                    onDeleteCustomer={handleDeleteCustomer}
                    onAddTransaction={handleAddCustomerTransaction}
                    isPrivacyMode={isPrivacyMode}
                  />
                </motion.div>
              ) : activeView === "calculator" ? (
                // Hesap Makinesi Görünümü
                <motion.div
                  key="calculator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">Hesap Makinesi</h2>
                  <CalculatorView usdRate={usdRate} />

                  {/* WhatsApp Bot - Professional QR Code Edition */}
                  <div className="mt-8">
                    <WhatsAppBotPro />
                  </div>
                </motion.div>
              ) : activeView === "requests" ? (
                // İstek & Siparişler Görünümü
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">İstek & Siparişler</h2>
                  <CustomerRequestsView />
                </motion.div>
              ) : activeView === "expenses" ? (
                // Giderler Görünümü
                <motion.div
                  key="expenses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold">Giderler</h2>
                  <ExpensesView
                    sales={sales}
                    repairs={repairs}
                    phoneSales={phoneSales}
                    isPrivacyMode={isPrivacyMode}
                  />
                </motion.div>
              ) : activeView === "salesAnalytics" ? (
                // Satış Analizi Görünümü
                <motion.div
                  key="salesAnalytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <SalesAnalyticsView
                    sales={sales}
                    products={products}
                    categories={categories}
                    formatPrice={formatPrice}
                    isPrivacyMode={isPrivacyMode}
                  />
                </motion.div>
              ) : activeView === "customers" ? (
                // Müşteri Profilleri Görünümü
                <motion.div
                  key="customers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <CustomerProfileView
                    sales={sales}
                    repairs={repairs}
                    phoneSales={phoneSales}
                    formatPrice={formatPrice}
                    onUpdateSale={handleUpdateSale}
                    onUpdateRepair={handleUpdateRepair}
                    onUpdatePhoneSale={handleUpdatePhoneSale}
                    isPrivacyMode={isPrivacyMode}
                  />
                </motion.div>
              ) : (
                // Satış Paneli Görünümü
                <motion.div
                  key="salesPanel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <SalesPanelView
                    sales={sales}
                    repairs={repairs}
                    categories={categories}
                    onDeleteSale={handleDeleteSale}
                    onUpdateRepair={handleUpdateRepair}
                    isPrivacyMode={isPrivacyMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onAdd={handleAddCategory}
        categories={categories}
      />

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={(open) => {
          setProductDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        categories={categories}
        editProduct={editingProduct}
      />

      <SalesDialog
        open={salesDialogOpen}
        onOpenChange={setSalesDialogOpen}
        onCompleteSale={handleCompleteSale}
        products={products}
        formatPrice={formatPrice}
        customers={allUniqueCustomers}
      />

      <CategoryManagementDialog
        open={categoryManagementOpen}
        onOpenChange={setCategoryManagementOpen}
        categories={categories}
        products={products}
        onDeleteCategory={handleDeleteCategory}
      />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        categories={categories}
        onBulkAdd={handleBulkAdd}
      />

      <SalesTypeDialog
        open={salesTypeOpen}
        onOpenChange={setSalesTypeOpen}
        onSelectType={handleSalesTypeSelect}
      />

      <RepairDialog
        open={repairOpen}
        onOpenChange={setRepairOpen}
        onSave={handleAddRepair}
        customers={allUniqueCustomers}
      />

      <PhoneSaleDialog
        open={phoneSaleOpen}
        onOpenChange={setPhoneSaleOpen}
        onSave={handleAddPhoneSale}
        customers={allUniqueCustomers}
      />

      <PhoneStockDialog
        open={phoneStockOpen}
        onOpenChange={setPhoneStockOpen}
        onSave={handleAddPhoneStock}
      />

      <StockValueDialog
        open={stockValueDialogOpen}
        onOpenChange={setStockValueDialogOpen}
        products={products}
        categories={categories}
      />

      <ProductDetailDialog
        open={productDetailOpen}
        onOpenChange={setProductDetailOpen}
        product={selectedProductForDetail}
        categories={categories}
        formatPrice={formatPrice}
      />
      {/* Stok Analiz Dialog */}
      <StokAnalizDialog
        open={stokAnalizOpen}
        onOpenChange={setStokAnalizOpen}
        products={products}
        categories={categories}
        formatPrice={formatPrice}
        isPrivacyMode={isPrivacyMode}
      />
    </div>
  );
}

export default App;