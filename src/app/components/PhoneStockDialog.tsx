import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Smartphone, Plus, Camera, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import type { PhoneStock } from "../utils/api";

interface PhoneStockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (phoneStock: Omit<PhoneStock, "id" | "createdAt" | "status">) => Promise<void>;
}

export function PhoneStockDialog({ open, onOpenChange, onSave }: PhoneStockDialogProps) {
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [imei, setImei] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const [scannerActive, setScannerActive] = useState(false);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerRunningRef = useRef(false);
    const scannerDivId = "stock-qr-reader";

    // Scanner Effect
    useEffect(() => {
        if (scannerActive && open) {
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
                            setImei(decodedText);
                            setScannerActive(false);
                        },
                        () => { }
                    );

                    scannerRunningRef.current = true;
                } catch (err: any) {
                    if (process.env.NODE_ENV === 'development') console.error("Scanner error:", err);
                    alert("Kamera erişimi sağlanamadı.");
                    setScannerActive(false);
                    html5QrCodeRef.current = null;
                    scannerRunningRef.current = false;
                }
            }, 100);

            return () => clearTimeout(timer);
        } else if (!scannerActive && html5QrCodeRef.current && scannerRunningRef.current) {
            html5QrCodeRef.current.stop().then(() => {
                html5QrCodeRef.current?.clear();
                html5QrCodeRef.current = null;
                scannerRunningRef.current = false;
            }).catch(() => { });
        }
    }, [scannerActive, open]);

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && scannerRunningRef.current) {
                html5QrCodeRef.current.stop().catch(() => { }).finally(() => { scannerRunningRef.current = false; });
                html5QrCodeRef.current = null;
            }
        };
    }, []);

    const resetForm = () => {
        setBrand("");
        setModel("");
        setImei("");
        setPurchasePrice("");
        setSalePrice("");
        setNotes("");
        setScannerActive(false);
    };

    const handleSave = async () => {
        if (!brand.trim() || !model.trim()) {
            toast.error("Lütfen marka ve model girin!");
            return;
        }

        const purchase = parseFloat(purchasePrice);
        const sale = parseFloat(salePrice);

        if (isNaN(purchase) || purchase < 0) {
            toast.error("Geçerli bir alış fiyatı girin!");
            return;
        }

        setLoading(true);
        try {
            await onSave({
                brand: brand.trim(),
                model: model.trim(),
                imei: imei.trim(),
                purchasePrice: purchase,
                salePrice: isNaN(sale) ? 0 : sale,
                notes: notes.trim(),
            });

            resetForm();
            onOpenChange(false);
            toast.success("Telefon stoğu başarıyla eklendi!");
        } catch (error) {
            // Error is already handled in App.tsx toast
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="w-6 h-6 text-indigo-600" />
                        Telefon Stoğu Ekle
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
                                placeholder="Örn: iPhone 15 Pro"
                                className="border-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imei">IMEI / Seri No</Label>
                        <div className="flex gap-2">
                            <Input
                                id="imei"
                                value={imei}
                                onChange={(e) => setImei(e.target.value)}
                                placeholder="IMEI numarasını girin veya okutun"
                                className="border-2"
                                disabled={scannerActive}
                            />
                            <Button
                                type="button"
                                variant={scannerActive ? "destructive" : "outline"}
                                onClick={() => setScannerActive(!scannerActive)}
                                size="icon"
                            >
                                {scannerActive ? <X className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {scannerActive && (
                        <div className="space-y-2">
                            <div id={scannerDivId} className="w-full border-2 border-dashed border-primary rounded-lg overflow-hidden" />
                            <p className="text-sm text-muted-foreground text-center">IMEI barkodunu kamera önüne tutun</p>
                        </div>
                    )}

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
                            <Label htmlFor="salePrice">Hedef Satış Fiyatı (₺)</Label>
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

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ek bilgiler, kondisyon vb."
                            rows={3}
                            className="border-2"
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button onClick={handleClose} variant="outline">İptal</Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                        {loading ? "Ekleniyor..." : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Stoğa Ekle
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
