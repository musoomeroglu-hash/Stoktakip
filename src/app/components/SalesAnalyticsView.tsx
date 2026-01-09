import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Package, Clock, Tag, BarChart3, AlertCircle } from "lucide-react";
import type { Sale, Product, Category } from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface SalesAnalyticsViewProps {
  sales: Sale[];
  products: Product[];
  categories: Category[];
  formatPrice: (price: number) => string;
}

export function SalesAnalyticsView({ sales, products, categories, formatPrice }: SalesAnalyticsViewProps) {
  // This month's sales
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthSales = sales.filter(s => new Date(s.date) >= thisMonthStart);

  // Calculate best selling products (this month)
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  
  thisMonthSales.forEach(sale => {
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

  // Dead stock (products never sold)
  const soldProductIds = new Set(Array.from(productSalesMap.keys()));
  const deadStockProducts = products.filter(p => !soldProductIds.has(p.id) && p.stock > 0);

  // Category analysis
  const categorySalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  
  thisMonthSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!item.categoryId) return;
      
      const category = categories.find(c => c.id === item.categoryId);
      const categoryName = category?.name || "Diğer";
      
      const existing = categorySalesMap.get(item.categoryId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.salePrice * item.quantity;
      } else {
        categorySalesMap.set(item.categoryId, {
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
  
  thisMonthSales.forEach(sale => {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Satış Analizi
          </h2>
          <p className="text-muted-foreground mt-1">
            Bu ayki satış performansı ve trendler
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          {thisMonthSales.length} satış bu ay
        </Badge>
      </div>

      {/* Top 10 Best Selling Products */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            En Çok Satan 10 Ürün (Bu Ay)
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
                      if (name === "revenue") return [formatPrice(value as number), "Gelir"];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="quantity" fill="#3b82f6" name="quantity" />
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {bestSellingProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} adet satıldı
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        {formatPrice(product.revenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">Toplam gelir</p>
                    </div>
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
            <div className="space-y-2">
              {deadStockProducts.slice(0, 20).map((product) => {
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
                      <p className="font-semibold text-orange-600">
                        {formatPrice(product.salePrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {deadStockProducts.length > 20 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  +{deadStockProducts.length - 20} ürün daha
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
                      labelLine={false}
                      label={(entry) => `${entry.name} (${entry.quantity})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatPrice(value as number)}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
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
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(category.revenue)}
                        </p>
                      </div>
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
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-2">
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
    </div>
  );
}
