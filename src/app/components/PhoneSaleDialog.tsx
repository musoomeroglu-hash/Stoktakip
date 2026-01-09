import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Smartphone, Plus, User } from "lucide-react";
import { toast } from "sonner";
import type { PaymentMethod, PaymentDetails, Customer } from "../utils/api";

export interface PhoneSale {
  id: string;
  brand: string;
  model: string;
  imei: string;
  purchasePrice: number;
  salePrice: number;
  profit: number;
  customerName: string;
  customerPhone: string;
  notes: string;
  date: string;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
}

interface PhoneSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (phoneSale: PhoneSale) => void;
  customers: Customer[];
}

export function PhoneSaleDialog({ open, onOpenChange, onSave, customers }: PhoneSaleDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [imei, setImei] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Müşteri seçildiğinde bilgileri doldur
  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "new") {
      setSelectedCustomerId(null);
      setCustomerName("");
      setCustomerPhone("");
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomerId(customerId);
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
      }
    }
  };

  const resetForm = () => {
    setSelectedCustomerId(null);
    setBrand("");
    setModel("");
    setImei("");
    setPurchasePrice("");
    setSalePrice("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  };

  const handleSave = () => {
    // Validations
    if (!brand.trim()) {
      toast.error("Lütfen marka girin!");
      return;
    }
    if (!model.trim()) {
      toast.error("Lütfen model girin!");
      return;
    }
    
    const purchase = parseFloat(purchasePrice);
    const sale = parseFloat(salePrice);
    
    if (isNaN(purchase) || purchase < 0) {
      toast.error("Lütfen geçerli bir alış fiyatı girin!");
      return;
    }
    if (isNaN(sale) || sale <= 0) {
      toast.error("Lütfen geçerli bir satış fiyatı girin!");
      return;
    }

    const profit = sale - purchase;

    const phoneSale: PhoneSale = {
      id: Date.now().toString(),
      brand: brand.trim(),
      model: model.trim(),
      imei: imei.trim(),
      purchasePrice: purchase,
      salePrice: sale,
      profit: profit,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      notes: notes.trim(),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    onSave(phoneSale);
    resetForm();
    onOpenChange(false);
    toast.success("Telefon satışı başarıyla kaydedildi!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-purple-600" />
            Telefon Satışı
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Müşteri Seçimi */}
          <div className="space-y-2">
            <Label htmlFor="customerSelect">Müşteri Seç (Opsiyonel)</Label>
            <Select
              value={selectedCustomerId || "new"}
              onValueChange={handleCustomerSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Müşteri seçin">
                  {selectedCustomerId 
                    ? customers.find(c => c.id === selectedCustomerId)?.name 
                    : "🆕 Yeni Müşteri"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">🆕 Yeni Müşteri</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Müşteri Bilgileri */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Müşteri Adı</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="İsim Soyisim"
                disabled={selectedCustomerId !== null}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Müşteri Telefon</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                disabled={selectedCustomerId !== null}
              />
            </div>
          </div>

          {/* Marka ve Model */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marka *</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Örn: Apple, Samsung"
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Örn: iPhone 14 Pro"
                className="border-2"
              />
            </div>
          </div>

          {/* IMEI */}
          <div className="space-y-2">
            <Label htmlFor="imei">IMEI / Seri No</Label>
            <Input
              id="imei"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              placeholder="35xxxxxxxxxx"
              className="border-2"
            />
          </div>

          {/* Fiyatlar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Alış Fiyatı (₺) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="border-2 border-orange-200 dark:border-orange-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Satış Fiyatı (₺) *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="0.00"
                className="border-2 border-green-200 dark:border-green-700"
              />
            </div>
          </div>

          {/* Kâr Göstergesi */}
          {purchasePrice && salePrice && !isNaN(parseFloat(purchasePrice)) && !isNaN(parseFloat(salePrice)) && (
            <div className={`p-4 rounded-lg border-2 ${
              parseFloat(salePrice) - parseFloat(purchasePrice) >= 0 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700'
            }`}>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Tahmini Kâr</p>
                <p className={`text-2xl font-bold ${
                  parseFloat(salePrice) - parseFloat(purchasePrice) >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {parseFloat(salePrice) - parseFloat(purchasePrice) >= 0 ? '₺' : '-₺'}
                  {Math.abs(parseFloat(salePrice) - parseFloat(purchasePrice)).toLocaleString('tr-TR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Notlar */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ek bilgiler, aksesuarlar vb."
              rows={3}
              className="border-2"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            variant="outline"
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Satışı Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}