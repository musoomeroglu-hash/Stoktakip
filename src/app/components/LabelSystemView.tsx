"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
    Printer,
    Plus,
    Trash2,
    FileSpreadsheet,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    Search,
    ChevronRight,
    Tag as TagIcon
} from "lucide-react";
import { toast } from "sonner";

interface LabelData {
    id: string;
    productName: string;
    price: number;
    barcode: string;
    category?: string;
}

const CATEGORIES = [
    "Tümü",
    "Kılıf",
    "MagSafe Kılıf",
    "Şeffaf Kılıf",
    "Sert Silikon Kılıf",
    "Ekran Koruyucu",
    "Kamera & Lens Koruyucu",
    "Kablo & Adaptör",
    "Kulaklık & Ses",
    "Hoparlör",
    "Powerbank",
    "Şarj Ürünleri",
    "Diğer"
];

const BarkodSVG = ({ seed }: { seed: string }) => {
    // Simple barcode line generation
    const genislikler: number[] = [];
    let toplam = 0;
    const s = seed || '0000000000000';
    for (let i = 0; i < s.length * 2 + 10; i++) {
        const c = s.charCodeAt(i % s.length);
        const g = (c * (i + 1) * 7 % 3) + 1;
        genislikler.push(g);
        toplam += g + 1;
    }

    const scale = 155 / toplam;
    let x = 0;
    const bars: React.ReactNode[] = [];

    for (let i = 0; i < genislikler.length; i++) {
        if (i % 2 === 0) {
            bars.push(
                <rect
                    key={i}
                    x={(x * scale).toFixed(1)}
                    y="0"
                    width={(genislikler[i] * scale).toFixed(1)}
                    height="28"
                    fill="white"
                />
            );
        }
        x += genislikler[i] + 1;
    }

    return (
        <svg className="w-full h-8" viewBox="0 0 155 28" xmlns="http://www.w3.org/2000/svg" style={{ background: '#0d1b35' }}>
            {bars}
        </svg>
    );
};

export function LabelSystemView() {
    const [labels, setLabels] = useState<LabelData[]>([]);
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [singleForm, setSingleForm] = useState({
        productName: "",
        price: "",
        barcode: "",
        category: "Diğer"
    });
    const [bulkData, setBulkData] = useState("");
    const [viewMode, setViewMode] = useState<"form" | "bulk">("form");

    const filteredLabels = useMemo(() => {
        if (activeCategory === "Tümü") return labels;
        return labels.filter(l =>
            l.category === activeCategory ||
            l.productName.toLowerCase().includes(activeCategory.toLowerCase())
        );
    }, [labels, activeCategory]);

    const handleAddSingle = () => {
        if (!singleForm.productName || !singleForm.price) {
            toast.error("Ürün adı ve fiyat zorunludur");
            return;
        }

        const newLabel: LabelData = {
            id: crypto.randomUUID(),
            productName: singleForm.productName,
            price: Number(singleForm.price.replace(/[^0-9.,]/g, '').replace(',', '.')),
            barcode: singleForm.barcode || "0000000000000",
            category: singleForm.category
        };

        setLabels(prev => [newLabel, ...prev]);
        setSingleForm({ productName: "", price: "", barcode: "", category: "Diğer" });
        toast.success("Etiket eklendi");
    };

    const handleBulkUpload = () => {
        if (!bulkData.trim()) return;

        const lines = bulkData.trim().split('\n');
        const newLabels: LabelData[] = [];

        lines.forEach(line => {
            const parts = line.split('\t');
            if (parts.length >= 1 && parts[0].trim()) {
                newLabels.push({
                    id: crypto.randomUUID(),
                    productName: parts[0]?.trim() || '',
                    price: parts[1] ? Number(parts[1].trim().replace(/[^0-9.,]/g, '').replace(',', '.')) : 0,
                    barcode: parts[2]?.trim() || '8690000' + Math.floor(Math.random() * 1000000),
                    category: "Diğer" // Bulk data often lacks category, default to Diğer
                });
            }
        });

        if (newLabels.length > 0) {
            setLabels(prev => [...newLabels, ...prev]);
            setBulkData("");
            toast.success(`${newLabels.length} etiket başarıyla eklendi`);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const clearAll = () => {
        if (window.confirm("Tüm etiketleri silmek istediğinize emin misiniz?")) {
            setLabels([]);
            toast.success("Tüm etiketler temizlendi");
        }
    };

    const deleteLabel = (id: string) => {
        setLabels(prev => prev.filter(l => l.id !== id));
    };

    return (
        <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
            {/* Header / Printing Control */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TagIcon className="h-6 w-6 text-blue-600" />
                        Fiyat Etiketi Sistemi
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Ürünleriniz için premium tasarımlı etiketler oluşturun ve yazdırın.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={clearAll} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Tümünü Temizle
                    </Button>
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                        <Printer className="h-4 w-4 mr-2" />
                        Yazdır
                    </Button>
                </div>
            </div>

            {/* Config Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
                {/* Mode Selector & Input */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                ETİKET EKLE
                            </CardTitle>
                            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
                                <Button
                                    variant={viewMode === "form" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("form")}
                                    className="h-7 text-xs"
                                >
                                    Tek Etiket
                                </Button>
                                <Button
                                    variant={viewMode === "bulk" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("bulk")}
                                    className="h-7 text-xs"
                                >
                                    Excel'den Yükle
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {viewMode === "form" ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Ürün Adı</label>
                                        <Input
                                            placeholder="Örn: iPhone 15 Pro Max"
                                            value={singleForm.productName}
                                            onChange={(e) => setSingleForm({ ...singleForm, productName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Fiyat (₺)</label>
                                        <Input
                                            placeholder="Örn: 45.999"
                                            value={singleForm.price}
                                            onChange={(e) => setSingleForm({ ...singleForm, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Barkod</label>
                                        <Input
                                            placeholder="Örn: 869012345678"
                                            value={singleForm.barcode}
                                            onChange={(e) => setSingleForm({ ...singleForm, barcode: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Kategori</label>
                                        <select
                                            className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                                            value={singleForm.category}
                                            onChange={(e) => setSingleForm({ ...singleForm, category: e.target.value })}
                                        >
                                            {CATEGORIES.filter(c => c !== "Tümü").map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <Button className="w-full" onClick={handleAddSingle}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Listeye Ekle
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <div className="font-bold flex items-center gap-1 mb-1 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                        <FileSpreadsheet className="h-3 w-3 text-emerald-500" />
                                        Excel Formatı
                                    </div>
                                    Excel'den <b>Ürün Adı [Tab] Fiyat [Tab] Barkod</b> kolonlarını kopyalayıp buraya yapıştırın. Her satır bir üründür.
                                </div>
                                <Textarea
                                    className="min-h-[120px] font-mono text-xs"
                                    placeholder="Ürün Adı	Fiyat	Barkod"
                                    value={bulkData}
                                    onChange={(e) => setBulkData(e.target.value)}
                                />
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleBulkUpload}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Toplu Veriyi Yükle
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Filter / Stats Panel */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            FİLTRE VE İSTATİSTİK
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">TOPLAM</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{labels.length}</p>
                                <p className="text-[10px] font-medium text-slate-500 mt-1">ETİKET HAZIR</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">GÖSTERİLEN</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{filteredLabels.length}</p>
                                <p className="text-[10px] font-medium text-slate-500 mt-1">{activeCategory.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                <LayoutGrid className="h-3 w-3" />
                                Kategoriye Göre Filtrele
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <Badge
                                        key={cat}
                                        variant={activeCategory === cat ? "default" : "outline"}
                                        className={`cursor-pointer px-3 py-1 text-[11px] font-medium transition-all ${activeCategory === cat ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Labels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 print:flex print:flex-wrap print:gap-4 justify-items-center">
                {filteredLabels.length > 0 ? (
                    filteredLabels.map((label) => (
                        <div key={label.id} className="group relative transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Actions Overlay */}
                            <div className="absolute -top-2 -right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-7 w-7 rounded-full shadow-lg"
                                    onClick={() => deleteLabel(label.id)}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                {/* The Label itself */}
                                <div className="w-[189px] h-[189px] bg-[#0d1b35] rounded-xl flex flex-col items-center justify-between p-3 relative overflow-hidden shadow-xl shadow-slate-950/20 print:shadow-none print:w-[50mm] print:h-[50mm] print:border print:border-slate-300">
                                    {/* Accent line top-right */}
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-blue-500/10 rounded-bl-[100%] rounded-tr-xl pointer-events-none" />

                                    {/* Logo */}
                                    <div className="flex items-center gap-0.5 leading-none shrink-0">
                                        <span className="text-[17px] font-bold text-white tracking-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Techno</span>
                                        <span className="text-[17px] font-bold text-blue-500" style={{ fontFamily: 'Rajdhani, sans-serif' }}>.</span>
                                        <span className="text-[17px] font-bold text-blue-500 tracking-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Cep</span>
                                    </div>

                                    {/* Category Subtext */}
                                    <div className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] mt-0.5 -mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        {label.category || "DİĞER"}
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent my-1" />

                                    {/* Product Info */}
                                    <div className="flex-1 w-full flex flex-col items-center justify-center gap-2 overflow-hidden px-1 py-1">
                                        <div className="text-[11px] font-bold text-white text-center leading-tight uppercase tracking-wide line-clamp-2 w-full">
                                            {label.productName}
                                        </div>

                                        <div className="flex items-end gap-1 shrink-0">
                                            <span className="text-3xl font-black text-white tabular-nums leading-none tracking-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                                {label.price.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                                            </span>
                                            <span className="text-lg font-bold text-blue-400 pb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>₺</span>
                                        </div>
                                    </div>

                                    {/* Barcode */}
                                    <div className="w-full flex flex-col items-center gap-1 shrink-0">
                                        <BarkodSVG seed={label.barcode} />
                                        <div className="text-[7px] text-slate-400 font-bold tracking-[0.2em] tabular-nums" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                            {label.barcode}
                                        </div>
                                    </div>
                                </div>
                                {/* Preview Label Subtext */}
                                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors uppercase tracking-widest flex items-center gap-1 print:hidden">
                                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-slate-300 dark:border-slate-700">
                                        {label.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4 print:hidden">
                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                            <TagIcon className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold">Henüz etiket eklenmedi</p>
                            <p className="text-xs">Üstteki panelden ürün ekleyerek başlayabilirsiniz.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Styles for Printing */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:flex {
                        display: flex !important;
                    }
                    .print\\:w-\\[50mm\\] {
                        width: 50mm !important;
                    }
                    .print\\:h-\\[50mm\\] {
                        height: 50mm !important;
                    }
                }
            ` }} />
        </div>
    );
}
