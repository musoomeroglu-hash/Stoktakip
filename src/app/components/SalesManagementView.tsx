import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Wrench, ShoppingCart, TrendingUp, DollarSign, Edit, Trash2, User, BarChart3, Calendar, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import type { Sale, RepairRecord, Customer, CustomerTransaction, SaleItem, PhoneSale } from "../utils/api";

interface SalesManagementViewProps {
  sales: Sale[];
  repairs: RepairRecord[];
  phoneSales: PhoneSale[];
  customers: Customer[];
  customerTransactions: CustomerTransaction[];
  onDeleteSale: (id: string) => void;
  onUpdateSale: (id: string, sale: Sale) => void;
  onUpdateRepair: (id: string, data: Partial<RepairRecord>) => void;
  onDeleteRepair: (id: string) => void;
  onDeletePhoneSale: (id: string) => void;
  currency: "TRY" | "USD";
  usdRate: number;
  formatPrice: (price: number) => string;
  isPrivacyMode: boolean;
}

const PIE_COLORS = ["#3b82f6", "#a855f7", "#ec4899"];

export function SalesManagementView({
  sales, repairs, phoneSales, customers, customerTransactions,
  onDeleteSale, onUpdateSale, onUpdateRepair, onDeleteRepair, onDeletePhoneSale,
  currency, usdRate, formatPrice, isPrivacyMode,
}: SalesManagementViewProps) {

  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });

  const isDateInRange = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  const setCurrentMonth = () => {
    const now = new Date();
    setStartDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
    setEndDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  };
  const setPreviousMonth = () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(`${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}-01`);
    setEndDate(`${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`);
  };
  const setAllTime = () => {
    setStartDate("2020-01-01");
    const now = new Date();
    setEndDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  };

  const formatPriceLocale = (price: number) => {
    if (currency === "USD" && usdRate > 0)
      return `$${(price / usdRate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `₺${price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);
  const [editRepairDialogOpen, setEditRepairDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editSaleDialogOpen, setEditSaleDialogOpen] = useState(false);
  const [editRepairForm, setEditRepairForm] = useState({ customerName: "", customerPhone: "", deviceInfo: "", imei: "", problemDescription: "", repairCost: 0, partsCost: 0, status: "completed" as "in_progress" | "completed" | "delivered" });
  const [editSaleForm, setEditSaleForm] = useState<{ items: SaleItem[]; totalPrice: number; totalProfit: number }>({ items: [], totalPrice: 0, totalProfit: 0 });

  const repairStats = useMemo(() => {
    const filtered = repairs.filter(r => (r.status === "completed" || r.status === "delivered") && isDateInRange(r.createdAt));
    return { count: filtered.length, revenue: filtered.reduce((s, r) => s + r.repairCost, 0), profit: filtered.reduce((s, r) => s + r.repairCost - r.partsCost, 0), items: filtered };
  }, [repairs, startDate, endDate]);

  const productSaleStats = useMemo(() => {
    const filtered = sales.filter(s => !s.items.some(i => i.productId.startsWith("repair-")) && isDateInRange(s.date));
    return { count: filtered.length, revenue: filtered.reduce((s, x) => s + x.totalPrice, 0), profit: filtered.reduce((s, x) => s + x.totalProfit, 0), items: filtered };
  }, [sales, startDate, endDate]);

  const phoneSaleStats = useMemo(() => {
    const filtered = phoneSales.filter(ps => isDateInRange(ps.date));
    return { count: filtered.length, revenue: filtered.reduce((s, ps) => s + ps.salePrice, 0), profit: filtered.reduce((s, ps) => s + ps.profit, 0), cost: filtered.reduce((s, ps) => s + ps.purchasePrice, 0), items: filtered };
  }, [phoneSales, startDate, endDate]);

  const cariStats = useMemo(() => {
    const totalDebt = customers.reduce((s, c) => s + c.debt, 0);
    const totalCredit = customers.reduce((s, c) => s + c.credit, 0);
    return { totalDebt, totalCredit, balance: totalDebt - totalCredit, count: customers.length };
  }, [customers]);

  const profitLossStats = useMemo(() => {
    const totalRevenue = productSaleStats.revenue + repairStats.revenue + phoneSaleStats.revenue;
    const totalProfit = productSaleStats.profit + repairStats.profit + phoneSaleStats.profit;
    return { totalRevenue, totalProfit, totalCost: totalRevenue - totalProfit };
  }, [productSaleStats, repairStats, phoneSaleStats]);

  const pieChartData = useMemo(() => [
    { name: "Ürün Satışları", value: productSaleStats.profit, color: PIE_COLORS[0] },
    { name: "Tamir Kârı", value: repairStats.profit, color: PIE_COLORS[1] },
    { name: "Telefon Satışları", value: phoneSaleStats.profit, color: PIE_COLORS[2] },
  ].filter(i => i.value > 0), [productSaleStats.profit, repairStats.profit, phoneSaleStats.profit]);

  const handleEditRepair = (repair: RepairRecord) => {
    setEditingRepair(repair);
    setEditRepairForm({ customerName: repair.customerName, customerPhone: repair.customerPhone, deviceInfo: repair.deviceInfo, imei: repair.imei || "", problemDescription: repair.problemDescription, repairCost: repair.repairCost, partsCost: repair.partsCost, status: repair.status });
    setEditRepairDialogOpen(true);
  };
  const handleSaveRepair = () => {
    if (!editingRepair) return;
    onUpdateRepair(editingRepair.id!, { ...editRepairForm, profit: editRepairForm.repairCost - editRepairForm.partsCost });
    setEditRepairDialogOpen(false); setEditingRepair(null); toast.success("Tamir kaydı güncellendi");
  };
  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale); setEditSaleForm({ items: [...sale.items], totalPrice: sale.totalPrice, totalProfit: sale.totalProfit }); setEditSaleDialogOpen(true);
  };
  const handleUpdateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...editSaleForm.items]; newItems[index] = { ...newItems[index], [field]: value };
    setEditSaleForm({ items: newItems, totalPrice: newItems.reduce((s, i) => s + i.salePrice * i.quantity, 0), totalProfit: newItems.reduce((s, i) => s + i.profit * i.quantity, 0) });
  };
  const handleSaveSale = () => {
    if (!editingSale) return;
    onUpdateSale(editingSale.id!, { ...editingSale, ...editSaleForm });
    setEditSaleDialogOpen(false); setEditingSale(null); toast.success("Satış güncellendi");
  };
  const handleDeleteSale = (id: string) => {
    if (window.confirm("Bu satışı silmek istediğinize emin misiniz?")) { onDeleteSale(id); toast.success("Satış silindi"); }
  };

  // ── STYLE HELPERS ───────────────────────────────────────────────
  const panel = "rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-white dark:bg-[#162a2d] overflow-hidden";
  const sectionHeader = "px-6 py-4 border-b border-[#e8f5f6] dark:border-[#2a4245]";
  const labelCls = "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9ab8bc]";
  const valueCls = "text-2xl font-bold tabular-nums";

  const allItems = useMemo(() => [...productSaleStats.items, ...repairStats.items, ...phoneSaleStats.items]
    .filter((item: any) => !('items' in item && item.items.some((si: any) => si.productId?.startsWith('repair-'))))
    .sort((a: any, b: any) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()),
    [productSaleStats.items, repairStats.items, phoneSaleStats.items]);

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Satış & Raporlar</h2>
        <p className="text-sm text-slate-500 dark:text-[#9ab8bc]">Tüm satış işlemleri ve raporlar</p>
      </div>

      {/* Tarih Aralığı */}
      <div className={`${panel}`}>
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Calendar className="w-4 h-4 text-[#00e1ff]" />
            <span className="text-sm font-semibold text-slate-700 dark:text-[#e8f5f6]">Tarih Aralığı:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] text-slate-800 dark:text-[#e8f5f6] text-sm focus:outline-none focus:border-[#00e1ff]" />
              <span className="text-slate-400">-</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] text-slate-800 dark:text-[#e8f5f6] text-sm focus:outline-none focus:border-[#00e1ff]" />
            </div>
            <div className="flex gap-2">
              {[{ label: "Bu Ay", fn: setCurrentMonth }, { label: "Geçen Ay", fn: setPreviousMonth }, { label: "Tüm Zamanlar", fn: setAllTime }].map(btn => (
                <button key={btn.label} onClick={btn.fn}
                  className="h-9 px-3 rounded-lg border border-[#d0e4e6] dark:border-[#2a4245] bg-white dark:bg-[#1e3639] text-slate-600 dark:text-[#9ab8bc] hover:border-[#00e1ff]/50 hover:text-[#00e1ff] text-sm font-medium transition-all duration-200">
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] text-sm text-slate-600 dark:text-[#9ab8bc] shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#00e1ff]" />
            {new Date(startDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })} -{" "}
            {new Date(endDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* 4 KPI Kartı — Stitch'ten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam Ciro", value: formatPriceLocale(profitLossStats.totalRevenue), icon: DollarSign, color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", blurred: true },
          { label: "Toplam Kâr", value: formatPriceLocale(profitLossStats.totalProfit), icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", blurred: true },
          { label: "Toplam İşlem", value: String(productSaleStats.count + repairStats.count + phoneSaleStats.count), icon: ShoppingCart, color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", blurred: false },
          { label: "Cari Bakiye", value: formatPriceLocale(cariStats.balance), icon: User, color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", blurred: true },
        ].map(kpi => (
          <div key={kpi.label} className="relative overflow-hidden rounded-xl border bg-white dark:bg-[#162a2d] p-5 group hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg" style={{ borderColor: kpi.border }}>
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity" style={{ background: kpi.bg }} />
            <p className={`${labelCls} mb-3`}>{kpi.label}</p>
            <div className="flex items-end justify-between">
              <p className={`${valueCls} text-slate-900 dark:text-white ${kpi.blurred && isPrivacyMode ? "privacy-mode-blur" : ""}`}>{kpi.value}</p>
              <div className="p-2 rounded-lg" style={{ background: kpi.bg }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, ${kpi.color}50, transparent)` }} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className={`${panel}`}>
          <TabsList className="flex w-full bg-transparent border-b border-[#e8f5f6] dark:border-[#2a4245] rounded-none h-auto p-0">
            {[
              { value: "repairs", icon: Wrench, label: "Tamir" },
              { value: "sales", icon: ShoppingCart, label: "Ürün Satışı" },
              { value: "cari", icon: User, label: "Cari" },
              { value: "profitloss", icon: BarChart3, label: "Kar Zarar" },
              { value: "all", icon: TrendingUp, label: "Hepsi" },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-none border-b-2 border-transparent text-slate-500 dark:text-[#9ab8bc] data-[state=active]:border-[#00e1ff] data-[state=active]:text-[#00e1ff] data-[state=active]:bg-[#00e1ff]/5 font-medium text-sm transition-all">
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── REPAIRS TAB ── */}
          <TabsContent value="repairs" className="p-6 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-[#e8f5f6]">Tamir Kayıtları</h3>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className={labelCls}>Ciro</p>
                  <p className={`font-bold text-slate-800 dark:text-white tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(repairStats.revenue)}</p>
                </div>
                <div className="text-right">
                  <p className={labelCls}>Kâr</p>
                  <p className={`font-bold text-[#10b981] tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(repairStats.profit)}</p>
                </div>
              </div>
            </div>
            {repairStats.items.length === 0 ? (
              <p className="text-center text-slate-400 dark:text-[#9ab8bc] py-10">Henüz tamamlanmış tamir kaydı yok</p>
            ) : repairStats.items.map(repair => (
              <div key={repair.id} className="flex items-center justify-between p-4 rounded-xl border border-[#e8f5f6] dark:border-[#2a4245] hover:border-[#00e1ff]/30 hover:bg-[#f0f8f9] dark:hover:bg-[#1e3639] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
                    <Wrench className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-[#e8f5f6]">{repair.deviceInfo}</p>
                    <p className="text-xs text-slate-500 dark:text-[#9ab8bc]">{repair.customerName} · {new Date(repair.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold tabular-nums text-slate-800 dark:text-white ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(repair.repairCost)}</p>
                  <p className={`text-xs font-semibold text-[#10b981] ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>+{formatPriceLocale(repair.profit)}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ── SALES TAB ── */}
          <TabsContent value="sales" className="p-6 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-[#e8f5f6]">Ürün Satışları</h3>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className={labelCls}>Ciro</p>
                  <p className={`font-bold text-slate-800 dark:text-white tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(productSaleStats.revenue)}</p>
                </div>
                <div className="text-right">
                  <p className={labelCls}>Kâr</p>
                  <p className={`font-bold text-[#10b981] tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(productSaleStats.profit)}</p>
                </div>
              </div>
            </div>
            {productSaleStats.items.length === 0 ? (
              <p className="text-center text-slate-400 dark:text-[#9ab8bc] py-10">Henüz satış kaydı yok</p>
            ) : productSaleStats.items.map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-4 rounded-xl border border-[#e8f5f6] dark:border-[#2a4245] hover:border-[#00e1ff]/30 hover:bg-[#f0f8f9] dark:hover:bg-[#1e3639] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.12)" }}>
                    <ShoppingCart className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-[#e8f5f6]">{sale.items[0]?.productName}{sale.items.length > 1 ? ` +${sale.items.length - 1}` : ""}</p>
                    <p className="text-xs text-slate-500 dark:text-[#9ab8bc]">{new Date(sale.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-bold tabular-nums text-slate-800 dark:text-white ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(sale.totalPrice)}</p>
                    <p className={`text-xs font-semibold text-[#10b981] ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>+{formatPriceLocale(sale.totalProfit)}</p>
                  </div>
                  <button onClick={() => handleEditSale(sale)} className="p-1.5 rounded-lg hover:bg-[#e8f5f6] dark:hover:bg-[#2a4245] text-slate-400 hover:text-amber-500 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteSale(sale.id!)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ── CARİ TAB ── */}
          <TabsContent value="cari" className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Toplam Alacak", value: formatPriceLocale(cariStats.totalDebt), color: "#ef4444" },
                { label: "Toplam Borç", value: formatPriceLocale(cariStats.totalCredit), color: "#3b82f6" },
                { label: "Bakiye", value: formatPriceLocale(cariStats.balance), color: cariStats.balance >= 0 ? "#10b981" : "#ef4444" },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639]">
                  <p className={labelCls}>{s.label}</p>
                  <p className={`font-bold text-lg tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`} style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {customers.length === 0 ? (
                <p className="text-center text-slate-400 dark:text-[#9ab8bc] py-10">Henüz cari kaydı yok</p>
              ) : customers.map(customer => (
                <div key={customer.id} className="flex items-center justify-between p-4 rounded-xl border border-[#e8f5f6] dark:border-[#2a4245] hover:bg-[#f0f8f9] dark:hover:bg-[#1e3639] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00e1ff]/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#00e1ff]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-[#e8f5f6]">{customer.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#9ab8bc]">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className={labelCls}>Alacak</p>
                      <p className={`font-semibold text-red-500 tabular-nums text-sm ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(customer.debt)}</p>
                    </div>
                    <div>
                      <p className={labelCls}>Borç</p>
                      <p className={`font-semibold text-blue-500 tabular-nums text-sm ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(customer.credit)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── KAR ZARAR TAB ── */}
          <TabsContent value="profitloss" className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gelirler */}
              <div className="rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] p-5">
                <p className={`${labelCls} mb-3`}>Gelirler</p>
                <div className="space-y-2">
                  {[
                    { label: "Ürün Satışları", val: productSaleStats.revenue },
                    { label: "Tamir Gelirleri", val: repairStats.revenue },
                    { label: "Telefon Satışları", val: phoneSaleStats.revenue },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-[#9ab8bc]">{r.label}</span>
                      <span className={`font-semibold tabular-nums text-slate-800 dark:text-[#e8f5f6] ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(r.val)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-[#d0e4e6] dark:border-[#2a4245]">
                    <span className="font-semibold text-slate-700 dark:text-[#e8f5f6]">Toplam Gelir</span>
                    <span className={`font-bold text-[#3b82f6] tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(profitLossStats.totalRevenue)}</span>
                  </div>
                </div>
              </div>
              {/* Giderler */}
              <div className="rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] p-5">
                <p className={`${labelCls} mb-3`}>Giderler</p>
                <div className="space-y-2">
                  {[
                    { label: "Ürün Maliyetleri", val: productSaleStats.revenue - productSaleStats.profit },
                    { label: "Tamir Maliyetleri", val: repairStats.revenue - repairStats.profit },
                    { label: "Telefon Maliyetleri", val: phoneSaleStats.cost },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-[#9ab8bc]">{r.label}</span>
                      <span className={`font-semibold tabular-nums text-slate-800 dark:text-[#e8f5f6] ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(r.val)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-[#d0e4e6] dark:border-[#2a4245]">
                    <span className="font-semibold text-slate-700 dark:text-[#e8f5f6]">Toplam Maliyet</span>
                    <span className={`font-bold text-red-500 tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(profitLossStats.totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Net Kar */}
            <div className="rounded-xl border border-[#10b981]/30 bg-[#10b981]/5 p-6 flex items-center justify-between">
              <div>
                <p className={labelCls}>Net Kâr / Zarar</p>
                <p className={`text-4xl font-bold text-[#10b981] tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(profitLossStats.totalProfit)}</p>
              </div>
              <div className="text-right">
                <p className={labelCls}>Kâr Marjı</p>
                <p className="text-3xl font-bold text-[#10b981]">
                  {profitLossStats.totalRevenue > 0 ? ((profitLossStats.totalProfit / profitLossStats.totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── HEPSİ TAB — Stitch tasarımı ── */}
          <TabsContent value="all" className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Kâr Dağılımı Pasta Grafik */}
              <div className="rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] p-5">
                <p className="font-bold text-slate-800 dark:text-[#e8f5f6] mb-4">Kâr Dağılımı</p>
                {pieChartData.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-slate-400 dark:text-[#9ab8bc]">Henüz veri yok</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "#9ab8bc", strokeWidth: 1 }}>
                        {pieChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => isPrivacyMode ? "****" : `₺${v.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
                        contentStyle={{ background: "#162a2d", border: "1px solid #2a4245", borderRadius: "8px", color: "#e8f5f6" }} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600 dark:text-[#9ab8bc]">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Özet Panel */}
              <div className="rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] p-5">
                <p className="font-bold text-slate-800 dark:text-[#e8f5f6] mb-4">Özet</p>
                <div className="space-y-2 mb-5">
                  {[
                    { label: "Ürün Satışları", val: `${productSaleStats.count} adet`, bg: "rgba(59,130,246,0.1)" },
                    { label: "Tamir İşlemleri", val: `${repairStats.count} adet`, bg: "rgba(249,115,22,0.1)" },
                    { label: "Toplam İşlem", val: `${productSaleStats.count + repairStats.count + phoneSaleStats.count} adet`, bg: "rgba(168,85,247,0.1)" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center p-3 rounded-lg" style={{ background: r.bg }}>
                      <span className="text-sm font-medium text-slate-700 dark:text-[#e8f5f6]">{r.label}</span>
                      <span className="font-bold text-slate-800 dark:text-white">{r.val}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-[#d0e4e6] dark:border-[#2a4245]">
                  {[
                    { label: "Ürün Satış Kârı", val: formatPriceLocale(productSaleStats.profit), color: "#3b82f6" },
                    { label: "Tamir Kârı", val: formatPriceLocale(repairStats.profit), color: "#f97316" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 dark:text-[#9ab8bc]">{r.label}</span>
                      <span className={`font-semibold tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`} style={{ color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#10b981]/10 mt-1">
                    <span className="font-semibold text-slate-800 dark:text-[#e8f5f6]">Toplam Kâr</span>
                    <span className={`text-xl font-bold text-[#10b981] tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(profitLossStats.totalProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Son İşlemler — Stitch listesi */}
            <div className="rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e8f5f6] dark:border-[#2a4245]">
                <p className="font-bold text-slate-800 dark:text-[#e8f5f6]">Son İşlemler</p>
              </div>
              <div className="divide-y divide-[#e8f5f6] dark:divide-[#2a4245] max-h-[500px] overflow-y-auto">
                {allItems.length === 0 ? (
                  <p className="text-center text-slate-400 dark:text-[#9ab8bc] py-10">Henüz işlem yok</p>
                ) : allItems.map((item: any, index) => {
                  const isSale = "items" in item;
                  const isRepair = "deviceInfo" in item;
                  const cfg = isSale
                    ? { icon: ShoppingCart, color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: `Satış - ${item.items[0]?.productName}`, amount: item.totalPrice, profit: item.totalProfit }
                    : isRepair
                    ? { icon: Wrench, color: "#f97316", bg: "rgba(249,115,22,0.12)", label: `Tamir - ${item.deviceInfo}`, amount: item.repairCost, profit: item.profit }
                    : { icon: Smartphone, color: "#a855f7", bg: "rgba(168,85,247,0.12)", label: `Telefon - ${item.brand} ${item.model}`, amount: item.salePrice, profit: item.profit };

                  return (
                    <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-[#f0f8f9] dark:hover:bg-[#1e3639] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                          <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-[#e8f5f6]">{cfg.label}</p>
                          <p className="text-xs text-slate-500 dark:text-[#9ab8bc]">
                            {new Date(item.date || item.createdAt || 0).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`font-bold tabular-nums text-slate-800 dark:text-white ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPriceLocale(cfg.amount)}</p>
                          <p className={`text-xs font-semibold text-[#10b981] ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>+{formatPriceLocale(cfg.profit)}</p>
                        </div>
                        {isSale && (
                          <>
                            <button onClick={() => handleEditSale(item)} className="p-1.5 rounded-lg hover:bg-[#e8f5f6] dark:hover:bg-[#2a4245] text-slate-400 hover:text-amber-500 transition-colors">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteSale(item.id!)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {isRepair && (
                          <button onClick={() => onDeleteRepair(item.id!)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Edit Repair Dialog */}
      <Dialog open={editRepairDialogOpen} onOpenChange={setEditRepairDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#162a2d] border-[#d0e4e6] dark:border-[#2a4245]">
          <DialogHeader>
            <DialogTitle className="dark:text-[#e8f5f6]">Tamir Kaydını Düzenle</DialogTitle>
            <DialogDescription className="dark:text-[#9ab8bc]">Tamir kaydını düzenlemek için bilgileri güncelleyin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Müşteri Adı</Label><Input value={editRepairForm.customerName} onChange={e => setEditRepairForm({ ...editRepairForm, customerName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Telefon</Label><Input value={editRepairForm.customerPhone} onChange={e => setEditRepairForm({ ...editRepairForm, customerPhone: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Cihaz Bilgisi</Label><Input value={editRepairForm.deviceInfo} onChange={e => setEditRepairForm({ ...editRepairForm, deviceInfo: e.target.value })} /></div>
            <div className="space-y-2"><Label>IMEI</Label><Input value={editRepairForm.imei} onChange={e => setEditRepairForm({ ...editRepairForm, imei: e.target.value })} /></div>
            <div className="space-y-2"><Label>Arıza Açıklaması</Label><Textarea value={editRepairForm.problemDescription} onChange={e => setEditRepairForm({ ...editRepairForm, problemDescription: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tamir Ücreti (₺)</Label><Input type="number" step="0.01" value={editRepairForm.repairCost} onChange={e => setEditRepairForm({ ...editRepairForm, repairCost: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Malzeme Maliyeti (₺)</Label><Input type="number" step="0.01" value={editRepairForm.partsCost} onChange={e => setEditRepairForm({ ...editRepairForm, partsCost: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
              <p className="text-xs text-slate-500 dark:text-[#9ab8bc] mb-1">Kâr</p>
              <p className="text-2xl font-bold text-[#10b981]">₺{(editRepairForm.repairCost - editRepairForm.partsCost).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRepairDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSaveRepair} className="bg-[#00e1ff] hover:bg-[#33e7ff] text-[#0f2123] font-bold">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog open={editSaleDialogOpen} onOpenChange={setEditSaleDialogOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-[#162a2d] border-[#d0e4e6] dark:border-[#2a4245]">
          <DialogHeader>
            <DialogTitle className="dark:text-[#e8f5f6]">Satışı Düzenle</DialogTitle>
            <DialogDescription className="dark:text-[#9ab8bc]">Satışı düzenlemek için bilgileri güncelleyin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {editSaleForm.items.map((item, index) => (
              <div key={index} className="p-4 rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>Ürün Adı</Label><Input value={item.productName} disabled /></div>
                  <div><Label>Adet</Label><Input type="number" value={item.quantity} onChange={e => handleUpdateSaleItem(index, "quantity", parseInt(e.target.value) || 0)} /></div>
                  <div><Label>Satış Fiyatı (₺)</Label><Input type="number" step="0.01" value={item.salePrice} onChange={e => handleUpdateSaleItem(index, "salePrice", parseFloat(e.target.value) || 0)} /></div>
                </div>
              </div>
            ))}
            <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex justify-between">
              <div><p className="text-xs text-slate-500 dark:text-[#9ab8bc]">Toplam</p><p className="text-xl font-bold text-slate-800 dark:text-white">₺{editSaleForm.totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p></div>
              <div className="text-right"><p className="text-xs text-slate-500 dark:text-[#9ab8bc]">Kâr</p><p className="text-xl font-bold text-[#10b981]">₺{editSaleForm.totalProfit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</p></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSaleDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSaveSale} className="bg-[#00e1ff] hover:bg-[#33e7ff] text-[#0f2123] font-bold">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
