import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Wrench, ShoppingCart, TrendingUp, DollarSign, Edit, Trash2, User, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import type { Sale, RepairRecord, Customer, CustomerTransaction, SaleItem } from "../utils/api";

interface SalesManagementViewProps {
  sales: Sale[];
  repairs: RepairRecord[];
  customers: Customer[];
  customerTransactions: CustomerTransaction[];
  onDeleteSale: (id: string) => void;
  onUpdateSale: (id: string, sale: Sale) => void;
  onUpdateRepair: (id: string, data: Partial<RepairRecord>) => void;
  currency: "TRY" | "USD";
  usdRate: number;
  formatPrice: (price: number) => string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#84cc16'];

export function SalesManagementView({
  sales,
  repairs,
  customers,
  customerTransactions,
  onDeleteSale,
  onUpdateSale,
  onUpdateRepair,
  currency,
  usdRate,
  formatPrice,
}: SalesManagementViewProps) {
  // Helper to format price with locale
  const formatPriceLocale = (price: number) => {
    if (currency === "USD" && usdRate > 0) {
      return `$${(price / usdRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);
  const [editRepairDialogOpen, setEditRepairDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editSaleDialogOpen, setEditSaleDialogOpen] = useState(false);

  // Edit repair form
  const [editRepairForm, setEditRepairForm] = useState({
    customerName: "",
    customerPhone: "",
    deviceInfo: "",
    imei: "",
    problemDescription: "",
    repairCost: 0,
    partsCost: 0,
    status: "completed" as "in_progress" | "completed" | "delivered",
  });

  // Edit sale form
  const [editSaleForm, setEditSaleForm] = useState<{
    items: SaleItem[];
    totalPrice: number;
    totalProfit: number;
  }>({
    items: [],
    totalPrice: 0,
    totalProfit: 0,
  });

  // Calculate repair stats
  const repairStats = useMemo(() => {
    const filtered = repairs.filter(r => r.status === "completed" || r.status === "delivered");
    const totalRevenue = filtered.reduce((sum, r) => sum + r.repairCost, 0);
    const totalCost = filtered.reduce((sum, r) => sum + r.partsCost, 0);
    const totalProfit = totalRevenue - totalCost;

    return { count: filtered.length, revenue: totalRevenue, profit: totalProfit, items: filtered };
  }, [repairs]);

  // Calculate product sale stats
  const productSaleStats = useMemo(() => {
    const filtered = sales.filter(s => !s.items.some(item => item.productId.startsWith('repair-')));
    const totalRevenue = filtered.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalProfit = filtered.reduce((sum, s) => sum + s.totalProfit, 0);

    return { count: filtered.length, revenue: totalRevenue, profit: totalProfit, items: filtered };
  }, [sales]);

  // Calculate cari stats
  const cariStats = useMemo(() => {
    const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);
    const totalCredit = customers.reduce((sum, c) => sum + c.credit, 0);
    const balance = totalDebt - totalCredit;

    return { totalDebt, totalCredit, balance, count: customers.length };
  }, [customers]);

  // Calculate profit/loss
  const profitLossStats = useMemo(() => {
    const totalRevenue = productSaleStats.revenue + repairStats.revenue;
    const totalProfit = productSaleStats.profit + repairStats.profit;
    const totalCost = totalRevenue - totalProfit;

    return { totalRevenue, totalProfit, totalCost };
  }, [productSaleStats, repairStats]);

  // Pie chart data
  const pieChartData = useMemo(() => {
    return [
      { name: "Ürün Satışları", value: productSaleStats.profit, color: COLORS[0] },
      { name: "Tamir Kârı", value: repairStats.profit, color: COLORS[1] },
    ].filter(item => item.value > 0);
  }, [productSaleStats.profit, repairStats.profit]);

  // Handle edit repair
  const handleEditRepair = (repair: RepairRecord) => {
    setEditingRepair(repair);
    setEditRepairForm({
      customerName: repair.customerName,
      customerPhone: repair.customerPhone,
      deviceInfo: repair.deviceInfo,
      imei: repair.imei || "",
      problemDescription: repair.problemDescription,
      repairCost: repair.repairCost,
      partsCost: repair.partsCost,
      status: repair.status,
    });
    setEditRepairDialogOpen(true);
  };

  const handleSaveRepair = () => {
    if (!editingRepair) return;
    const profit = editRepairForm.repairCost - editRepairForm.partsCost;
    onUpdateRepair(editingRepair.id!, { ...editRepairForm, profit });
    setEditRepairDialogOpen(false);
    setEditingRepair(null);
    toast.success("Tamir kaydı güncellendi");
  };

  // Handle edit sale
  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setEditSaleForm({
      items: [...sale.items],
      totalPrice: sale.totalPrice,
      totalProfit: sale.totalProfit,
    });
    setEditSaleDialogOpen(true);
  };

  const handleUpdateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...editSaleForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate totals
    const totalPrice = newItems.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
    const totalProfit = newItems.reduce((sum, item) => sum + (item.profit * item.quantity), 0);
    
    setEditSaleForm({ items: newItems, totalPrice, totalProfit });
  };

  const handleSaveSale = () => {
    if (!editingSale) return;
    onUpdateSale(editingSale.id!, {
      ...editingSale,
      ...editSaleForm,
    });
    setEditSaleDialogOpen(false);
    setEditingSale(null);
    toast.success("Satış güncellendi");
  };

  const handleDeleteSale = (id: string) => {
    if (window.confirm("Bu satışı silmek istediğinize emin misiniz?")) {
      onDeleteSale(id);
      toast.success("Satış silindi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Satış & Raporlar</h2>
        <p className="text-sm text-muted-foreground">Tüm satış işlemleri ve raporlar</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Toplam Ciro</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {formatPriceLocale(profitLossStats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Toplam Kâr</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {formatPriceLocale(profitLossStats.totalProfit)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Toplam İşlem</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {productSaleStats.count + repairStats.count}
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">Cari Bakiye</p>
                <p className={`text-3xl font-bold ${cariStats.balance >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                  {formatPriceLocale(cariStats.balance)}
                </p>
              </div>
              <User className="w-12 h-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="repairs">
            <Wrench className="w-4 h-4 mr-2" />
            Tamir
          </TabsTrigger>
          <TabsTrigger value="sales">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ürün Satışı
          </TabsTrigger>
          <TabsTrigger value="cari">
            <User className="w-4 h-4 mr-2" />
            Cari
          </TabsTrigger>
          <TabsTrigger value="profitloss">
            <BarChart3 className="w-4 h-4 mr-2" />
            Kar Zarar
          </TabsTrigger>
          <TabsTrigger value="all">
            <TrendingUp className="w-4 h-4 mr-2" />
            Hepsi
          </TabsTrigger>
        </TabsList>

        {/* Repairs Tab */}
        <TabsContent value="repairs" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <div className="flex items-center justify-between">
                <CardTitle>Tamir Kayıtları</CardTitle>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Ciro</p>
                    <p className="text-xl font-semibold">{formatPriceLocale(repairStats.revenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Kâr</p>
                    <p className="text-xl font-semibold text-green-600">{formatPriceLocale(repairStats.profit)}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {repairStats.items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Henüz tamamlanmış tamir kaydı yok</p>
                ) : (
                  repairStats.items.map((repair) => (
                    <Card key={repair.id} className="bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{repair.deviceInfo}</h4>
                              <Badge variant={repair.status === "delivered" ? "default" : "secondary"}>
                                {repair.status === "delivered" ? "Teslim Edildi" : "Tamamlandı"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{repair.customerName} - {repair.customerPhone}</p>
                            <p className="text-sm text-muted-foreground mb-2">{repair.problemDescription}</p>
                            <div className="flex gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Tamir:</span>{" "}
                                <span className="font-semibold">{formatPriceLocale(repair.repairCost)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Malzeme:</span>{" "}
                                <span className="font-semibold">{formatPriceLocale(repair.partsCost)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Kâr:</span>{" "}
                                <span className="font-semibold text-green-600">{formatPriceLocale(repair.profit)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(repair.createdAt).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {/* Düzenleme ve silme butonları kaldırıldı - Tamir Kayıtları'ndan yönetin */}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <div className="flex items-center justify-between">
                <CardTitle>Ürün Satışları</CardTitle>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Ciro</p>
                    <p className="text-xl font-semibold">{formatPriceLocale(productSaleStats.revenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Kâr</p>
                    <p className="text-xl font-semibold text-green-600">{formatPriceLocale(productSaleStats.profit)}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {productSaleStats.items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Henüz satış kaydı yok</p>
                ) : (
                  productSaleStats.items.map((sale) => (
                    <Card key={sale.id} className="bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">Satış #{sale.id?.slice(0, 8)}</h4>
                            </div>
                            <div className="space-y-1 mb-2">
                              {sale.items.map((item, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{item.productName}</span>{" "}
                                  <span className="text-muted-foreground">x{item.quantity}</span>{" "}
                                  <span className="text-muted-foreground">-</span>{" "}
                                  <span className="font-semibold">{formatPriceLocale(item.salePrice * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Toplam:</span>{" "}
                                <span className="font-semibold">{formatPriceLocale(sale.totalPrice)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Kâr:</span>{" "}
                                <span className="font-semibold text-green-600">{formatPriceLocale(sale.totalProfit)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(sale.date).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditSale(sale)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSale(sale.id!)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cari Tab */}
        <TabsContent value="cari" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950">
              <CardTitle>Cari Hesaplar</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-red-50 dark:bg-red-950/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Toplam Alacak</p>
                    <p className="text-2xl font-bold text-red-600">{formatPriceLocale(cariStats.totalDebt)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-950/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Toplam Borç</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPriceLocale(cariStats.totalCredit)}</p>
                  </CardContent>
                </Card>
                <Card className={cariStats.balance >= 0 ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Bakiye</p>
                    <p className={`text-2xl font-bold ${cariStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPriceLocale(cariStats.balance)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {customers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Henüz cari kaydı yok</p>
                ) : (
                  customers.map((customer) => (
                    <Card key={customer.id} className="bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{customer.name}</h4>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Alacak:</span>{" "}
                              <span className="font-semibold text-red-600">{formatPriceLocale(customer.debt)}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Borç:</span>{" "}
                              <span className="font-semibold text-blue-600">{formatPriceLocale(customer.credit)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit/Loss Tab */}
        <TabsContent value="profitloss" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
              <CardTitle>Kar Zarar Tablosu</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-blue-50 dark:bg-blue-950/30">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">Gelirler</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Ürün Satışları</span>
                          <span className="font-semibold">{formatPriceLocale(productSaleStats.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Tamir Gelirleri</span>
                          <span className="font-semibold">{formatPriceLocale(repairStats.revenue)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Toplam Gelir</span>
                          <span className="font-bold text-blue-600">{formatPriceLocale(profitLossStats.totalRevenue)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 dark:bg-red-950/30">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">Giderler</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Ürün Maliyetleri</span>
                          <span className="font-semibold">{formatPriceLocale(productSaleStats.revenue - productSaleStats.profit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Tamir Maliyetleri</span>
                          <span className="font-semibold">{formatPriceLocale(repairStats.revenue - repairStats.profit)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Toplam Maliyet</span>
                          <span className="font-bold text-red-600">{formatPriceLocale(profitLossStats.totalCost)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Net Kar/Zarar</p>
                        <p className="text-4xl font-bold text-green-600">
                          {formatPriceLocale(profitLossStats.totalProfit)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Kar Marjı</p>
                        <p className="text-3xl font-bold text-green-600">
                          {profitLossStats.totalRevenue > 0 ? ((profitLossStats.totalProfit / profitLossStats.totalRevenue) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ürün Satış Detayı</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Satış Sayısı</span>
                        <span className="font-semibold">{productSaleStats.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ortalama Satış</span>
                        <span className="font-semibold">
                          ₺{productSaleStats.count > 0 ? (productSaleStats.revenue / productSaleStats.count).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kâr Marjı</span>
                        <span className="font-semibold text-green-600">
                          {productSaleStats.revenue > 0 ? ((productSaleStats.profit / productSaleStats.revenue) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tamir Detayı</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tamir Sayısı</span>
                        <span className="font-semibold">{repairStats.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ortalama Gelir</span>
                        <span className="font-semibold">
                          ₺{repairStats.count > 0 ? (repairStats.revenue / repairStats.count).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kâr Marjı</span>
                        <span className="font-semibold text-green-600">
                          {repairStats.revenue > 0 ? ((repairStats.profit / repairStats.revenue) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tab with Pie Chart */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardTitle>Kâr Dağılımı</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {pieChartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Henüz veri yok</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardTitle>Özet</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <span className="text-sm font-medium">Ürün Satışları</span>
                    <span className="font-semibold">{productSaleStats.count} adet</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <span className="text-sm font-medium">Tamir İşlemleri</span>
                    <span className="font-semibold">{repairStats.count} adet</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <span className="text-sm font-medium">Toplam İşlem</span>
                    <span className="font-semibold">{productSaleStats.count + repairStats.count} adet</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ürün Satış Kârı</span>
                    <span className="font-semibold text-blue-600">
                      {formatPriceLocale(productSaleStats.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tamir Kârı</span>
                    <span className="font-semibold text-orange-600">
                      {formatPriceLocale(repairStats.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <span className="font-medium">Toplam Kâr</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPriceLocale(profitLossStats.totalProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950">
              <CardTitle>Son İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[...productSaleStats.items.slice(0, 5), ...repairStats.items.slice(0, 5)]
                  .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
                  .slice(0, 10)
                  .map((item, index) => {
                    const isSale = 'items' in item;
                    
                    // Skip repair sales since we already show repair records
                    if (isSale && item.items.some(saleItem => saleItem.productId.startsWith('repair-'))) {
                      return null;
                    }
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {isSale ? (
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                              <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {isSale ? `Satış - ${item.items[0]?.productName}` : `Tamir - ${item.deviceInfo}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.date || item.createdAt).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatPriceLocale(isSale ? item.totalPrice : item.repairCost)}
                            </p>
                            <p className="text-sm text-green-600">
                              +{formatPriceLocale(isSale ? item.totalProfit : item.profit)}
                            </p>
                          </div>
                          {isSale && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditSale(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteSale(item.id!)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                  .filter(item => item !== null) // Filter out null values
                }
                {productSaleStats.items.length === 0 && repairStats.items.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Henüz işlem yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Repair Dialog */}
      <Dialog open={editRepairDialogOpen} onOpenChange={setEditRepairDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tamir Kaydını Düzenle</DialogTitle>
            <DialogDescription>
              Tamir kaydını düzenlemek için aşağıdaki bilgileri güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Müşteri Adı</Label>
                <Input
                  value={editRepairForm.customerName}
                  onChange={(e) => setEditRepairForm({ ...editRepairForm, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={editRepairForm.customerPhone}
                  onChange={(e) => setEditRepairForm({ ...editRepairForm, customerPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cihaz Bilgisi</Label>
              <Input
                value={editRepairForm.deviceInfo}
                onChange={(e) => setEditRepairForm({ ...editRepairForm, deviceInfo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>IMEI</Label>
              <Input
                value={editRepairForm.imei}
                onChange={(e) => setEditRepairForm({ ...editRepairForm, imei: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Arıza Açıklaması</Label>
              <Textarea
                value={editRepairForm.problemDescription}
                onChange={(e) => setEditRepairForm({ ...editRepairForm, problemDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamir Ücreti (₺)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editRepairForm.repairCost}
                  onChange={(e) => setEditRepairForm({ ...editRepairForm, repairCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Malzeme Maliyeti (₺)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editRepairForm.partsCost}
                  onChange={(e) => setEditRepairForm({ ...editRepairForm, partsCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Kâr</p>
              <p className="text-2xl font-bold text-green-600">
                ₺{(editRepairForm.repairCost - editRepairForm.partsCost).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRepairDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSaveRepair}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog open={editSaleDialogOpen} onOpenChange={setEditSaleDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Satışı Düzenle</DialogTitle>
            <DialogDescription>
              Satışı düzenlemek için aşağıdaki bilgileri güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {editSaleForm.items.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Ürün Adı</Label>
                      <Input value={item.productName} disabled />
                    </div>
                    <div>
                      <Label>Adet</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateSaleItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Satış Fiyatı (₺)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.salePrice}
                        onChange={(e) => handleUpdateSaleItem(index, 'salePrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Toplam</span>
                <span className="text-xl font-bold">₺{editSaleForm.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Kâr</span>
                <span className="text-xl font-bold text-green-600">₺{editSaleForm.totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSaleDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSaveSale}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}