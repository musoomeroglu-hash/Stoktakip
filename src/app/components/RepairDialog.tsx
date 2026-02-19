import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Wrench, Camera, X, User } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import type { Customer, RepairRecord } from "../utils/api";



interface RepairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (repair: Omit<RepairRecord, "id">) => void;
  customers: Customer[];
}

export function RepairDialog({ open, onOpenChange, onSave, customers }: RepairDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    deviceInfo: "",
    imei: "",
    problemDescription: "",
    repairCost: 0,
    partsCost: 0,
  });

  const [scannerActive, setScannerActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRunningRef = useRef(false);
  const scannerDivId = "qr-reader";

  const profit = formData.repairCost - formData.partsCost;

  // Müşteri seçildiğinde bilgileri doldur
  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "new") {
      setSelectedCustomerId(null);
      setFormData(prev => ({ ...prev, customerName: "", customerPhone: "" }));
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomerId(customerId);
        setFormData(prev => ({
          ...prev,
          customerName: customer.name,
          customerPhone: customer.phone
        }));
      }
    }
  };

  // useEffect to start/stop scanner based on scannerActive state
  useEffect(() => {
    if (scannerActive && open) {
      // Wait a bit for DOM to be ready
      const timer = setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode(scannerDivId);
          html5QrCodeRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              // IMEI okutuldu
              setFormData(prev => ({ ...prev, imei: decodedText }));
              setScannerActive(false);
            },
            (errorMessage) => {
              // Hata mesajlarını ignore ediyoruz (sürekli hata veriyor)
            }
          );

          scannerRunningRef.current = true;
        } catch (err: any) {
          // Sadece geliştirme modunda konsola yaz
          if (process.env.NODE_ENV === 'development') {
            console.error("Scanner başlatma hatası:", err);
          }

          if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
            // Kamera izni reddedildi - sessizce iptal et
            // Kullanıcı zaten red ettiğini biliyor, ekstra uyarıya gerek yok
          } else {
            // Başka bir hata varsa bildir
            alert("Kamera erişimi sağlanamadı. IMEI'yi manuel olarak girebilirsiniz.");
          }

          setScannerActive(false);
          html5QrCodeRef.current = null;
          scannerRunningRef.current = false;
        }
      }, 100);

      return () => clearTimeout(timer);
    } else if (!scannerActive && html5QrCodeRef.current && scannerRunningRef.current) {
      // Stop scanner only if it's running
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
          scannerRunningRef.current = false;
        })
        .catch((err) => {
          console.error("Scanner durdurma hatası:", err);
          html5QrCodeRef.current = null;
          scannerRunningRef.current = false;
        });
    }
  }, [scannerActive, open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && scannerRunningRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => { })
          .finally(() => {
            scannerRunningRef.current = false;
          });
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...formData,
      customerId: selectedCustomerId || undefined,
      profit,
      status: "in_progress",
      createdAt: new Date().toISOString(),
    });

    // Reset form
    setSelectedCustomerId(null);
    setFormData({
      customerName: "",
      customerPhone: "",
      deviceInfo: "",
      imei: "",
      problemDescription: "",
      repairCost: 0,
      partsCost: 0,
    });

    // Stop scanner if active
    if (scannerActive) {
      setScannerActive(false);
    }

    onOpenChange(false);
  };

  const handleClose = () => {
    if (scannerActive) {
      setScannerActive(false);
    }
    // Reset form
    setSelectedCustomerId(null);
    setFormData({
      customerName: "",
      customerPhone: "",
      deviceInfo: "",
      imei: "",
      problemDescription: "",
      repairCost: 0,
      partsCost: 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Tamir Kaydı Oluştur
          </DialogTitle>
          <DialogDescription>
            Tamir bilgilerini doldurun
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Müşteri Bilgileri */}
            <div className="space-y-2">
              <Label htmlFor="customerSelect">Müşteri Seç (Opsiyonel)</Label>
              <Select
                value={selectedCustomerId || "new"}
                onValueChange={handleCustomerSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mevcut müşteri seç veya yeni müşteri">
                    {selectedCustomerId
                      ? customers.find(c => c.id === selectedCustomerId)?.name
                      : "🆕 Yeni Müşteri"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="new" value="new">
                    🆕 Yeni Müşteri
                  </SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Müşteri Adı *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Ad Soyad"
                  required
                  disabled={selectedCustomerId !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefon *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="0555 123 45 67"
                  required
                  disabled={selectedCustomerId !== null}
                />
              </div>
            </div>

            {/* Cihaz Bilgisi */}
            <div className="space-y-2">
              <Label htmlFor="deviceInfo">Cihaz Bilgisi *</Label>
              <Input
                id="deviceInfo"
                value={formData.deviceInfo}
                onChange={(e) => setFormData({ ...formData, deviceInfo: e.target.value })}
                placeholder="Örn: iPhone 13 Pro, Samsung Galaxy S21"
                required
              />
            </div>

            {/* IMEI Alanı */}
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI *</Label>
              <div className="flex gap-2">
                <Input
                  id="imei"
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                  placeholder="IMEI numarasını girin veya okutun"
                  required
                  disabled={scannerActive}
                />
                <Button
                  type="button"
                  variant={scannerActive ? "destructive" : "outline"}
                  onClick={scannerActive ? () => setScannerActive(false) : () => setScannerActive(true)}
                  size="icon"
                >
                  {scannerActive ? <X className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* QR Code Scanner Area */}
            {scannerActive && (
              <div className="space-y-2">
                <div
                  id={scannerDivId}
                  className="w-full border-2 border-dashed border-primary rounded-lg overflow-hidden"
                />
                <p className="text-sm text-muted-foreground text-center">
                  IMEI barkodunu kamera önüne tutun
                </p>
              </div>
            )}

            {/* Arıza Açıklaması */}
            <div className="space-y-2">
              <Label htmlFor="problemDescription">Arıza Açıklaması *</Label>
              <Textarea
                id="problemDescription"
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                placeholder="Cihazın arızasını detaylı açıklayın..."
                rows={3}
                required
              />
            </div>

            {/* Fiyat Bilgileri */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repairCost">Tamir Ücreti (₺) *</Label>
                <Input
                  id="repairCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.repairCost}
                  onChange={(e) => setFormData({ ...formData, repairCost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partsCost">Malzeme Maliyeti (₺) *</Label>
                <Input
                  id="partsCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.partsCost}
                  onChange={(e) => setFormData({ ...formData, partsCost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Kâr Gösterimi */}
            <div className={`p-4 rounded-lg border-2 ${profit > 0
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                : profit < 0
                  ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                  : 'bg-muted border-border'
              }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Kâr:</span>
                <span className={`text-2xl font-bold ${profit > 0
                    ? 'text-green-600 dark:text-green-400'
                    : profit < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  }`}>
                  ₺{profit.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tamir Ücreti - Malzeme Maliyeti
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit">
              Tamir Kaydı Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}