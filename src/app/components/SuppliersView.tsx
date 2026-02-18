// VERSION_V3_DIRECT_REFIX
import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
    Building2,
    Plus,
    Search,
    Phone,
    MessageCircle,
    History,
    Edit,
    Trash2,
    MapPin,
    CreditCard,
    User,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { api, type Supplier } from "../utils/api";

interface SuppliersViewProps {
    isPrivacyMode: boolean;
}

export function SuppliersView({ isPrivacyMode }: SuppliersViewProps) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        contact_name: "",
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        city: "",
        notes: "",
        payment_terms: "pesin" as 'pesin' | 'vadeli' | 'konsinyasyon',
        currency: "TRY" as 'TRY' | 'USD' | 'EUR',
    });

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const data = await api.getSuppliers();
            setSuppliers(data);
        } catch (error: any) {
            toast.error(`⚠️ HATA DETAYI: ${error.message || "Bilinmeyen API Hatası"}`);
            console.error("Tedarikçi yükleme hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                contact_name: supplier.contact_name || "",
                phone: supplier.phone || "",
                whatsapp: supplier.whatsapp || "",
                email: supplier.email || "",
                address: supplier.address || "",
                city: supplier.city || "",
                notes: supplier.notes || "",
                payment_terms: supplier.payment_terms,
                currency: supplier.currency,
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: "",
                contact_name: "",
                phone: "",
                whatsapp: "",
                email: "",
                address: "",
                city: "",
                notes: "",
                payment_terms: "pesin",
                currency: "TRY",
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Lütfen tedarikçi adını girin");
            return;
        }

        try {
            if (editingSupplier) {
                await api.updateSupplier(editingSupplier.id, formData);
                toast.success("Tedarikçi güncellendi");
            } else {
                await api.addSupplier({
                    ...formData,
                    is_active: true,
                });
                toast.success("Tedarikçi eklendi");
            }
            setDialogOpen(false);
            loadSuppliers();
        } catch (error: any) {
            toast.error(`Kaydedilirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
            console.error("Tedarikçi kaydetme hatası:", error);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`${name} tedarikçisini silmek istediğinize emin misiniz?`)) {
            try {
                await api.deleteSupplier(id);
                toast.success("Tedarikçi silindi");
                loadSuppliers();
            } catch (error) {
                toast.error("Silinirken bir hata oluştu");
            }
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalDebt = suppliers.reduce((sum, s) => sum + s.balance, 0);

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        Tedarikçi Yönetimi
                    </h2>
                    <p className="text-muted-foreground text-sm">Tüm tedarikçileriniz ve bakiye durumları</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 py-2 px-4 flex-1 md:flex-none">
                        <div className="text-[10px] text-orange-600 dark:text-orange-400 uppercase font-bold tracking-wider">Toplam Borç</div>
                        <div className={`text-xl font-bold text-orange-700 dark:text-orange-300 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            ₺{totalDebt.toLocaleString('tr-TR')}
                        </div>
                    </Card>

                    <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Yeni Tedarikçi</span>
                        <span className="sm:hidden">Ekle</span>
                    </Button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Tedarikçi adı veya şehir ara..."
                    className="pl-10 h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Suppliers Grid/List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse h-48 bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            ) : filteredSuppliers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSuppliers.map((supplier) => (
                        <Card key={supplier.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="p-4 pb-2 border-b bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                                        {supplier.contact_name && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <User className="w-3 h-3" />
                                                {supplier.contact_name}
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant={supplier.balance > 0 ? "destructive" : "outline"} className={isPrivacyMode ? "privacy-mode-blur" : ""}>
                                        {supplier.balance > 0 ? `Borç: ₺${supplier.balance.toLocaleString('tr-TR')}` : "Borç Yok"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">İletişim</div>
                                        <div className="flex flex-col gap-1">
                                            {supplier.phone && (
                                                <a href={`tel:${supplier.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                                                    <Phone className="w-3 h-3" />
                                                    {supplier.phone}
                                                </a>
                                            )}
                                            {supplier.whatsapp && (
                                                <a href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                                                    <MessageCircle className="w-3 h-3" />
                                                    WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Konum</div>
                                        <div className="flex items-center justify-end gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {supplier.city || "—"}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-between items-center border-t">
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => toast.info("Yakında: Alış Geçmişi")}>
                                            <History className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => handleOpenDialog(supplier)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(supplier.id, supplier.name)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => toast.info("Yakında: Tedarikçi Detayı")}>
                                        Detay <ExternalLink className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-2 py-12">
                    <CardContent className="flex flex-col items-center justify-center text-muted-foreground">
                        <Building2 className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-lg font-medium">Tedarikçi bulunamadı</p>
                        <p className="text-sm">Arama kriterlerinizi değiştirin veya yeni bir tedarikçi ekleyin.</p>
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? "Tedarikçiyi Düzenle" : "Yeni Tedarikçi Ekle"}</DialogTitle>
                        <DialogDescription>Tedarikçi bilgilerini eksiksiz doldurun.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Firma Adı *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Örn: ABC Elektronik"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_name">İlgili Kişi</Label>
                            <Input
                                id="contact_name"
                                value={formData.contact_name}
                                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                placeholder="Örn: Ahmet Bey"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="05xxx xxx xx xx"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input
                                id="whatsapp"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                placeholder="05xxx xxx xx xx"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Şehir</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Örn: İstanbul"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_terms">Ödeme Tercihi</Label>
                            <select
                                id="payment_terms"
                                className="w-full h-11 border rounded-md px-3 bg-background"
                                value={formData.payment_terms}
                                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value as any })}
                            >
                                <option value="pesin">Peşin</option>
                                <option value="vadeli">Vadeli</option>
                                <option value="konsinyasyon">Konsinyasyon</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Adres</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Detaylı adres bilgisi..."
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="notes">Özel Notlar</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Tedarikçi hakkında notlar..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Kaydet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
