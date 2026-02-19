import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Bu Ayki Kasa Durumu
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Toplam Gelir</p>
            <p className={`text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
              {formatPrice(totalRevenue)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nakit */}
          <div className="group p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nakit</span>
              </div>
              <span className={`text-sm font-bold text-orange-600 dark:text-orange-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                {formatPrice(totalCash)}
              </span>
            </div>
            <div className="w-full bg-orange-100 dark:bg-orange-950/50 rounded-full h-1.5 mb-1">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalRevenue > 0 ? (totalCash / totalRevenue) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70 font-medium text-right">
              %{totalRevenue > 0 ? ((totalCash / totalRevenue) * 100).toFixed(1) : "0.0"}
            </p>
          </div>

          {/* Kart */}
          <div className="group p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kart</span>
              </div>
              <span className={`text-sm font-bold text-blue-600 dark:text-blue-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                {formatPrice(totalCard)}
              </span>
            </div>
            <div className="w-full bg-blue-100 dark:bg-blue-950/50 rounded-full h-1.5 mb-1">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalRevenue > 0 ? (totalCard / totalRevenue) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-medium text-right">
              %{totalRevenue > 0 ? ((totalCard / totalRevenue) * 100).toFixed(1) : "0.0"}
            </p>
          </div>

          {/* Havale */}
          <div className="group p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Havale</span>
              </div>
              <span className={`text-sm font-bold text-purple-600 dark:text-purple-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                {formatPrice(totalTransfer)}
              </span>
            </div>
            <div className="w-full bg-purple-100 dark:bg-purple-950/50 rounded-full h-1.5 mb-1">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalRevenue > 0 ? (totalTransfer / totalRevenue) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 font-medium text-right">
              %{totalRevenue > 0 ? ((totalTransfer / totalRevenue) * 100).toFixed(1) : "0.0"}
            </p>
          </div>
        </div>

        {/* Global Progress */}
        <div className="pt-2">
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <div className="bg-orange-500 transition-all duration-500 hover:opacity-90" style={{ width: `${totalRevenue > 0 ? (totalCash / totalRevenue) * 100 : 0}%` }} title="Nakit" />
            <div className="bg-blue-500 transition-all duration-500 hover:opacity-90" style={{ width: `${totalRevenue > 0 ? (totalCard / totalRevenue) * 100 : 0}%` }} title="Kart" />
            <div className="bg-purple-500 transition-all duration-500 hover:opacity-90" style={{ width: `${totalRevenue > 0 ? (totalTransfer / totalRevenue) * 100 : 0}%` }} title="Havale" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>Distribüsyon</span>
            <span>{thisMonthSales.length + thisMonthRepairs.length + thisMonthPhoneSales.length} işlem</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}