import { useState, useEffect } from "react";
import { Package, Search, Plus, TrendingDown, AlertCircle, Warehouse, Menu, LayoutDashboard, DollarSign, Upload, Smartphone } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { AddProductDialog } from "./components/AddProductDialog";
import { EditProductDialog } from "./components/EditProductDialog";
import { StockAdjustDialog } from "./components/StockAdjustDialog";
import { ExcelImport } from "./components/ExcelImport";
import { AddPhoneModel } from "./components/AddPhoneModel";
import { ProductCard } from "./components/ProductCard";
import { toast, Toaster } from "sonner";
import { categories, defaultPhoneModels, getAllPhoneModels } from "./data/categories";
import { api } from "./utils/api";

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

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [phoneModels, setPhoneModels] = useState<Record<string, string[]>>(defaultPhoneModels);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stockAdjustDialogOpen, setStockAdjustDialogOpen] = useState(false);
  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const [addModelOpen, setAddModelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load products and phone models from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const loadedProducts = await api.getProducts();
      setProducts(loadedProducts);
      
      // Load phone models
      const loadedModels = await api.getPhoneModels();
      if (Object.keys(loadedModels).length > 0) {
        setPhoneModels(loadedModels);
      } else {
        // Initialize with default models
        for (const [brand, models] of Object.entries(defaultPhoneModels)) {
          for (const model of models) {
            await api.addPhoneModel(brand, model);
          }
        }
        const updatedModels = await api.getPhoneModels();
        setPhoneModels(updatedModels);
      }
      
      // Add sample data if no products exist
      if (loadedProducts.length === 0) {
        const sampleProducts = [
          {
            name: "Şeffaf Silikon Kılıf",
            category: "Telefon Kılıfı",
            phoneModel: "Apple iPhone 15 Pro Max",
            quantity: 15,
            minQuantity: 5,
            price: 150,
            description: "Şeffaf, anti-yellowing teknolojisi",
            createdAt: new Date().toISOString(),
          },
          {
            name: "Premium Cam Ekran Koruyucu",
            category: "Kırılmaz Ekran",
            phoneModel: "Samsung Galaxy S24 Ultra",
            quantity: 3,
            minQuantity: 10,
            price: 200,
            description: "9H sertlik, ultra ince",
            createdAt: new Date().toISOString(),
          },
          {
            name: "Kamera Lens Koruma",
            category: "Kamera Koruyucu Lens",
            phoneModel: "Apple iPhone 15 Pro",
            quantity: 0,
            minQuantity: 8,
            price: 120,
            description: "Metal halka ile kamera koruması",
            createdAt: new Date().toISOString(),
          },
          {
            name: "Gizlilik Ekran Filmi",
            category: "Hayalet Ekran",
            phoneModel: "Xiaomi 14 Pro",
            quantity: 25,
            minQuantity: 10,
            price: 250,
            description: "180° gizlilik koruması",
            createdAt: new Date().toISOString(),
          },
        ];
        
        for (const product of sampleProducts) {
          await api.addProduct(product);
        }
        
        const refreshedProducts = await api.getProducts();
        setProducts(refreshedProducts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: Omit<Product, "id" | "createdAt">) => {
    try {
      const newProduct = await api.addProduct({
        ...productData,
        createdAt: new Date().toISOString(),
      });
      setProducts([...products, newProduct]);
      toast.success("Ürün başarıyla eklendi!");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Ürün eklenirken hata oluştu");
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await api.updateProduct(updatedProduct.id, updatedProduct);
      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      toast.success("Ürün başarıyla güncellendi!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Ürün güncellenirken hata oluştu");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Ürün başarıyla silindi!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Ürün silinirken hata oluştu");
    }
  };

  const handleStockAdjust = async (productId: string, adjustment: number) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const updatedProduct = {
        ...product,
        quantity: Math.max(0, product.quantity + adjustment),
      };

      await api.updateProduct(productId, updatedProduct);
      setProducts(products.map((p) => (p.id === productId ? updatedProduct : p)));
      toast.success(adjustment > 0 ? "Stok eklendi!" : "Stok çıkarıldı!");
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Stok güncellenirken hata oluştu");
    }
  };

  const handleBulkImport = async (importedProducts: Omit<Product, "id" | "createdAt">[]) => {
    try {
      const productsWithDate = importedProducts.map((p) => ({
        ...p,
        createdAt: new Date().toISOString(),
      }));
      
      const newProducts = await api.bulkImportProducts(productsWithDate);
      setProducts([...products, ...newProducts]);
      toast.success(`${newProducts.length} ürün başarıyla yüklendi!`);
    } catch (error) {
      console.error("Error bulk importing:", error);
      toast.error("Toplu yükleme sırasında hata oluştu");
    }
  };

  const handleAddPhoneModel = async (brand: string, model: string) => {
    try {
      const updatedModels = await api.addPhoneModel(brand, model);
      setPhoneModels(updatedModels);
      toast.success("Telefon modeli eklendi!");
    } catch (error) {
      console.error("Error adding phone model:", error);
      toast.error("Model eklenirken hata oluştu");
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const openStockAdjustDialog = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustDialogOpen(true);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.phoneModel?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  // Statistics
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.quantity <= p.minQuantity && p.quantity > 0).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // Category statistics
  const getCategoryStats = () => {
    return categories.map((category) => {
      const categoryProducts = products.filter((p) => p.category === category);
      const totalItems = categoryProducts.reduce((sum, p) => sum + p.quantity, 0);
      const value = categoryProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
      const lowStock = categoryProducts.filter((p) => p.quantity <= p.minQuantity && p.quantity > 0).length;
      
      return {
        category,
        count: categoryProducts.length,
        totalItems,
        value,
        lowStock,
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Warehouse className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} border-r bg-card transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Warehouse className="w-6 h-6 text-primary" />
            <h2 className="font-semibold">Kategoriler</h2>
          </div>
        </div>
        
        <nav className="p-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          
          {categories.map((category) => {
            const categoryCount = products.filter((p) => p.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">{category}</span>
                </div>
                <Badge variant={selectedCategory === category ? "secondary" : "outline"} className="ml-auto">
                  {categoryCount}
                </Badge>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex-1">
                <h1>Stok Takip Sistemi</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory ? selectedCategory : "Genel Bakış"}
                </p>
              </div>

              <Button variant="outline" size="sm" onClick={() => setAddModelOpen(true)}>
                <Smartphone className="w-4 h-4 mr-2" />
                Model Ekle
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setExcelImportOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Excel Yükle
              </Button>

              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Ürün
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* Dashboard View */}
          {!selectedCategory && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Toplam Ürün</p>
                        <p className="text-2xl font-semibold">{totalProducts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <TrendingDown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Düşük Stok</p>
                        <p className="text-2xl font-semibold">{lowStockCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stokta Yok</p>
                        <p className="text-2xl font-semibold">{outOfStockCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Toplam Değer</p>
                        <p className="text-2xl font-semibold">₺{totalValue.toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Kategori Bazlı Durum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getCategoryStats().map((stat) => (
                      <div
                        key={stat.category}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedCategory(stat.category)}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{stat.category}</h3>
                          <p className="text-sm text-muted-foreground">
                            {stat.count} ürün çeşidi • {stat.totalItems} adet stok
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₺{stat.value.toLocaleString('tr-TR')}</p>
                          {stat.lowStock > 0 && (
                            <Badge variant="secondary" className="mt-1">
                              {stat.lowStock} düşük stok
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Low Stock Alerts */}
              {lowStockCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      Stok Uyarıları
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {products
                        .filter((p) => p.quantity <= p.minQuantity)
                        .slice(0, 5)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.category} • {product.phoneModel}
                              </p>
                            </div>
                            <Badge variant={product.quantity === 0 ? "destructive" : "secondary"}>
                              {product.quantity === 0 ? "Stokta Yok" : `${product.quantity} adet kaldı`}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Category Products View */}
          {selectedCategory && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Ürün veya model ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "Aramanıza uygun ürün bulunamadı" : "Bu kategoride henüz ürün yok"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteProduct}
                      onAdjustStock={openStockAdjustDialog}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddProduct}
        phoneModels={phoneModels}
      />

      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={selectedProduct}
        onUpdate={handleUpdateProduct}
        phoneModels={phoneModels}
      />

      {selectedProduct && (
        <StockAdjustDialog
          open={stockAdjustDialogOpen}
          onOpenChange={setStockAdjustDialogOpen}
          productName={selectedProduct.name}
          currentStock={selectedProduct.quantity}
          onAdjust={(adjustment) => handleStockAdjust(selectedProduct.id, adjustment)}
        />
      )}

      <ExcelImport
        open={excelImportOpen}
        onOpenChange={setExcelImportOpen}
        onImport={handleBulkImport}
      />

      <AddPhoneModel
        open={addModelOpen}
        onOpenChange={setAddModelOpen}
        onAdd={handleAddPhoneModel}
        existingBrands={Object.keys(phoneModels)}
      />
    </div>
  );
}

export default App;
