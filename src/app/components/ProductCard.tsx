import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Edit, Trash2, PackageOpen, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  category: string;
  phoneModel?: string;
  quantity: number;
  minQuantity: number;
  price: number;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete, onAdjustStock }: ProductCardProps) {
  const isLowStock = product.quantity <= product.minQuantity;
  const isOutOfStock = product.quantity === 0;

  return (
    <Card className="relative overflow-hidden">
      {isLowStock && (
        <div className={`absolute top-0 right-0 w-2 h-full ${isOutOfStock ? "bg-red-500" : "bg-yellow-500"}`} />
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {product.name}
              {isLowStock && (
                <Badge variant={isOutOfStock ? "destructive" : "secondary"} className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {isOutOfStock ? "Stokta Yok" : "Düşük Stok"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{product.category}</CardDescription>
            {product.phoneModel && (
              <p className="text-sm text-muted-foreground mt-1">{product.phoneModel}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Stok Miktarı</span>
          <span className={`text-lg font-semibold ${isLowStock ? "text-red-600 dark:text-red-400" : ""}`}>
            {product.quantity} Adet
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Min. Miktar</span>
          <span className="text-sm">{product.minQuantity} Adet</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Fiyat</span>
          <span className="text-lg font-semibold">₺{product.price.toFixed(2)}</span>
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground pt-2 border-t">{product.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onAdjustStock(product)}
        >
          <PackageOpen className="w-4 h-4 mr-2" />
          Stok Ayarla
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ürünü Sil</AlertDialogTitle>
              <AlertDialogDescription>
                "{product.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(product.id)} className="bg-red-600 hover:bg-red-700">
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}