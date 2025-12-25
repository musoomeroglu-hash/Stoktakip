import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Smartphone, Plus } from "lucide-react";
import { toast } from "sonner";

interface AddPhoneModelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (brand: string, model: string) => void;
  existingBrands: string[];
}

export function AddPhoneModel({ open, onOpenChange, onAdd, existingBrands }: AddPhoneModelProps) {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [model, setModel] = useState("");
  const [useNewBrand, setUseNewBrand] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const brand = useNewBrand ? newBrand : selectedBrand;
    
    if (!brand || !model) {
      toast.error("Marka ve model bilgisi gerekli");
      return;
    }

    onAdd(brand, model);
    
    // Reset form
    setSelectedBrand("");
    setNewBrand("");
    setModel("");
    setUseNewBrand(false);
    onOpenChange(false);
    
    toast.success("Telefon modeli eklendi!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Yeni Telefon Modeli Ekle
          </DialogTitle>
          <DialogDescription>
            Ürün eklerken kullanılacak yeni telefon modeli tanımlayın
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Button
                type="button"
                variant={!useNewBrand ? "default" : "outline"}
                size="sm"
                onClick={() => setUseNewBrand(false)}
                className="flex-1"
              >
                Mevcut Marka
              </Button>
              <Button
                type="button"
                variant={useNewBrand ? "default" : "outline"}
                size="sm"
                onClick={() => setUseNewBrand(true)}
                className="flex-1"
              >
                Yeni Marka
              </Button>
            </div>

            {!useNewBrand ? (
              <div className="space-y-2">
                <Label htmlFor="brand">Marka Seçin *</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand} required>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingBrands.sort().map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="new-brand">Yeni Marka Adı *</Label>
                <Input
                  id="new-brand"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Örn: Apple, Samsung"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="model">Model Adı *</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Örn: iPhone 16 Pro Max"
                required
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm">
                {useNewBrand && newBrand && model && (
                  <span className="font-medium">{newBrand} {model}</span>
                )}
                {!useNewBrand && selectedBrand && model && (
                  <span className="font-medium">{selectedBrand} {model}</span>
                )}
                {!(model && (useNewBrand ? newBrand : selectedBrand)) && (
                  <span className="text-muted-foreground">Önizleme...</span>
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Ekle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
