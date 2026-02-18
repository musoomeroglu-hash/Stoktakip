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
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-950/30",
        },
        {
            title: "Aylık Alış",
            value: formatPrice(monthlyPurchaseTotal),
            description: `${monthlyPurchases.length} adet fatura kesildi`,
            icon: ShoppingCart,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/30",
        },
        {
            title: "Envanter Değeri",
            value: formatPrice(totalInventoryValue),
            description: "Toplam alış maliyeti",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
            action: (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenAnalysis();
                    }}
                >
                    <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </Button>
            )
        },
        {
            title: "Günlük Satış",
            value: formatPrice(todayRevenue),
            description: "Bugün yapılan toplam ciro",
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/30",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {stat.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {stat.action && stat.action}
                            <div className={`p-2 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            {stat.value}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
