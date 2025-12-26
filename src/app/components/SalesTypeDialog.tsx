import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { ShoppingCart, Wrench } from "lucide-react";

interface SalesTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: "sale" | "repair") => void;
}

export function SalesTypeDialog({ open, onOpenChange, onSelectType }: SalesTypeDialogProps) {
  const handleSelect = (type: "sale" | "repair") => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>İşlem Türü Seçin</DialogTitle>
          <DialogDescription>
            Yapmak istediğiniz işlemi seçin
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          {/* Ürün Satışı */}
          <Card 
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => handleSelect("sale")}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Ürün Satışı</h3>
                <p className="text-sm text-muted-foreground">
                  Stoktan ürün satışı yapın
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tamir İşlemi */}
          <Card 
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => handleSelect("repair")}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Wrench className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Tamir İşlemi</h3>
                <p className="text-sm text-muted-foreground">
                  Tamir kaydı oluşturun
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
