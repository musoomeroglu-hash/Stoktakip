"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "./ui/sidebar";
import {
    Package,
    ShoppingCart,
    Wrench,
    Smartphone,
    Users,
    Calculator,
    ClipboardList,
    Receipt,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface AppSidebarProps {
    activeView: string;
    setActiveView: (view: any) => void;
    onLogout: () => void;
    onOpenCategoryManagement: () => void;
}

const menuItems = [
    {
        title: "Ürünler",
        view: "products",
        icon: Package,
        color: "text-blue-500"
    },
    {
        title: "Satış & Raporlar",
        view: "salesManagement",
        icon: ShoppingCart,
        color: "text-purple-500"
    },
    {
        title: "Tamir Kayıtları",
        view: "repairs",
        icon: Wrench,
        color: "text-orange-500"
    },
    {
        title: "Telefon Satışları",
        view: "phoneSales",
        icon: Smartphone,
        color: "text-pink-500"
    },
    {
        title: "Cariler",
        view: "caris",
        icon: Users,
        color: "text-indigo-500"
    },
    {
        title: "Analizler",
        view: "salesAnalytics",
        icon: BarChart3,
        color: "text-emerald-500"
    },
    {
        title: "Giderler",
        view: "expenses",
        icon: Receipt,
        color: "text-red-500"
    },
    {
        title: "İstek & Siparişler",
        view: "requests",
        icon: ClipboardList,
        color: "text-sky-500"
    },
    {
        title: "Hesap Makinesi",
        view: "calculator",
        icon: Calculator,
        color: "text-green-500"
    },
];

export function AppSidebar({
    activeView,
    setActiveView,
    onLogout,
    onOpenCategoryManagement
}: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon" className="max-md:hidden border-r border-slate-200 dark:border-slate-800">
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
                        <Package className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Techno.Cep
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            Stok Takip Sistemi
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Yönetim
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-2 gap-1">
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.view}>
                                    <SidebarMenuButton
                                        onClick={() => setActiveView(item.view)}
                                        isActive={activeView === item.view}
                                        tooltip={item.title}
                                        className={`
                      transition-all duration-200
                      ${activeView === item.view
                                                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
                                            }
                    `}
                                    >
                                        <item.icon className={`h-4 w-4 ${activeView === item.view ? item.color : ''}`} />
                                        <span className="ml-2 group-data-[collapsible=icon]:hidden">
                                            {item.title}
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto border-t border-slate-100 dark:border-slate-800/50 pt-4">
                    <SidebarMenu className="px-2">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={onOpenCategoryManagement}
                                tooltip="Ayarlar"
                                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="ml-2 group-data-[collapsible=icon]:hidden">Ayarlar</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={onLogout}
                                tooltip="Çıkış Yap"
                                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="ml-2 group-data-[collapsible=icon]:hidden">Çıkış Yap</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2 text-[10px] text-slate-500 font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sistem Çevrimiçi
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
