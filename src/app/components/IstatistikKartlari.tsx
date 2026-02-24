import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "./ui/card";
import {
    Package,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Wrench,
    Eye,
    Building2
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
            iconColor: "text-[#ef4444]",
            iconBg: "bg-[#ef4444]/10",
        },
        {
            title: "Aylık Alış",
            value: formatPrice(monthlyPurchaseTotal),
            description: `${monthlyPurchases.length} adet fatura kesildi`,
            icon: ShoppingCart,
            iconColor: "text-[#f59e0b]",
            iconBg: "bg-[#f59e0b]/10",
        },
        {
            title: "Envanter Değeri",
            value: formatPrice(totalInventoryValue),
            description: "Toplam alış maliyeti",
            icon: DollarSign,
            iconColor: "text-[#10b981]",
            iconBg: "bg-[#10b981]/10",
            action: (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-[#10b981]/20 ml-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenAnalysis();
                    }}
                >
                    <Eye className="w-4 h-4 text-[#10b981]" />
                </Button>
            )
        },
        {
            title: "Günlük Satış",
            value: formatPrice(todayRevenue),
            description: "Bugün yapılan toplam ciro",
            icon: TrendingUp,
            iconColor: "text-[#a855f7]",
            iconBg: "bg-[#a855f7]/10",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card
                    key={stat.title}
                    className="overflow-hidden border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-white/80 dark:bg-[#162a2d]/80 border-[#d0e4e6] dark:border-[#2a4245] backdrop-blur-xl"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-[#9ab8bc]">
                            {stat.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {stat.action}
                            <div className={`p-2 rounded-full ${stat.iconBg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold tracking-tight text-[#0f2123] dark:text-[#00e1ff] ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            {stat.value}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-[#9ab8bc] mt-1 font-medium">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
