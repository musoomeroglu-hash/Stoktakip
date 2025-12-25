import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PackagePlus, PackageMinus } from "lucide-react";

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  currentStock: number;
  onAdjust: (amount: number) => void;
}

export function StockAdjustDialog({ open, onOpenChange, productName, currentStock, onAdjust }: StockAdjustDialogProps) {
  const [amount, setAmount] = useState(0);

  const handleSubmit = (type: "add" | "remove") => {
    const adjustment = type === "add" ? amount : -amount;
    if (amount > 0 && (type === "add" || amount <= currentStock)) {
      onAdjust(adjustment);
      setAmount(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Stok Ayarla</DialogTitle>
          <DialogDescription>
            {productName} için stok miktarını ayarlayın
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Mevcut Stok</p>
            <p className="text-2xl font-semibold">{currentStock} Adet</p>
          </div>
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">
                <PackagePlus className="w-4 h-4 mr-2" />
                Stok Ekle
              </TabsTrigger>
              <TabsTrigger value="remove">
                <PackageMinus className="w-4 h-4 mr-2" />
                Stok Çıkar
              </TabsTrigger>
            </TabsList>
            <TabsContent value="add" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-amount">Eklenecek Miktar</Label>
                <Input
                  id="add-amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="Miktar girin"
                />
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm">
                  Yeni Stok: <span className="font-semibold">{currentStock + amount}</span> Adet
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  İptal
                </Button>
                <Button type="button" onClick={() => handleSubmit("add")} disabled={amount <= 0}>
                  Ekle
                </Button>
              </DialogFooter>
            </TabsContent>
            <TabsContent value="remove" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remove-amount">Çıkarılacak Miktar</Label>
                <Input
                  id="remove-amount"
                  type="number"
                  min="1"
                  max={currentStock}
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="Miktar girin"
                />
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm">
                  Yeni Stok: <span className="font-semibold">{Math.max(0, currentStock - amount)}</span> Adet
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  İptal
                </Button>
                <Button 
                  type="button" 
                  onClick={() => handleSubmit("remove")} 
                  disabled={amount <= 0 || amount > currentStock}
                  variant="destructive"
                >
                  Çıkar
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}