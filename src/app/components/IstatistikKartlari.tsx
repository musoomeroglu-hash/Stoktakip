import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Building2,
    Eye,
} from "lucide-react";
import { Button } from "./ui/button";
import type { Sale, RepairRecord, PhoneSale, Product, Supplier, Purchase } from "../utils/api";

interface IstatistikProps {
    products: Product[];
    sales: Sale[];
    repairs: RepairRecord[];
    phoneSales: PhoneSale[];
    suppliers: Supplier[];
    purchases: Purchase[];
    formatPrice: (price: number) => string;
    onOpenAnalysis: () => void;
    isPrivacyMode: boolean;
}

export function IstatistikKartlari({
    products,
    sales,
    repairs,
    phoneSales,
    suppliers,
    purchases,
    formatPrice,
    onOpenAnalysis,
    isPrivacyMode,
}: IstatistikProps) {
    const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);

    // Calculate today's revenue from all sources
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.date.startsWith(today));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalPrice, 0);

    // New stats
    const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.balance, 0);
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyPurchases = purchases.filter(p => p.purchase_date.startsWith(currentMonth));
    const monthlyPurchaseTotal = monthlyPurchases.reduce((sum, p) => sum + p.total, 0);

    const stats = [
        {
            title: "Tedarikçi Borcu",
            value: formatPrice(totalSupplierDebt),
            description: `${suppliers.filter(s => s.balance > 0).length} tedarikçiye borç var`,
            icon: Building2,
            accentColor: "#ef4444",
            accentBg: "rgba(239,68,68,0.12)",
            accentBorder: "rgba(239,68,68,0.25)",
        },
        {
            title: "Aylık Alış",
            value: formatPrice(monthlyPurchaseTotal),
            description: `${monthlyPurchases.length} adet fatura kesildi`,
            icon: ShoppingCart,
            accentColor: "#f97316",
            accentBg: "rgba(249,115,22,0.12)",
            accentBorder: "rgba(249,115,22,0.25)",
        },
        {
            title: "Envanter Değeri",
            value: formatPrice(totalInventoryValue),
            description: "Toplam alış maliyeti",
            icon: DollarSign,
            accentColor: "#00e1ff",
            accentBg: "rgba(0,225,255,0.10)",
            accentBorder: "rgba(0,225,255,0.25)",
            hasAction: true,
        },
        {
            title: "Günlük Satış",
            value: formatPrice(todayRevenue),
            description: "Bugün yapılan toplam ciro",
            icon: TrendingUp,
            accentColor: "#a855f7",
            accentBg: "rgba(168,85,247,0.12)",
            accentBorder: "rgba(168,85,247,0.25)",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className="relative overflow-hidden rounded-xl border bg-white dark:bg-[#162a2d] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
                    style={{ borderColor: stat.accentBorder }}
                >
                    {/* Dekoratif arka plan glow */}
                    <div
                        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-300 blur-xl"
                        style={{ background: stat.accentBg }}
                    />

                    <div className="relative z-10 p-5">
                        {/* Üst satır */}
                        <div className="flex items-start justify-between mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9ab8bc]">
                                {stat.title}
                            </p>
                            <div className="flex items-center gap-1.5">
                                {stat.hasAction && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                                        style={{ color: stat.accentColor }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenAnalysis();
                                        }}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                                <div
                                    className="p-2 rounded-lg transition-transform group-hover:scale-110 duration-300"
                                    style={{ background: stat.accentBg }}
                                >
                                    <stat.icon className="w-4 h-4" style={{ color: stat.accentColor }} />
                                </div>
                            </div>
                        </div>

                        {/* Değer */}
                        <div className={`text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white mb-1 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            {stat.value}
                        </div>

                        {/* Açıklama */}
                        <p className="text-xs text-slate-500 dark:text-[#9ab8bc] font-medium">
                            {stat.description}
                        </p>
                    </div>

                    {/* Alt accent çizgisi */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: `linear-gradient(to right, ${stat.accentColor}60, transparent)` }}
                    />
                </div>
            ))}
        </div>
    );
}
