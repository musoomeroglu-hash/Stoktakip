import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { ShoppingCart, Wrench, Smartphone } from "lucide-react";

interface SalesTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: "sale" | "repair" | "phone") => void;
}

export function SalesTypeDialog({ open, onOpenChange, onSelectType }: SalesTypeDialogProps) {
  const handleSelect = (type: "sale" | "repair" | "phone") => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>İşlem Türü Seçin</DialogTitle>
          <DialogDescription>
            Yapmak istediğiniz işlemi seçin
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-6">
          {/* Tamir İşlemi */}
          <Card 
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => handleSelect("repair")}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Wrench className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Tamir</h3>
                <p className="text-sm text-muted-foreground">
                  Tamir kaydı oluştur
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ürün Satışı */}
          <Card 
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => handleSelect("sale")}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Satış</h3>
                <p className="text-sm text-muted-foreground">
                  Stoktan ürün sat
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Telefon Satışı */}
          <Card 
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all border-2 border-purple-200 dark:border-purple-800"
            onClick={() => handleSelect("phone")}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Telefon Satışı</h3>
                <p className="text-sm text-muted-foreground">
                  İkinci el telefon sat
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}