import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Percent, Trash2, Edit, HandCoins, BarChart3 } from "lucide-react";
import { format, startOfDay, subDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import type { Sale, CustomerTransaction, SaleItem } from "../utils/api";

interface ReportsViewProps {
  sales: Sale[];
  period: "daily" | "weekly" | "monthly" | "all";
  customerTransactions: CustomerTransaction[];
  onDeleteSale: (id: string) => void;
  onUpdateSale?: (id: string, sale: Sale) => void;
}

export function ReportsView({ sales, period, customerTransactions, onDeleteSale, onUpdateSale }: ReportsViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState<{
    items: SaleItem[];
    totalPrice: number;
    totalProfit: number;
  }>({
    items: [],
    totalPrice: 0,
    totalProfit: 0,
  });

  const periodData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let days: number;

    switch (period) {
      case "daily":
        startDate = startOfDay(now);
        days = 1;
        break;
      case "weekly":
        startDate = startOfWeek(now);
        days = 7;
        break;
      case "monthly":
        startDate = startOfMonth(now);
        days = 30;
        break;
      case "all":
        startDate = new Date(0);
        days = 0;
        break;
    }

    const filteredSales = sales.filter((sale) => new Date(sale.date) >= startDate);
    const filteredTransactions = customerTransactions.filter(
      (tx) => new Date(tx.createdAt) >= startDate && tx.type === "payment_received"
    );

    // Tahsilat hesapla
    const totalCollected = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Group by day for chart
    const chartData: { [key: string]: { revenue: number; profit: number; count: number } } = {};
    
    for (let i = 0; i < days; i++) {
      const date = subDays(now, days - 1 - i);
      const dateKey = format(date, "dd MMM");
      chartData[dateKey] = { revenue: 0, profit: 0, count: 0 };
    }

    // Calculate top selling products
    const productSales: { [productId: string]: { name: string; quantity: number; revenue: number; profit: number } } = {};

    filteredSales.forEach((sale) => {
      const dateKey = format(new Date(sale.date), "dd MMM");
      if (chartData[dateKey]) {
        chartData[dateKey].revenue += sale.totalPrice;
        chartData[dateKey].profit += sale.totalProfit;
        chartData[dateKey].count += 1;
      }

      // Track product sales
      sale.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.salePrice * item.quantity;
        productSales[item.productId].profit += item.profit * item.quantity;
      });
    });

    // Sort products by quantity sold
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    const totalSales = filteredSales.length;
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Aylık günlük ciro ve kâr hesaplama (her zaman güncel ay için)
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const dailyMonthlyData = daysInMonth.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return saleDate >= dayStart && saleDate <= dayEnd;
      });
      
      const dayRevenue = daySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
      const dayProfit = daySales.reduce((sum, sale) => sum + sale.totalProfit, 0);
      
      return {
        date: day,
        day: day.getDate(),
        revenue: dayRevenue,
        profit: dayProfit,
      };
    });

    return {
      chartData: Object.entries(chartData).map(([date, data]) => ({
        date,
        Ciro: data.revenue,
        Kâr: data.profit,
      })),
      totalRevenue,
      totalProfit,
      totalSales,
      avgSale,
      profitMargin,
      topProducts,
      filteredSales,
      totalCollected,
      dailyMonthlyData,
    };
  }, [sales, period, customerTransactions]);

  const periodLabel = {
    daily: "Bugün",
    weekly: "Bu Hafta",
    monthly: "Bu Ay",
    all: "Tüm Zamanlar",
  }[period];

  const handleDeleteClick = (id: string) => {
    setSaleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (saleToDelete) {
      onDeleteSale(saleToDelete);
      setSaleToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setEditForm({
      items: sale.items,
      totalPrice: sale.totalPrice,
      totalProfit: sale.totalProfit,
    });
    setEditDialogOpen(true);
  };

  const confirmEdit = () => {
    if (editingSale && onUpdateSale) {
      onUpdateSale(editingSale.id, {
        ...editingSale,
        items: editForm.items,
        totalPrice: editForm.totalPrice,
        totalProfit: editForm.totalProfit,
      });
      setEditingSale(null);
    }
    setEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="text-sm text-blue-700 dark:text-blue-300">Toplam Satış</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{periodData.totalSales}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="text-sm text-green-700 dark:text-green-300">Toplam Gelir</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">₺{periodData.totalRevenue.toLocaleString('tr-TR')}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="text-sm text-purple-700 dark:text-purple-300">Toplam Kâr</div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">₺{periodData.totalProfit.toLocaleString('tr-TR')}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/50 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <HandCoins className="w-4 h-4" />
              Tahsilat
            </div>
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-2">₺{periodData.totalCollected.toLocaleString('tr-TR')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ciro Trendi - {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={periodData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `₺${value.toFixed(2)}`}
                />
                <Legend />
                <Line type="monotone" dataKey="Ciro" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Aylık Sütun Grafiği */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50/30 dark:from-green-950 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Aylık Sütun Grafiği
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={periodData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `₺${value.toFixed(2)}`}
              />
              <Legend />
              <Bar dataKey="Kâr" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Aylık Günlük Ciro ve Kâr Tablosu - Her Zaman Görünür */}
      {periodData.dailyMonthlyData.length > 0 && (
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              {format(new Date(), "MMMM yyyy")} - Günlük Ciro ve Kâr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-blue-200 dark:border-blue-800">
                    <th className="text-left p-2 sticky left-0 bg-blue-100 dark:bg-blue-900 font-bold z-10">Metrik</th>
                    {periodData.dailyMonthlyData.map((dayData) => (
                      <th 
                        key={dayData.day} 
                        className="text-center p-2 min-w-[80px] bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-950"
                      >
                        <div className="font-bold text-blue-900 dark:text-blue-100">{dayData.day}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">{format(dayData.date, "EEE")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-blue-100 dark:border-blue-900 bg-green-50/50 dark:bg-green-950/30 hover:bg-green-100/70 dark:hover:bg-green-900/40 transition-colors">
                    <td className="p-2 font-bold sticky left-0 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 z-10">
                      Ciro (₺)
                    </td>
                    {periodData.dailyMonthlyData.map((dayData) => (
                      <td 
                        key={`revenue-${dayData.day}`} 
                        className={`text-center p-2 font-medium ${
                          dayData.revenue > 0 
                            ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950' 
                            : 'text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {dayData.revenue > 0 ? `₺${dayData.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-blue-100 dark:border-blue-900 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100/70 dark:hover:bg-purple-900/40 transition-colors">
                    <td className="p-2 font-bold sticky left-0 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 z-10">
                      Kâr (₺)
                    </td>
                    {periodData.dailyMonthlyData.map((dayData) => (
                      <td 
                        key={`profit-${dayData.day}`} 
                        className={`text-center p-2 font-medium ${
                          dayData.profit > 0 
                            ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950' 
                            : 'text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {dayData.profit > 0 ? `₺${dayData.profit.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900">
                    <td className="p-2 font-bold sticky left-0 bg-blue-200 dark:bg-blue-800 z-10">TOPLAM</td>
                    <td 
                      colSpan={periodData.dailyMonthlyData.length} 
                      className="text-center p-2"
                    >
                      <div className="flex justify-around">
                        <div className="text-green-700 dark:text-green-300 font-bold">
                          Ciro: ₺{periodData.dailyMonthlyData.reduce((sum, day) => sum + day.revenue, 0).toLocaleString('tr-TR')}
                        </div>
                        <div className="text-purple-700 dark:text-purple-300 font-bold">
                          Kâr: ₺{periodData.dailyMonthlyData.reduce((sum, day) => sum + day.profit, 0).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Selling Products */}
      <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/30">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            En Çok Satılan Ürünler - {periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-orange-100/50 to-yellow-100/50 dark:from-orange-900/30 dark:to-yellow-900/30">
                  <th className="text-left p-3">Sıra</th>
                  <th className="text-left p-3">Ürün Adı</th>
                  <th className="text-center p-3">Satış Adedi</th>
                  <th className="text-right p-3">Toplam Gelir</th>
                  <th className="text-right p-3">Toplam Kâr</th>
                  <th className="text-right p-3">Kâr Marjı</th>
                </tr>
              </thead>
              <tbody>
                {periodData.topProducts.map((product, index) => {
                  const margin = product.revenue > 0 ? (product.profit / product.revenue * 100) : 0;
                  const rowColor = index % 2 === 0 
                    ? "bg-white/50 dark:bg-gray-900/50" 
                    : "bg-orange-50/30 dark:bg-orange-950/20";
                  
                  return (
                    <tr key={product.id} className={`border-b ${rowColor} hover:bg-yellow-50/50 dark:hover:bg-yellow-950/30 transition-colors`}>
                      <td className="p-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="text-center p-3">
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="text-right p-3 font-medium">₺{product.revenue.toFixed(2)}</td>
                      <td className="text-right p-3 text-green-600 dark:text-green-400 font-medium">₺{product.profit.toFixed(2)}</td>
                      <td className="text-right p-3">
                        <span className="text-purple-600 dark:text-purple-400">%{margin.toFixed(1)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {periodData.topProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Bu dönemde satış yapılmamış
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Son Satışlar - {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Tarih</th>
                  <th className="text-left p-3">Ürünler</th>
                  <th className="text-right p-3">Tutar</th>
                  <th className="text-right p-3">Kâr</th>
                  <th className="text-right p-3">Marj</th>
                  <th className="text-right p-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{format(new Date(sale.date), "dd MMM yyyy HH:mm")}</td>
                    <td className="p-3">
                      <div className="text-sm">
                        {sale.items.map((item, i) => (
                          <div key={i}>
                            {item.productName} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="text-right p-3 font-medium">₺{sale.totalPrice.toFixed(2)}</td>
                    <td className="text-right p-3 text-green-600 font-medium">₺{sale.totalProfit.toFixed(2)}</td>
                    <td className="text-right p-3">
                      {((sale.totalProfit / sale.totalPrice) * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(sale.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {onUpdateSale && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(sale)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sales.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Bu dönemde satış yapılmamış
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Özet Kartı */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
        <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            Özet - {periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sol Kolon - İşlem Sayıları */}
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Ürün Satışları</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {periodData.filteredSales.filter(sale => sale.type === 'product').length} adet
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Tamir İşlemleri</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {periodData.filteredSales.filter(sale => sale.type === 'repair').length} adet
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam İşlem</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {periodData.totalSales} adet
                </div>
              </div>
            </div>

            {/* Orta Kolon - Kâr Detayları */}
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Ürün Satış Kârı</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ₺{periodData.filteredSales
                    .filter(sale => sale.type === 'product')
                    .reduce((sum, sale) => sum + sale.totalProfit, 0)
                    .toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Tamir Kârı</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  ₺{periodData.filteredSales
                    .filter(sale => sale.type === 'repair')
                    .reduce((sum, sale) => sum + sale.totalProfit, 0)
                    .toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-bold">Toplam Kâr</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ₺{periodData.totalProfit.toLocaleString('tr-TR')}
                </div>
              </div>
            </div>

            {/* Sağ Kolon - Diğer Bilgiler */}
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Ortalama Satış</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  ₺{periodData.avgSale.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Kâr Marjı</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  %{periodData.profitMargin.toFixed(1)}
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Ciro</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ₺{periodData.totalRevenue.toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Satışı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu satışı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve ürün stokları geri yüklenecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Sale Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Satışı Düzenle</DialogTitle>
            <DialogDescription>
              Satış bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <CardContent>
            <div className="space-y-4">
              {editForm.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Label className="w-24">Ürün Adı:</Label>
                  <Input
                    value={item.productName}
                    onChange={(e) => {
                      const newItems = [...editForm.items];
                      newItems[index].productName = e.target.value;
                      setEditForm({ ...editForm, items: newItems });
                    }}
                    className="w-40"
                  />
                  <Label className="w-24">Adet:</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...editForm.items];
                      newItems[index].quantity = parseInt(e.target.value, 10);
                      setEditForm({ ...editForm, items: newItems });
                    }}
                    className="w-20"
                  />
                  <Label className="w-24">Satış Fiyatı:</Label>
                  <Input
                    type="number"
                    value={item.salePrice}
                    onChange={(e) => {
                      const newItems = [...editForm.items];
                      newItems[index].salePrice = parseFloat(e.target.value);
                      setEditForm({ ...editForm, items: newItems });
                    }}
                    className="w-20"
                  />
                  <Label className="w-24">Kâr:</Label>
                  <Input
                    type="number"
                    value={item.profit}
                    onChange={(e) => {
                      const newItems = [...editForm.items];
                      newItems[index].profit = parseFloat(e.target.value);
                      setEditForm({ ...editForm, items: newItems });
                    }}
                    className="w-20"
                  />
                </div>
              ))}
              <div className="flex items-center gap-4">
                <Label className="w-24">Toplam Tutar:</Label>
                <Input
                  type="number"
                  value={editForm.totalPrice}
                  onChange={(e) => {
                    setEditForm({ ...editForm, totalPrice: parseFloat(e.target.value) });
                  }}
                  className="w-40"
                />
                <Label className="w-24">Toplam Kâr:</Label>
                <Input
                  type="number"
                  value={editForm.totalProfit}
                  onChange={(e) => {
                    setEditForm({ ...editForm, totalProfit: parseFloat(e.target.value) });
                  }}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditDialogOpen(false)}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={confirmEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}