import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Banknote, CreditCard, ArrowRightLeft, DollarSign, TextIcon, User, Phone } from "lucide-react";
import type { PhoneStock, PhoneSale, PaymentMethod } from "../utils/api";

interface PhoneSellDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (saleData: Omit<PhoneSale, "id" | "createdAt" | "profit">) => void;
    phoneStock: PhoneStock | null;
    formatPrice: (price: number) => string;
}

export function PhoneSellDialog({ isOpen, onClose, onConfirm, phoneStock, formatPrice }: PhoneSellDialogProps) {
    const [salePrice, setSalePrice] = useState<string>("");
    const [purchasePrice, setPurchasePrice] = useState<string>("");
    const [customerName, setCustomerName] = useState<string>("");
    const [customerPhone, setCustomerPhone] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [saleDate, setSaleDate] = useState<string>(
        new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('.').reverse().join('-')
    );

    useEffect(() => {
        if (isOpen && phoneStock) {
            setPurchasePrice(phoneStock.purchasePrice.toString());
            setSalePrice(phoneStock.salePrice.toString()); // Varsayılan hedef satış fiyatı
            setCustomerName("");
            setCustomerPhone("");
            setNotes("");
            setPaymentMethod("cash");
            setSaleDate(new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('.').reverse().join('-'));
        }
    }, [isOpen, phoneStock]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneStock) return;

        const parsedSalePrice = parseFloat(salePrice);
        const parsedPurchasePrice = parseFloat(purchasePrice);

        if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
            alert("Lütfen geçerli bir satış fiyatı girin.");
            return;
        }

        if (isNaN(parsedPurchasePrice) || parsedPurchasePrice < 0) {
            alert("Lütfen geçerli bir alış fiyatı girin.");
            return;
        }

        onConfirm({
            brand: phoneStock.brand,
            model: phoneStock.model,
            imei: phoneStock.imei || "Belirtilmedi",
            purchasePrice: parsedPurchasePrice,
            salePrice: parsedSalePrice,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            notes: notes.trim(),
            date: saleDate, // selected date
            paymentMethod,
        });
    };

    if (!phoneStock) return null;

    const currentProfit = parseFloat(salePrice) - parseFloat(purchasePrice);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Telefonu Sat</DialogTitle>
                    <DialogDescription>
                        {phoneStock.brand} {phoneStock.model} (IMEI: {phoneStock.imei || "Yok"}) satış işlemini tamamla.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="purchasePrice" className="text-orange-600 dark:text-orange-400">Geliş Fiyatı (₺)</Label>
                            <Input
                                id="purchasePrice"
                                type="number"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                required
                                className="border-orange-200 focus-visible:ring-orange-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salePrice" className="text-blue-600 dark:text-blue-400">Satış Fiyatı (₺)</Label>
                            <Input
                                id="salePrice"
                                type="number"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                                required
                                className="border-blue-200 focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>

                    {!isNaN(currentProfit) && (
                        <div className="text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border">
                            <span className="text-muted-foreground">Oluşacak Kâr:</span>
                            <span className={`font-bold ${currentProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {currentProfit >= 0 ? '+' : ''}{formatPrice(currentProfit)}
                            </span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
                        <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Ödeme yöntemi seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">
                                    <div className="flex items-center gap-2">
                                        <Banknote className="w-4 h-4 text-green-600" />
                                        Nakit
                                    </div>
                                </SelectItem>
                                <SelectItem value="card">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-600" />
                                        Kredi Kartı
                                    </div>
                                </SelectItem>
                                <SelectItem value="transfer">
                                    <div className="flex items-center gap-2">
                                        <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                                        Havale/EFT
                                    </div>
                                </SelectItem>
                                <SelectItem value="mixed">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-orange-600" />
                                        Karışık
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customerName" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Müşteri Adı - Soyadı <span className="text-muted-foreground text-xs">(Opsiyonel)</span>
                        </Label>
                        <Input
                            id="customerName"
                            placeholder="Örn: Ahmet Yılmaz"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customerPhone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Müşteri Telefonu <span className="text-muted-foreground text-xs">(Opsiyonel)</span>
                        </Label>
                        <Input
                            id="customerPhone"
                            placeholder="Örn: 0555 123 45 67"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="saleDate" className="flex items-center gap-2">
                            Tarih
                        </Label>
                        <Input
                            id="saleDate"
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="flex items-center gap-2">
                            <TextIcon className="w-4 h-4" />
                            Notlar <span className="text-muted-foreground text-xs">(Opsiyonel)</span>
                        </Label>
                        <textarea
                            id="notes"
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Aksesuar hediye edildi, ekran koruyucu takıldı vb."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            İptal
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Satışı Tamamla
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
