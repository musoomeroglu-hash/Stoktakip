import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { api, type Category, type Product, type Sale, type SaleItem, type RepairRecord, type Customer } from "./utils/api";
import * as XLSX from "xlsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Checkbox } from "./components/ui/checkbox";
import { CategoryDialog } from "./components/CategoryDialog";
import { ProductDialog } from "./components/ProductDialog";
import { BulkUploadDialog } from "./components/BulkUploadDialog";
import { SalesTypeDialog } from "./components/SalesTypeDialog";
import { RepairDialog } from "./components/RepairDialog";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { SalesDialog } from "./components/SalesDialog";
import { ReportsView } from "./components/ReportsView";
import { CariView } from "./components/CariView";
import { CategoryManagementDialog } from "./components/CategoryManagementDialog";
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
  User
} from "lucide-react";

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [activeView, setActiveView] = useState<"products" | "reports" | "caris">("products");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryManagementOpen, setCategoryManagementOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [salesTypeOpen, setSalesTypeOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData, salesData, customersData] = await Promise.all([
        api.getCategories().catch(() => []),
        api.getProducts().catch(() => []),
        api.getSales().catch(() => []),
        api.getCustomers().catch(() => []),
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
      setSales(salesData);
      setCustomers(customersData);

      // Initialize with sample data if empty
      if (categoriesData.length === 0) {
        const sampleCategories = [
          { name: "Elektronik", createdAt: new Date().toISOString() },
          { name: "Giyim", createdAt: new Date().toISOString() },
          { name: "Gıda", createdAt: new Date().toISOString() },
        ];
        
        for (const cat of sampleCategories) {
          await api.addCategory(cat);
        }
        
        const refreshedCategories = await api.getCategories();
        setCategories(refreshedCategories);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

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
  const handleCompleteSale = async (items: SaleItem[], totalPrice: number, totalProfit: number) => {
    try {
      const sale: Omit<Sale, "id"> = {
        items,
        totalPrice,
        totalProfit,
        date: new Date().toISOString(),
      };

      const newSale = await api.addSale(sale);
      setSales([newSale, ...sales]);

      // Refresh products to get updated stock
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);

      toast.success("Satış tamamlandı!");
    } catch (error) {
      console.error("Error completing sale:", error);
      toast.error("Satış kaydedilirken hata oluştu");
    }
  };

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryId ? product.categoryId === selectedCategoryId : true;
    return matchesSearch && matchesCategory;
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

        let updatedCount = 0;
        let errorCount = 0;

        for (const row of jsonData) {
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
      await api.addRepair(repair);
      toast.success("Tamir kaydı oluşturuldu!");
    } catch (error) {
      console.error("Repair add error:", error);
      toast.error("Tamir kaydı oluşturulamadı");
    }
  };

  // Handle sales type selection
  const handleSalesTypeSelect = (type: "sale" | "repair") => {
    if (type === "sale") {
      setSalesDialogOpen(true);
    } else {
      setRepairOpen(true);
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
      
      // Refresh customers
      const updatedCustomers = await api.getCustomers();
      setCustomers(updatedCustomers);
      
      toast.success("İşlem eklendi");
    } catch (error) {
      console.error("Error adding customer transaction:", error);
      toast.error("İşlem eklenirken hata oluştu");
    }
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const mainCategories = categories.filter(c => !c.parentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Stok Yönetim Sistemi</h1>
              <p className="text-sm text-muted-foreground">Profesyonel İşletme Yönetimi</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setCategoryDialogOpen(true)} variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950">
                <FolderTree className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Kategori</span>
              </Button>
              <Button onClick={() => setProductDialogOpen(true)} variant="outline" size="sm" className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ürün</span>
              </Button>
              <Button onClick={() => setBulkUploadOpen(true)} variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950">
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Toplu</span>
              </Button>
              <Button onClick={handleExportToExcel} variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">İndir</span>
              </Button>
              <label htmlFor="excel-upload">
                <Button variant="outline" size="sm" asChild className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Yükle</span>
                  </span>
                </Button>
              </label>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImportFromExcel}
              />
              <Button onClick={() => setSalesTypeOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Satış/Tamir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Kategoriler */}
        <aside className="w-full md:w-64 border-b md:border-r md:border-b-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm md:min-h-[calc(100vh-73px)] md:sticky md:top-[73px] shadow-sm">
          <div className="p-4 space-y-2 max-h-[300px] md:max-h-none overflow-y-auto">
            <div className="mb-4">
              <h2 className="font-semibold mb-2">KATEGORİLER</h2>
            </div>

            {/* Tüm Ürünler */}
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setActiveView("products");
              }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
                selectedCategoryId === null && activeView === "products" ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Tüm Ürünler</span>
                <Badge variant="secondary" className="ml-auto">{products.length}</Badge>
              </div>
            </button>

            <div className="border-t pt-2 mt-2" />

            {/* Ana Kategoriler & Alt Kategoriler */}
            {mainCategories.map((mainCat) => {
              const subCategories = categories.filter(c => c.parentId === mainCat.id);
              const hasSubCategories = subCategories.length > 0;
              const isExpanded = expandedCategories.has(mainCat.id);
              const mainCatProductCount = products.filter(p => p.categoryId === mainCat.id).length;
              const allProductCount = products.filter(p => 
                p.categoryId === mainCat.id || 
                subCategories.some(sub => sub.id === p.categoryId)
              ).length;

              return (
                <div key={mainCat.id} className="space-y-1">
                  {/* Ana Kategori */}
                  <div className="flex items-center gap-1">
                    {hasSubCategories && (
                      <button
                        onClick={() => toggleCategory(mainCat.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCategoryId(mainCat.id);
                        setActiveView("products");
                      }}
                      className={`flex-1 text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
                        !hasSubCategories ? "ml-6" : ""
                      } ${
                        selectedCategoryId === mainCat.id ? "bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderTree className="w-4 h-4" />
                          <span className="text-sm">{mainCat.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {hasSubCategories ? allProductCount : mainCatProductCount}
                        </Badge>
                      </div>
                    </button>
                  </div>

                  {/* Alt Kategoriler */}
                  {hasSubCategories && isExpanded && (
                    <div className="ml-6 space-y-1">
                      {subCategories.map((subCat) => {
                        const subProductCount = products.filter(p => p.categoryId === subCat.id).length;
                        return (
                          <button
                            key={subCat.id}
                            onClick={() => {
                              setSelectedCategoryId(subCat.id);
                              setActiveView("products");
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
                              selectedCategoryId === subCat.id ? "bg-primary text-primary-foreground" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">→ {subCat.name}</span>
                              <Badge variant="outline" className="text-xs">{subProductCount}</Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="border-t pt-2 mt-4" />

            {/* Kategori Yönetimi */}
            <button
              onClick={() => setCategoryManagementOpen(true)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Kategori Yönetimi</span>
              </div>
            </button>

            {/* Raporlar */}
            <button
              onClick={() => setActiveView("reports")}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
                activeView === "reports" ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Raporlar</span>
              </div>
            </button>

            {/* Cariler */}
            <button
              onClick={() => setActiveView("caris")}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
                activeView === "caris" ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Cariler</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Ana İçerik */}
        <main className="flex-1 p-6">
          {activeView === "products" ? (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Toplam Ürün</p>
                        <p className="text-2xl font-semibold text-blue-900 dark:text-blue-100">{products.length}</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-300">Stok Değeri</p>
                        <p className="text-2xl font-semibold text-green-900 dark:text-green-100">₺{totalInventoryValue.toLocaleString('tr-TR')}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700 dark:text-orange-300">Düşük Stok</p>
                        <p className="text-2xl font-semibold text-orange-900 dark:text-orange-100">{lowStockProducts.length}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Kategoriler</p>
                        <p className="text-2xl font-semibold text-purple-900 dark:text-purple-100">{categories.length}</p>
                      </div>
                      <FolderTree className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün veya barkod ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Products Table */}
              <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {selectedCategoryId 
                        ? `${getCategoryName(selectedCategoryId)} - Ürünler (${filteredProducts.length})`
                        : `Tüm Ürünler (${filteredProducts.length})`
                      }
                    </CardTitle>
                    <div className="flex gap-2">
                      {selectedProducts.size > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDelete}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Seçili Sil ({selectedProducts.size})
                        </Button>
                      )}
                      {selectedCategoryId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
                              handleDeleteCategory(selectedCategoryId);
                              setSelectedCategoryId(null);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30">
                          <th className="text-center p-3 w-12">
                            <Checkbox
                              checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                              onCheckedChange={toggleAllProducts}
                            />
                          </th>
                          <th className="text-left p-3">Ürün Adı</th>
                          <th className="text-left p-3">Kategori</th>
                          <th className="text-center p-3">Stok</th>
                          <th className="text-right p-3">Alış</th>
                          <th className="text-right p-3">Satış</th>
                          <th className="text-right p-3">Kâr</th>
                          <th className="text-center p-3">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, index) => {
                          const purchasePrice = product.purchasePrice || 0;
                          const salePrice = product.salePrice || 0;
                          const profit = salePrice - purchasePrice;
                          const margin = salePrice > 0 ? (profit / salePrice * 100).toFixed(1) : "0";
                          const isLowStock = product.stock <= product.minStock;

                          // Alternating row colors
                          const rowColor = index % 2 === 0 
                            ? "bg-white/50 dark:bg-gray-900/50" 
                            : "bg-blue-50/30 dark:bg-blue-950/20";

                          return (
                            <tr key={product.id} className={`border-b ${rowColor} hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors`}>
                              <td className="p-3 text-center">
                                <Checkbox
                                  checked={selectedProducts.has(product.id)}
                                  onCheckedChange={() => toggleProductSelection(product.id)}
                                />
                              </td>
                              <td className="p-3">
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  {product.barcode && (
                                    <p className="text-xs text-muted-foreground">{product.barcode}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-sm">{getCategoryName(product.categoryId)}</td>
                              <td className="p-3 text-center">
                                <Badge variant={isLowStock ? "destructive" : "secondary"}>
                                  {product.stock}
                                </Badge>
                              </td>
                              <td className="text-right p-3">₺{purchasePrice.toFixed(2)}</td>
                              <td className="text-right p-3 font-medium">₺{salePrice.toFixed(2)}</td>
                              <td className="text-right p-3">
                                <div className="text-green-600 dark:text-green-400">
                                  ₺{profit.toFixed(2)}
                                  <span className="text-xs ml-1">(%{margin})</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setProductDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Ürün bulunamadı
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeView === "reports" ? (
            // Raporlar Görünümü
            <div className="space-y-6">
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
                </div>
              </div>

              <ReportsView sales={sales} period={reportPeriod} />
            </div>
          ) : (
            // Cariler Görünümü
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Cariler</h2>
              <CariView 
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onAddTransaction={handleAddCustomerTransaction}
              />
            </div>
          )}
        </main>
      </div>

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
      />
    </div>
  );
}

export default App;