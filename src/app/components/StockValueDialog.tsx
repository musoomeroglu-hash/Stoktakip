import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import type { Product, Category } from "../utils/api";

interface StockValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  categories: Category[];
}

export function StockValueDialog({ open, onOpenChange, products, categories }: StockValueDialogProps) {
  const totalSaleValue = products.reduce((sum, p) => sum + (p.stock * p.salePrice), 0);
  const totalPurchaseValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
  const potentialProfit = totalSaleValue - totalPurchaseValue;

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return "Bilinmeyen";
    
    if (category.parentId) {
      const parent = categories.find((c) => c.id === category.parentId);
      return parent ? `${parent.name} > ${category.name}` : category.name;
    }
    
    return category.name;
  };

  // Group products by category
  const categoryStats = products.reduce((acc, product) => {
    const categoryId = product.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        name: getCategoryName(categoryId),
        saleValue: 0,
        purchaseValue: 0,
        count: 0,
      };
    }
    acc[categoryId].saleValue += product.stock * product.salePrice;
    acc[categoryId].purchaseValue += product.stock * product.purchasePrice;
    acc[categoryId].count++;
    return acc;
  }, {} as Record<string, { name: string; saleValue: number; purchaseValue: number; count: number }>);

  const sortedCategories = Object.values(categoryStats).sort((a, b) => b.saleValue - a.saleValue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stok Değeri Analizi</DialogTitle>
          <DialogDescription>
            Kategorilere göre stok değeri dağılımı
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <p className="text-sm text-muted-foreground mb-1">Alış Fiyatı Toplamı</p>
              <p className="text-2xl font-bold text-blue-600">
                ₺{totalPurchaseValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <p className="text-sm text-muted-foreground mb-1">Satış Fiyatı Toplamı</p>
              <p className="text-2xl font-bold text-green-600">
                ₺{totalSaleValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <p className="text-sm text-muted-foreground mb-1">Potansiyel Kâr</p>
              <p className="text-2xl font-bold text-purple-600">
                ₺{potentialProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Kategori Bazlı Dağılım</h3>
            <div className="space-y-2">
              {sortedCategories.map((cat, index) => {
                const profit = cat.saleValue - cat.purchaseValue;
                const margin = cat.saleValue > 0 ? (profit / cat.saleValue * 100) : 0;
                
                return (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{cat.name}</h4>
                      <span className="text-sm text-muted-foreground">{cat.count} ürün</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Alış Değeri</p>
                        <p className="font-semibold">₺{cat.purchaseValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Satış Değeri</p>
                        <p className="font-semibold text-green-600">₺{cat.saleValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Potansiyel Kâr</p>
                        <p className="font-semibold text-purple-600">
                          ₺{profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          <span className="text-xs ml-1">(%{margin.toFixed(1)})</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <p className="text-sm text-muted-foreground mb-2">Ortalama Kâr Marjı</p>
            <p className="text-3xl font-bold text-purple-600">
              {totalSaleValue > 0 ? ((potentialProfit / totalSaleValue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}