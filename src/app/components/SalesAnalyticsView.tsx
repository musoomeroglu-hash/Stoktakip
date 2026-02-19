import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, Package, Clock, Tag, BarChart3, AlertCircle, Calendar } from "lucide-react";
import type { Sale, Product, Category } from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface SalesAnalyticsViewProps {
  sales: Sale[];
  products: Product[];
  categories: Category[];
  formatPrice: (price: number) => string;
  isPrivacyMode: boolean;
}

export function SalesAnalyticsView({ sales, products, categories, formatPrice, isPrivacyMode }: SalesAnalyticsViewProps) {
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
  });
  const [endDate, setEndDate] = useState(() => {
    return format(new Date(), "yyyy-MM-dd");
  });

  const isDateInRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  const setCurrentMonth = () => {
    const now = new Date();
    setStartDate(format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd"));
    setEndDate(format(now, "yyyy-MM-dd"));
  };

  const setPreviousMonth = () => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(format(prev, "yyyy-MM-dd"));
    setEndDate(format(prevEnd, "yyyy-MM-dd"));
  };

  const setAllTime = () => {
    setStartDate("2020-01-01");
    setEndDate(format(new Date(), "yyyy-MM-dd"));
  };

  // Filtered sales based on date range
  const filteredSales = useMemo(() => {
    return sales.filter(s => isDateInRange(s.date));
  }, [sales, startDate, endDate]);

  // Calculate best selling products
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSalesMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.salePrice * item.quantity;
      } else {
        productSalesMap.set(item.productId, {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.salePrice * item.quantity,
        });
      }
    });
  });

  const bestSellingProducts = Array.from(productSalesMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Dead stock (products never sold in the selected period)
  const soldProductIds = new Set(Array.from(productSalesMap.keys()));
  const deadStockProducts = products.filter(p => !soldProductIds.has(p.id) && p.stock > 0);

  // Category analysis
  const categorySalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      let categoryId = item.categoryId;

      // Fallback: If categoryId is missing in sale item, try to find it from product data
      if (!categoryId) {
        const product = products.find(p => p.id === item.productId);
        categoryId = product?.categoryId;
      }

      if (!categoryId) return;

      const category = categories.find(c => c.id === categoryId);
      const categoryName = category?.name || "Diğer";

      const existing = categorySalesMap.get(categoryId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.salePrice * item.quantity;
      } else {
        categorySalesMap.set(categoryId, {
          name: categoryName,
          quantity: item.quantity,
          revenue: item.salePrice * item.quantity,
        });
      }
    });
  });

  const categorySales = Array.from(categorySalesMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Hourly sales analysis
  const hourlySalesMap = new Map<number, number>();

  filteredSales.forEach(sale => {
    const hour = new Date(sale.date).getHours();
    hourlySalesMap.set(hour, (hourlySalesMap.get(hour) || 0) + 1);
  });

  const hourlySales = Array.from(hourlySalesMap.entries())
    .map(([hour, count]) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      hourNum: hour,
      count,
    }))
    .sort((a, b) => a.hourNum - b.hourNum);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      {/* Header & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Satış Analizi
          </h2>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(startDate), "dd MMM yyyy", { locale: tr })} - {format(new Date(endDate), "dd MMM yyyy", { locale: tr })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border shadow-sm">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto h-8 border-none focus-visible:ring-0 px-2"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto h-8 border-none focus-visible:ring-0 px-2"
            />
          </div>

          <div className="flex gap-1">
            <Button
              onClick={setCurrentMonth}
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs font-normal"
            >
              Bu Ay
            </Button>
            <Button
              onClick={setPreviousMonth}
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs font-normal"
            >
              Geçen Ay
            </Button>
            <Button
              onClick={setAllTime}
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs font-normal"
            >
              Tüm Zamanlar
            </Button>
          </div>
        </div>
      </div>



      {/* Top 10 Best Selling Products */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            En Çok Satan 10 Ürün
          </CardTitle>
          <CardDescription>
            En yüksek satış adedine sahip ürünler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bestSellingProducts.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bestSellingProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === "quantity") return [value, "Adet"];
                      if (name === "revenue") {
                        const val = formatPrice(value as number);
                        return [isPrivacyMode ? "****" : val, "Gelir"];
                      }
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="quantity" name="Satış Adedi" radius={[4, 4, 0, 0]}>
                    {bestSellingProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {bestSellingProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="relative flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-blue-50 dark:bg-blue-900/20 transition-all duration-500"
                      style={{ width: `${(product.quantity / bestSellingProducts[0].quantity) * 100}%` }}
                    />
                    <div className="relative flex items-center gap-3 z-10">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-800">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200">
                            {product.quantity} Adet
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="relative text-right z-10">
                      <p className={`font-bold text-blue-600 dark:text-blue-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                        {formatPrice(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Seçili aralıkta henüz kayıt yok
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dead Stock */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50/50 dark:from-orange-950 dark:to-red-950/50 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Hiç Satılmayan Ürünler (Dead Stock)
          </CardTitle>
          <CardDescription>
            Stoğu olan ama hiç satış yapılmamış ürünler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deadStockProducts.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {deadStockProducts.slice(0, 50).map((product) => {
                const category = categories.find(c => c.id === product.categoryId);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {category && (
                          <Badge variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {category.name}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          <Package className="w-3 h-3 mr-1" />
                          Stok: {product.stock}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Satış fiyatı</p>
                      <p className={`font-semibold text-orange-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                        {formatPrice(product.salePrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {deadStockProducts.length > 50 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  +{deadStockProducts.length - 50} ürün daha
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              🎉 Tüm ürünler en az bir kez satıldı!
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Sales */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50/50 dark:from-purple-950 dark:to-pink-950/50 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Kategorilere Göre Satışlar
            </CardTitle>
            <CardDescription>
              Hangi kategoriler daha çok satıyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categorySales.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categorySales}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="revenue"
                    >
                      {categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => isPrivacyMode ? "****" : formatPrice(value as number)}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {categorySales.map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{category.quantity} adet</p>
                        <p className={`text-xs text-muted-foreground ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                          {formatPrice(category.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Seçili aralıkta henüz kayıt yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Sales */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Saatlere Göre Satış Yoğunluğu
            </CardTitle>
            <CardDescription>
              Hangi saatlerde satış yoğun
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hourlySales.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={hourlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [value, "Satış Sayısı"]}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {hourlySales.map((item) => (
                    <div
                      key={item.hour}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">{item.hour}</span>
                      </div>
                      <Badge variant="secondary">{item.count} satış</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Bu ay henüz satış yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div >
  );
}
