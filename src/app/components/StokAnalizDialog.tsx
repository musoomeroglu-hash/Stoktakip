import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { TrendingUp, DollarSign, PieChart, Package } from "lucide-react";
import type { Product, Category } from "../utils/api";

interface StokAnalizDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    categories: Category[];
    formatPrice: (price: number) => string;
    isPrivacyMode: boolean;
}

export function StokAnalizDialog({
    open,
    onOpenChange,
    products,
    categories,
    formatPrice,
    isPrivacyMode,
}: StokAnalizDialogProps) {
    // Toplam değerler
    const totalPurchase = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
    const totalSales = products.reduce((sum, p) => sum + (p.stock * p.salePrice), 0);
    const totalProfit = totalSales - totalPurchase;
    const profitMargin = totalPurchase > 0 ? (totalProfit / totalPurchase) * 100 : 0;

    // Kategori bazlı dağılım
    const categoryStats = categories.map(cat => {
        const catProducts = products.filter(p => p.categoryId === cat.id);
        const purchase = catProducts.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
        const sales = catProducts.reduce((sum, p) => sum + (p.stock * p.salePrice), 0);
        const profit = sales - purchase;
        const margin = purchase > 0 ? (profit / purchase) * 100 : 0;
        const count = catProducts.length;

        // Üst kategori adını bul (varsa)
        const parent = cat.parentId ? categories.find(c => c.id === cat.parentId) : null;
        const fullName = parent ? `${parent.name} > ${cat.name}` : cat.name;

        return {
            id: cat.id,
            name: fullName,
            purchase,
            sales,
            profit,
            margin,
            count
        };
    }).filter(s => s.count > 0).sort((a, b) => b.purchase - a.purchase);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Stok Değeri Analizi
                    </DialogTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Kategorilere göre stok değeri ve potansiyel kâr dağılımı
                    </p>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8">
                        {/* Özet Kartları */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Alış Fiyatı Toplamı</p>
                                <p className={`text-lg font-bold text-blue-700 dark:text-blue-300 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(totalPurchase)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100/50 dark:border-emerald-800/30">
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Satış Fiyatı Toplamı</p>
                                <p className={`text-lg font-bold text-emerald-700 dark:text-emerald-300 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(totalSales)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/30">
                                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Potansiyel Kâr</p>
                                <div className="flex items-baseline gap-2">
                                    <p className={`text-lg font-bold text-purple-700 dark:text-purple-300 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(totalProfit)}</p>
                                    <span className="text-xs font-medium text-purple-500">%{profitMargin.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Kategori Dağılımı */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-orange-500" />
                                Kategori Bazlı Dağılım
                            </h3>

                            <div className="space-y-3">
                                {categoryStats.map(stat => (
                                    <div key={stat.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{stat.name}</h4>
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                {stat.count} ürün
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5">Alış Değeri</p>
                                                <p className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(stat.purchase)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5">Satış Değeri</p>
                                                <p className={`text-sm font-bold text-emerald-600 dark:text-emerald-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(stat.sales)}</p>
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5">Potansiyel Kâr</p>
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-bold text-purple-600 dark:text-purple-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(stat.profit)}</p>
                                                    <span className="text-[10px] font-bold text-purple-500">%{stat.margin.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[10px] text-center text-slate-500 dark:text-slate-400">
                    * Veriler mevcut stok miktarları ve tanımlı fiyatlar üzerinden hesaplanmıştır.
                </div>
            </DialogContent>
        </Dialog>
    );
}
