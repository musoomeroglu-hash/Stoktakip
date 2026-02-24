import { Banknote, CreditCard, Landmark, TrendingUp } from "lucide-react";
import type { Sale, RepairRecord, PaymentMethod, PaymentDetails, PhoneSale } from "../utils/api";

interface CashRegisterWidgetProps {
  sales: Sale[];
  repairs: RepairRecord[];
  phoneSales: PhoneSale[];
  formatPrice: (price: number) => string;
  isPrivacyMode: boolean;
}

export function CashRegisterWidget({ sales, repairs, phoneSales, formatPrice, isPrivacyMode }: CashRegisterWidgetProps) {
  // Calculate this month's transactions
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthSales = sales.filter(s => new Date(s.date) >= thisMonthStart);
  const thisMonthRepairs = repairs.filter(r =>
    (r.status === "completed" || r.status === "delivered") &&
    new Date(r.createdAt) >= thisMonthStart
  );
  const thisMonthPhoneSales = phoneSales.filter(ps => new Date(ps.date) >= thisMonthStart);

  // Calculate cash
  const cashFromSales = thisMonthSales
    .filter(s => s.paymentMethod === "cash")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  const cashFromMixed = thisMonthSales
    .filter(s => s.paymentMethod === "mixed" && s.paymentDetails?.cash)
    .reduce((sum, s) => sum + (s.paymentDetails?.cash || 0), 0);

  const cashFromRepairs = thisMonthRepairs
    .filter(r => r.paymentMethod === "cash")
    .reduce((sum, r) => sum + r.repairCost, 0);

  const cashFromRepairsMixed = thisMonthRepairs
    .filter(r => r.paymentMethod === "mixed" && r.paymentDetails?.cash)
    .reduce((sum, r) => sum + (r.paymentDetails?.cash || 0), 0);

  const cashFromPhoneSales = thisMonthPhoneSales
    .filter(ps => ps.paymentMethod === "cash")
    .reduce((sum, ps) => sum + ps.salePrice, 0);

  const cashFromPhoneSalesMixed = thisMonthPhoneSales
    .filter(ps => ps.paymentMethod === "mixed" && ps.paymentDetails?.cash)
    .reduce((sum, ps) => sum + (ps.paymentDetails?.cash || 0), 0);

  const totalCash = cashFromSales + cashFromMixed + cashFromRepairs + cashFromRepairsMixed + cashFromPhoneSales + cashFromPhoneSalesMixed;

  // Calculate card
  const cardFromSales = thisMonthSales
    .filter(s => s.paymentMethod === "card")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  const cardFromMixed = thisMonthSales
    .filter(s => s.paymentMethod === "mixed" && s.paymentDetails?.card)
    .reduce((sum, s) => sum + (s.paymentDetails?.card || 0), 0);

  const cardFromRepairs = thisMonthRepairs
    .filter(r => r.paymentMethod === "card")
    .reduce((sum, r) => sum + r.repairCost, 0);

  const cardFromRepairsMixed = thisMonthRepairs
    .filter(r => r.paymentMethod === "mixed" && r.paymentDetails?.card)
    .reduce((sum, r) => sum + (r.paymentDetails?.card || 0), 0);

  const cardFromPhoneSales = thisMonthPhoneSales
    .filter(ps => ps.paymentMethod === "card")
    .reduce((sum, ps) => sum + ps.salePrice, 0);

  const cardFromPhoneSalesMixed = thisMonthPhoneSales
    .filter(ps => ps.paymentMethod === "mixed" && ps.paymentDetails?.card)
    .reduce((sum, ps) => sum + (ps.paymentDetails?.card || 0), 0);

  const totalCard = cardFromSales + cardFromMixed + cardFromRepairs + cardFromRepairsMixed + cardFromPhoneSales + cardFromPhoneSalesMixed;

  // Calculate transfer
  const transferFromSales = thisMonthSales
    .filter(s => s.paymentMethod === "transfer")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  const transferFromMixed = thisMonthSales
    .filter(s => s.paymentMethod === "mixed" && s.paymentDetails?.transfer)
    .reduce((sum, s) => sum + (s.paymentDetails?.transfer || 0), 0);

  const transferFromRepairs = thisMonthRepairs
    .filter(r => r.paymentMethod === "transfer")
    .reduce((sum, r) => sum + r.repairCost, 0);

  const transferFromRepairsMixed = thisMonthRepairs
    .filter(r => r.paymentMethod === "mixed" && r.paymentDetails?.transfer)
    .reduce((sum, r) => sum + (r.paymentDetails?.transfer || 0), 0);

  const transferFromPhoneSales = thisMonthPhoneSales
    .filter(ps => ps.paymentMethod === "transfer")
    .reduce((sum, ps) => sum + ps.salePrice, 0);

  const transferFromPhoneSalesMixed = thisMonthPhoneSales
    .filter(ps => ps.paymentMethod === "mixed" && ps.paymentDetails?.transfer)
    .reduce((sum, ps) => sum + (ps.paymentDetails?.transfer || 0), 0);

  const totalTransfer = transferFromSales + transferFromMixed + transferFromRepairs + transferFromRepairsMixed + transferFromPhoneSales + transferFromPhoneSalesMixed;

  const totalRevenue = totalCash + totalCard + totalTransfer;

  const cashPct = totalRevenue > 0 ? (totalCash / totalRevenue) * 100 : 0;
  const cardPct = totalRevenue > 0 ? (totalCard / totalRevenue) * 100 : 0;
  const transferPct = totalRevenue > 0 ? (totalTransfer / totalRevenue) * 100 : 0;
  const totalTxn = thisMonthSales.length + thisMonthRepairs.length + thisMonthPhoneSales.length;

  const channels = [
    { label: "Nakit", icon: Banknote, value: totalCash, pct: cashPct, color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)", bar: "#f97316" },
    { label: "Kart", icon: CreditCard, value: totalCard, pct: cardPct, color: "#00e1ff", bg: "rgba(0,225,255,0.10)", border: "rgba(0,225,255,0.25)", bar: "#00e1ff" },
    { label: "Havale", icon: Landmark, value: totalTransfer, pct: transferPct, color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.25)", bar: "#a855f7" },
  ];

  return (
    <div className="rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-white dark:bg-[#162a2d] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8f5f6] dark:border-[#2a4245]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00e1ff]" />
          <span className="text-sm font-semibold text-slate-700 dark:text-[#e8f5f6]">Bu Ayki Kasa Durumu</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-[#9ab8bc] font-semibold">Toplam Gelir</p>
          <p className={`text-xl font-bold tabular-nums text-[#00e1ff] ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Kanallar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#e8f5f6] dark:divide-[#2a4245]">
        {channels.map((ch) => (
          <div key={ch.label} className="p-5 group hover:bg-[#f5f8f8] dark:hover:bg-[#1e3639] transition-colors duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: ch.bg }}>
                  <ch.icon className="w-4 h-4" style={{ color: ch.color }} />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-[#e8f5f6]">{ch.label}</span>
              </div>
              <span className={`text-sm font-bold tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`} style={{ color: ch.color }}>
                {formatPrice(ch.value)}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-[#e8f5f6] dark:bg-[#2a4245] overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${ch.pct}%`, background: ch.bar }}
              />
            </div>
            <p className="text-[10px] font-semibold text-right" style={{ color: ch.color, opacity: 0.7 }}>
              %{ch.pct.toFixed(1)}
            </p>
          </div>
        ))}
      </div>

      {/* Global progress bar */}
      <div className="px-6 py-3 border-t border-[#e8f5f6] dark:border-[#2a4245]">
        <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-[#e8f5f6] dark:bg-[#2a4245]">
          <div className="transition-all duration-700" style={{ width: `${cashPct}%`, background: "#f97316" }} />
          <div className="transition-all duration-700" style={{ width: `${cardPct}%`, background: "#00e1ff" }} />
          <div className="transition-all duration-700" style={{ width: `${transferPct}%`, background: "#a855f7" }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-[#9ab8bc]">Distribüsyon</span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-[#9ab8bc]">{totalTxn} işlem</span>
        </div>
      </div>
    </div>
  );
}