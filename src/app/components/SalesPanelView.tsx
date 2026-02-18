import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Wrench, ShoppingCart, TrendingUp, DollarSign, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Sale, RepairRecord, Category } from "../utils/api";

interface SalesPanelViewProps {
  sales: Sale[];
  repairs: RepairRecord[];
  categories: Category[];
  onDeleteSale: (id: string) => void;
  onUpdateRepair: (id: string, data: Partial<RepairRecord>) => void;
  isPrivacyMode: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];

export function SalesPanelView({
  sales,
  repairs,
  categories,
  onDeleteSale,
  onUpdateRepair,
  isPrivacyMode,
}: SalesPanelViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerPhone: "",
    deviceInfo: "",
    imei: "",
    problemDescription: "",
    repairCost: 0,
    partsCost: 0,
    status: "completed" as "in_progress" | "completed" | "delivered",
  });

  // Filter sales by category
  const filteredSales = useMemo(() => {
    if (selectedCategory === "all") return sales;
    return sales.filter(sale =>
      sale.items.some(item => {
        // Check if item has categoryId directly or find product's category
        return item.categoryId === selectedCategory;
      })
    );
  }, [sales, selectedCategory]);

  // Calculate repair stats
  const repairStats = useMemo(() => {
    const filtered = selectedCategory === "all"
      ? repairs.filter(r => r.status === "completed" || r.status === "delivered")
      : repairs.filter(r => (r.status === "completed" || r.status === "delivered"));

    const totalRevenue = filtered.reduce((sum, r) => sum + r.repairCost, 0);
    const totalCost = filtered.reduce((sum, r) => sum + r.partsCost, 0);
    const totalProfit = totalRevenue - totalCost;

    return { count: filtered.length, revenue: totalRevenue, profit: totalProfit };
  }, [repairs, selectedCategory]);

  // Calculate product sale stats
  const productSaleStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalProfit = filteredSales.reduce((sum, s) => sum + s.totalProfit, 0);

    return { count: filteredSales.length, revenue: totalRevenue, profit: totalProfit };
  }, [filteredSales]);

  // Combined stats
  const combinedStats = useMemo(() => {
    return {
      totalRevenue: productSaleStats.revenue + repairStats.revenue,
      totalProfit: productSaleStats.profit + repairStats.profit,
      totalCount: productSaleStats.count + repairStats.count,
    };
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
    setEditForm({
      customerName: repair.customerName,
      customerPhone: repair.customerPhone,
      deviceInfo: repair.deviceInfo,
      imei: repair.imei || "",
      problemDescription: repair.problemDescription,
      repairCost: repair.repairCost,
      partsCost: repair.partsCost,
      status: repair.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRepair) return;

    const profit = editForm.repairCost - editForm.partsCost;

    onUpdateRepair(editingRepair.id!, {
      ...editForm,
      profit,
    });

    setEditDialogOpen(false);
    setEditingRepair(null);
    toast.success("Tamir kaydı güncellendi");
  };

  // All categories for filter
  const allCategories = [
    { id: "all", name: "Tüm Kategoriler" },
    ...categories,
  ];

  return (
    <div className="space-y-6">
      {/* Header with Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Satış Paneli</h2>
          <p className="text-sm text-muted-foreground">Ürün satışları ve tamir kayıtları</p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori Seç" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Toplam Ciro</p>
                <p className={`text-3xl font-bold text-blue-900 dark:text-blue-100 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                  ₺{combinedStats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
                <p className={`text-3xl font-bold text-green-900 dark:text-green-100 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                  ₺{combinedStats.totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
                  {combinedStats.totalCount}
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="repairs">
            <Wrench className="w-4 h-4 mr-2" />
            Tamir
          </TabsTrigger>
          <TabsTrigger value="sales">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ürün Satışı
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
                    <p className={`text-xl font-semibold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{repairStats.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Kâr</p>
                    <p className={`text-xl font-semibold text-green-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{repairStats.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {repairs.filter(r => r.status === "completed" || r.status === "delivered").length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Henüz tamamlanmış tamir kaydı yok</p>
                ) : (
                  repairs
                    .filter(r => r.status === "completed" || r.status === "delivered")
                    .map((repair) => (
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
                                  <span className="text-muted-foreground">Tamir Ücreti:</span>{" "}
                                  <span className={`font-semibold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{repair.repairCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Malzeme:</span>{" "}
                                  <span className="font-semibold">₺{repair.partsCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Kâr:</span>{" "}
                                  <span className={`font-semibold text-green-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{repair.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
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
                            {/* Edit ve Delete butonları kaldırıldı - Tamir Kayıtları'ndan yönetin */}
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
                    <p className={`text-xl font-semibold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{productSaleStats.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Kâr</p>
                    <p className={`text-xl font-semibold text-green-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{productSaleStats.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredSales.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Henüz satış kaydı yok</p>
                ) : (
                  filteredSales.map((sale) => (
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
                                  <span className={`font-semibold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{(item.salePrice * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Toplam:</span>{" "}
                                <span className={`font-semibold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{sale.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Kâr:</span>{" "}
                                <span className={`font-semibold text-green-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{sale.totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm("Bu satışı silmek istediğinize emin misiniz?")) {
                                onDeleteSale(sale.id!);
                                toast.success("Satış silindi");
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tab with Pie Chart */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
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
                        formatter={(value: number) => isPrivacyMode ? "****" : `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardTitle>Özet İstatistikler</CardTitle>
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
                    <span className="font-semibold">{combinedStats.totalCount} adet</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ürün Satış Kârı</span>
                    <span className={`font-semibold text-blue-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                      ₺{productSaleStats.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tamir Kârı</span>
                    <span className={`font-semibold text-orange-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                      ₺{repairStats.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <span className="font-medium">Toplam Kâr</span>
                    <span className={`text-xl font-bold text-green-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                      ₺{combinedStats.totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {[...filteredSales, ...repairs.filter(r => r.status === "completed" || r.status === "delivered")]
                  .sort((a, b) => {
                    const dateA = 'items' in a ? a.date : a.createdAt;
                    const dateB = 'items' in b ? b.date : b.createdAt;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                  })
                  .map((item, index) => {
                    const isSale = 'items' in item;
                    const itemDate = isSale ? (item as Sale).date : (item as RepairRecord).createdAt;
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
                              {new Date(itemDate).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            ₺{(isSale ? item.totalPrice : item.repairCost).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className={`text-sm text-green-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            +₺{(isSale ? item.totalProfit : item.profit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {filteredSales.length === 0 && repairs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Henüz işlem yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Repair Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tamir Kaydını Düzenle</DialogTitle>
            <DialogDescription>
              Tamir bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customer-name">Müşteri Adı</Label>
                <Input
                  id="edit-customer-name"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-customer-phone">Telefon</Label>
                <Input
                  id="edit-customer-phone"
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-device-info">Cihaz Bilgisi</Label>
              <Input
                id="edit-device-info"
                value={editForm.deviceInfo}
                onChange={(e) => setEditForm({ ...editForm, deviceInfo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imei">IMEI</Label>
              <Input
                id="edit-imei"
                value={editForm.imei}
                onChange={(e) => setEditForm({ ...editForm, imei: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-problem">Arıza Açıklaması</Label>
              <Textarea
                id="edit-problem"
                value={editForm.problemDescription}
                onChange={(e) => setEditForm({ ...editForm, problemDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-repair-cost">Tamir Ücreti (₺)</Label>
                <Input
                  id="edit-repair-cost"
                  type="number"
                  step="0.01"
                  value={editForm.repairCost}
                  onChange={(e) => setEditForm({ ...editForm, repairCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parts-cost">Malzeme Maliyeti (₺)</Label>
                <Input
                  id="edit-parts-cost"
                  type="number"
                  step="0.01"
                  value={editForm.partsCost}
                  onChange={(e) => setEditForm({ ...editForm, partsCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Kâr</p>
              <p className="text-2xl font-bold text-green-600">
                ₺{(editForm.repairCost - editForm.partsCost).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveEdit}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}