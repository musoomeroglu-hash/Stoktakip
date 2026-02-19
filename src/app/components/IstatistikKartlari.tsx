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
            gradient: "from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40",
            iconColor: "text-red-600 dark:text-red-400",
            iconBg: "bg-red-200 dark:bg-red-900/50",
            borderColor: "border-red-200 dark:border-red-800"
        },
        {
            title: "Aylık Alış",
            value: formatPrice(monthlyPurchaseTotal),
            description: `${monthlyPurchases.length} adet fatura kesildi`,
            icon: ShoppingCart,
            gradient: "from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40",
            iconColor: "text-orange-600 dark:text-orange-400",
            iconBg: "bg-orange-200 dark:bg-orange-900/50",
            borderColor: "border-orange-200 dark:border-orange-800"
        },
        {
            title: "Envanter Değeri",
            value: formatPrice(totalInventoryValue),
            description: "Toplam alış maliyeti",
            icon: DollarSign,
            gradient: "from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            iconBg: "bg-emerald-200 dark:bg-emerald-900/50",
            borderColor: "border-emerald-200 dark:border-emerald-800",
            action: (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 ml-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenAnalysis();
                    }}
                >
                    <Eye className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                </Button>
            )
        },
        {
            title: "Günlük Satış",
            value: formatPrice(todayRevenue),
            description: "Bugün yapılan toplam ciro",
            icon: TrendingUp,
            gradient: "from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40",
            iconColor: "text-purple-600 dark:text-purple-400",
            iconBg: "bg-purple-200 dark:bg-purple-900/50",
            borderColor: "border-purple-200 dark:border-purple-800"
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card
                    key={stat.title}
                    className={`overflow-hidden border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br ${stat.gradient} ${stat.borderColor}`}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
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
                        <div className={`text-2xl font-bold tracking-tight text-slate-900 dark:text-white ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            {stat.value}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
