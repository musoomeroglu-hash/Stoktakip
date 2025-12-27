import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Percent } from "lucide-react";
import { format, startOfDay, subDays, startOfWeek, startOfMonth } from "date-fns";
import type { Sale } from "../utils/api";

interface ReportsViewProps {
  sales: Sale[];
  period: "daily" | "weekly" | "monthly";
}

export function ReportsView({ sales, period }: ReportsViewProps) {
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
    }

    const filteredSales = sales.filter((sale) => new Date(sale.date) >= startDate);

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
    };
  }, [sales, period]);

  const periodLabel = {
    daily: "Bugün",
    weekly: "Bu Hafta",
    monthly: "Bu Ay",
  }[period];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Card>
          <CardHeader>
            <CardTitle>Kâr Analizi - {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
      </div>

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
    </div>
  );
}