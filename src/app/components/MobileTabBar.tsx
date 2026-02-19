import {
    Package,
    ShoppingCart,
    BarChart3,
    Wrench,
    Smartphone,
    Calculator,
    User
} from "lucide-react";
import { cn } from "./ui/utils";

interface MobileTabBarProps {
    activeView: string;
    setActiveView: (view: any) => void;
}

export function MobileTabBar({ activeView, setActiveView }: MobileTabBarProps) {
    const items = [
        { id: "products", icon: Package, label: "Stok" },
        { id: "salesManagement", icon: BarChart3, label: "Rapor" },
        { id: "salesPanel", icon: ShoppingCart, label: "Satış" },
        { id: "repairs", icon: Wrench, label: "Tamir" },
        { id: "phoneSales", icon: Smartphone, label: "Telefon" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 px-2 z-50 pb-safe">
            {items.map((item) => {
                const isActive = activeView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 w-full h-full",
                            isActive
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-500 dark:text-slate-500"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
