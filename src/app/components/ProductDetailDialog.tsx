import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import type { Product, Category } from "../utils/api";
import { Package, DollarSign, TrendingUp, Barcode, FolderTree, AlertTriangle } from "lucide-react";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  formatPrice: (price: number) => string;
}

export function ProductDetailDialog({ open, onOpenChange, product, categories, formatPrice }: ProductDetailDialogProps) {
  if (!product) return null;

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return "Bilinmeyen";
    
    if (category.parentId) {
      const parent = categories.find((c) => c.id === category.parentId);
      return parent ? `${parent.name} > ${category.name}` : category.name;
    }
    
    return category.name;
  };

  const profit = product.salePrice - product.purchasePrice;
  const margin = product.salePrice > 0 ? ((profit / product.salePrice) * 100).toFixed(1) : "0";
  const isLowStock = product.stock <= product.minStock;
  const totalPurchaseValue = product.stock * product.purchasePrice;
  const totalSaleValue = product.stock * product.salePrice;
  const totalPotentialProfit = product.stock * profit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            Ürün detayları ve stok bilgileri
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <div className="flex items-center gap-2 mb-2">
                <FolderTree className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Kategori</p>
              </div>
              <p className="font-semibold text-lg">{getCategoryName(product.categoryId)}</p>
            </div>

            {product.barcode && (
              <div className="col-span-2 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Barcode className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Barkod</p>
                </div>
                <p className="font-mono">{product.barcode}</p>
              </div>
            )}
          </div>

          {/* Stock Info */}
          <div className="p-4 rounded-lg border-2 border-dashed">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">Stok Bilgileri</p>
              {isLowStock && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Düşük Stok
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mevcut Stok</p>
                <p className="text-2xl font-bold">{product.stock}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Minimum Stok</p>
                <p className="text-2xl font-bold text-orange-600">{product.minStock}</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-muted-foreground">Alış Fiyatı</p>
              </div>
              <p className="font-bold text-blue-600">{formatPrice(product.purchasePrice)}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="text-sm text-muted-foreground">Satış Fiyatı</p>
              </div>
              <p className="font-bold text-green-600">{formatPrice(product.salePrice)}</p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-muted-foreground">Birim Kâr</p>
              </div>
              <p className="font-bold text-purple-600">
                {formatPrice(profit)}
                <span className="text-xs ml-1">(%{margin})</span>
              </p>
            </div>
          </div>

          {/* Total Values */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <p className="font-semibold mb-3">Toplam Değerler (Tüm Stok)</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Toplam Alış</p>
                <p className="font-semibold text-blue-600">{formatPrice(totalPurchaseValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Toplam Satış</p>
                <p className="font-semibold text-green-600">{formatPrice(totalSaleValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Potansiyel Kâr</p>
                <p className="font-semibold text-purple-600">{formatPrice(totalPotentialProfit)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Açıklama</p>
              <p className="text-sm">{product.description}</p>
            </div>
          )}

          {/* Date */}
          <div className="text-center text-xs text-muted-foreground pt-2 border-t">
            Oluşturulma: {new Date(product.createdAt).toLocaleDateString('tr-TR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
