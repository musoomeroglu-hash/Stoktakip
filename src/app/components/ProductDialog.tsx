import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Product, Category } from "../utils/api";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Omit<Product, "id"> | Product) => void;
  categories: Category[];
  editProduct?: Product | null;
}

export function ProductDialog({ open, onOpenChange, onSave, categories, editProduct }: ProductDialogProps) {
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    categoryId: "",
    stock: 0,
    minStock: 0,
    purchasePrice: 0,
    salePrice: 0,
    barcode: "",
    description: "",
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (editProduct) {
      setFormData(editProduct);
    } else {
      setFormData({
        name: "",
        categoryId: "",
        stock: 0,
        minStock: 0,
        purchasePrice: 0,
        salePrice: 0,
        barcode: "",
        description: "",
        createdAt: new Date().toISOString(),
      });
    }
  }, [editProduct, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      return; // Don't submit if no category selected
    }
    
    if (editProduct) {
      onSave({ ...formData, id: editProduct.id } as Product);
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  const profitMargin = formData.salePrice && formData.purchasePrice
    ? ((formData.salePrice - formData.purchasePrice) / formData.purchasePrice * 100).toFixed(1)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
          <DialogDescription>
            Ürün bilgilerini eksiksiz doldurun
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ürün Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat.id && cat.parentId).map((cat) => {
                    const parentCat = categories.find(c => c.id === cat.parentId);
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        {parentCat?.name} → {cat.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sadece alt kategoriler gösteriliyor
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barkod</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Opsiyonel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stok Miktarı *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stok *</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Alış Fiyatı (₺) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Satış Fiyatı (₺) *</Label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="col-span-2 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Kâr Marjı:</span>{" "}
                <span className="text-lg font-semibold text-green-600">%{profitMargin}</span>
                {formData.salePrice > 0 && formData.purchasePrice > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    (₺{(formData.salePrice - formData.purchasePrice).toFixed(2)} kâr/adet)
                  </span>
                )}
              </p>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Ürün hakkında notlar..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit">
              {editProduct ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}