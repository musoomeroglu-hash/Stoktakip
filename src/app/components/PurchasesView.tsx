import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
    ShoppingCart,
    Plus,
    Search,
    Calendar,
    FileText,
    ChevronRight,
    Trash2,
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingDown,
    Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { api, type Purchase, type Supplier, type Product, type PurchaseStatus, type PurchasePaymentMethod } from "../utils/api";

interface PurchasesViewProps {
    isPrivacyMode: boolean;
}

export function PurchasesView({ isPrivacyMode }: PurchasesViewProps) {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    // Form State
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PurchasePaymentMethod>("nakit");
    const [purchaseItems, setPurchaseItems] = useState<{ productId: string, quantity: number, unitCost: number }[]>([]);
    const [discount, setDiscount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [purchasesData, suppliersData, productsData] = await Promise.all([
                api.getPurchases(),
                api.getSuppliers(),
                api.getProducts()
            ]);
            setPurchases(purchasesData);
            setSuppliers(suppliersData);
            setProducts(productsData);
        } catch (error) {
            toast.error("Veriler yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setPurchaseItems([...purchaseItems, { productId: "", quantity: 1, unitCost: 0 }]);
    };

    const removeItem = (index: number) => {
        setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...purchaseItems];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill cost if product selected
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index].unitCost = product.purchasePrice;
            }
        }

        setPurchaseItems(newItems);
    };

    const subtotal = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const total = Math.max(0, subtotal - discount);

    const handleSavePurchase = async () => {
        if (!selectedSupplierId) {
            toast.error("Lütfen bir tedarikçi seçin");
            return;
        }
        if (purchaseItems.length === 0 || purchaseItems.some(i => !i.productId)) {
            toast.error("Lütfen en az bir geçerli ürün ekleyin");
            return;
        }

        try {
            const status: PurchaseStatus = paidAmount >= total ? 'odendi' : (paidAmount > 0 ? 'kismi_odendi' : 'odenmedi');

            await api.addPurchase({
                supplier_id: selectedSupplierId,
                purchase_date: purchaseDate,
                invoice_number: invoiceNumber,
                status,
                payment_method: paymentMethod,
                subtotal,
                discount,
                total,
                paid_amount: paidAmount,
                remaining: total - paidAmount,
                currency: 'TRY',
                exchange_rate: 1,
                notes,
                items: purchaseItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    totalCost: item.quantity * item.unitCost
                })) as any
            });

            toast.success("Alış faturası başarıyla kaydedildi");
            setDialogOpen(false);
            resetForm();
            loadInitialData();
        } catch (error) {
            toast.error("Kaydedilirken bir hata oluştu");
        }
    };

    const resetForm = () => {
        setSelectedSupplierId("");
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setInvoiceNumber("");
        setPaymentMethod("nakit");
        setPurchaseItems([]);
        setDiscount(0);
        setPaidAmount(0);
        setNotes("");
    };

    const getStatusBadge = (status: PurchaseStatus) => {
        switch (status) {
            case 'odendi': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Ödendi</Badge>;
            case 'kismi_odendi': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Kısmi Ödendi</Badge>;
            case 'odenmedi': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Ödenmedi</Badge>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 text-orange-600" />
                        Alış Yönetimi
                    </h2>
                    <p className="text-muted-foreground text-sm">Ürün girişleri ve fatura takibi</p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Alış
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Toplam Fatura</p>
                            <p className="text-xl font-bold">{purchases.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Toplam Alış</p>
                            <p className={`text-xl font-bold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                                ₺{purchases.reduce((sum, p) => sum + p.total, 0).toLocaleString('tr-TR')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold">Tarih</th>
                                <th className="text-left p-4 font-semibold">Tedarikçi</th>
                                <th className="text-left p-4 font-semibold">Fatura No</th>
                                <th className="text-right p-4 font-semibold">Tutar</th>
                                <th className="text-center p-4 font-semibold">Durum</th>
                                <th className="text-right p-4 font-semibold">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {purchases.length > 0 ? purchases.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            {new Date(p.purchase_date).toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium">{p.supplier?.name || "Bilinmeyen"}</td>
                                    <td className="p-4 text-muted-foreground">{p.invoice_number || "—"}</td>
                                    <td className={`p-4 text-right font-bold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                                        ₺{p.total.toLocaleString('tr-TR')}
                                    </td>
                                    <td className="p-4 text-center">{getStatusBadge(p.status)}</td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Yakında: Fatura Detayı")}>
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                        Henüz alış kaydı bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* New Purchase Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Yeni Alış Faturası</DialogTitle>
                        <DialogDescription>Stok girişi yapmak için faturayı doldurun.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                        {/* Left Column: Basic Info */}
                        <div className="md:col-span-1 space-y-4 border-r pr-6 border-slate-100 dark:border-slate-800">
                            <div className="space-y-2">
                                <Label>Tedarikçi *</Label>
                                <select
                                    className="w-full h-11 border rounded-md px-3 bg-background"
                                    value={selectedSupplierId}
                                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                                >
                                    <option value="">Tedarikçi Seçin</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fatura Tarihi</Label>
                                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Fatura Numarası</Label>
                                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Örn: FTR123" />
                            </div>

                            <div className="space-y-2">
                                <Label>Ödeme Şekli</Label>
                                <select
                                    className="w-full h-11 border rounded-md px-3 bg-background"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                >
                                    <option value="nakit">Nakit</option>
                                    <option value="havale">Havale / EFT</option>
                                    <option value="kart">Kredi Kartı</option>
                                    <option value="vadeli">Vadeli</option>
                                </select>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                                <Button variant="ghost" className="w-full justify-start text-xs h-8" onClick={() => toast.info("Dosya yükleme yakında eklenecek")}>
                                    <ImageIcon className="w-3 h-3 mr-2" /> Fatura Fotoğrafı Ekle
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: Items and Totals */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-bold">Alınan Ürünler</Label>
                                    <Button size="sm" variant="outline" onClick={handleAddItem} className="h-8">
                                        <Plus className="w-3 h-3 mr-1" /> Ürün Ekle
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {purchaseItems.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-end p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Ürün</Label>
                                                <select
                                                    className="w-full h-10 border rounded-md px-2 bg-background text-sm"
                                                    value={item.productId}
                                                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                >
                                                    <option value="">Ürün Seçin</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-20 space-y-1">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Adet</Label>
                                                <Input
                                                    type="number"
                                                    className="h-10 px-2"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <div className="w-28 space-y-1">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Maliyet</Label>
                                                <Input
                                                    type="number"
                                                    className="h-10 px-2"
                                                    value={item.unitCost}
                                                    onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500" onClick={() => removeItem(index)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {purchaseItems.length === 0 && (
                                        <div className="py-8 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                                            Alış kalemlerini eklemek için "Ürün Ekle" butonuna basın.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Totals Section */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl space-y-4 border">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Ara Toplam:</span>
                                    <span className="font-bold">₺{subtotal.toLocaleString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">İndirim:</span>
                                        <Input
                                            type="number"
                                            className="h-7 w-20 text-xs text-right"
                                            value={discount}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <span className="font-bold text-red-600">- ₺{discount.toLocaleString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-dashed pt-4">
                                    <span className="text-lg font-bold">Genel Toplam:</span>
                                    <span className="text-2xl font-black text-orange-600">₺{total.toLocaleString('tr-TR')}</span>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-green-600">Peşin Ödenen:</span>
                                        <Input
                                            type="number"
                                            className="h-9 w-32 font-bold text-right"
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Kalan Borç</p>
                                        <p className="text-lg font-bold text-red-600">₺{(total - paidAmount).toLocaleString('tr-TR')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Notlar</Label>
                                <Textarea placeholder="Alışla ilgili notlar..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleSavePurchase} className="bg-orange-600 hover:bg-orange-700 min-w-[150px]">
                            Faturayı Kaydet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
