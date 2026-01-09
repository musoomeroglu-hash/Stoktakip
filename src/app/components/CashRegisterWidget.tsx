import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Banknote, CreditCard, Landmark, TrendingUp } from "lucide-react";
import type { Sale, RepairRecord, PaymentMethod, PaymentDetails } from "../utils/api";
import type { PhoneSale } from "./PhoneSaleDialog";

interface CashRegisterWidgetProps {
  sales: Sale[];
  repairs: RepairRecord[];
  phoneSales: PhoneSale[];
  formatPrice: (price: number) => string;
}

export function CashRegisterWidget({ sales, repairs, phoneSales, formatPrice }: CashRegisterWidgetProps) {
  // Calculate today's transactions
  const today = new Date().toDateString();
  
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const todayRepairs = repairs.filter(r => 
    (r.status === "completed" || r.status === "delivered") && 
    new Date(r.createdAt).toDateString() === today
  );
  const todayPhoneSales = phoneSales.filter(ps => new Date(ps.date).toDateString() === today);

  // Calculate cash
  const cashFromSales = todaySales
    .filter(s => s.paymentMethod === "cash")
    .reduce((sum, s) => sum + s.totalPrice, 0);
  
  const cashFromMixed = todaySales
    .filter(s => s.paymentMethod === "mixed" && s.paymentDetails?.cash)
    .reduce((sum, s) => sum + (s.paymentDetails?.cash || 0), 0);

  const cashFromRepairs = todayRepairs
    .filter(r => r.paymentMethod === "cash")
    .reduce((sum, r) => sum + r.repairCost, 0);

  const cashFromRepairsMixed = todayRepairs
    .filter(r => r.paymentMethod === "mixed" && r.paymentDetails?.cash)
    .reduce((sum, r) => sum + (r.paymentDetails?.cash || 0), 0);

  const cashFromPhoneSales = todayPhoneSales
    .filter(ps => ps.paymentMethod === "cash")
    .reduce((sum, ps) => sum + ps.salePrice, 0);

  const cashFromPhoneSalesMixed = todayPhoneSales
    .filter(ps => ps.paymentMethod === "mixed" && ps.paymentDetails?.cash)
    .reduce((sum, ps) => sum + (ps.paymentDetails?.cash || 0), 0);

  const totalCash = cashFromSales + cashFromMixed + cashFromRepairs + cashFromRepairsMixed + cashFromPhoneSales + cashFromPhoneSalesMixed;

  // Calculate card
  const cardFromSales = todaySales
    .filter(s => s.paymentMethod === "card")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  const cardFromMixed = todaySales
    .filter(s => s.paymentMethod === "mixed" && s.paymentDetails?.card)
    .reduce((sum, s) => sum + (s.paymentDetails?.card || 0), 0);

  const cardFromRepairs = todayRepairs
    .filter(r => r.paymentMethod === "card")
    .reduce((sum, r) => sum + r.repairCost, 0);

  const cardFromRepairsMixed = todayRepairs
    .filter(r => r.paymentMethod === "mixed" && r.paymentDetails?.card)
    .reduce((sum, r) => sum + (r.paymentDetails?.card || 0), 0);

  const cardFromPhoneSales = todayPhoneSales
    .filter(ps => ps.paymentMethod === "card")
    .reduce((sum, ps) => sum + ps.salePrice, 0);

  const cardFromPhoneSalesMixed = todayPhoneSales
    .filter(ps => ps.paymentMethod === "mixed" && ps.paymentDetails?.card)
    .reduce((sum, ps) => sum + (ps.paymentDetails?.card || 0), 0);

  const totalCard = cardFromSales + cardFromMixed + cardFromRepairs + cardFromRepairsMixed + cardFromPhoneSales + cardFromPhoneSalesMixed;

  // Calculate transfer
  const transferFromSales = todaySales
    .filter(s => s.paymentMethod === "transfer")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  const transferFromMixed = todaySales
    .filter(s => s.paymentMethod === "mixed" && s.paymentDetails?.transfer)
    .reduce((sum, s) => sum + (s.paymentDetails?.transfer || 0), 0);

  const transferFromRepairs = todayRepairs
    .filter(r => r.paymentMethod === "transfer")
    .reduce((sum, r) => sum + r.repairCost, 0);

  const transferFromRepairsMixed = todayRepairs
    .filter(r => r.paymentMethod === "mixed" && r.paymentDetails?.transfer)
    .reduce((sum, r) => sum + (r.paymentDetails?.transfer || 0), 0);

  const transferFromPhoneSales = todayPhoneSales
    .filter(ps => ps.paymentMethod === "transfer")
    .reduce((sum, ps) => sum + ps.salePrice, 0);

  const transferFromPhoneSalesMixed = todayPhoneSales
    .filter(ps => ps.paymentMethod === "mixed" && ps.paymentDetails?.transfer)
    .reduce((sum, ps) => sum + (ps.paymentDetails?.transfer || 0), 0);

  const totalTransfer = transferFromSales + transferFromMixed + transferFromRepairs + transferFromRepairsMixed + transferFromPhoneSales + transferFromPhoneSalesMixed;

  const totalRevenue = totalCash + totalCard + totalTransfer;

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-green-100/50 dark:from-emerald-950 dark:to-green-900/50 border-emerald-200 dark:border-emerald-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Bugünkü Kasa Durumu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Nakit */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground">Nakit</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {formatPrice(totalCash)}
            </p>
          </div>

          {/* Kart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">Kart</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {formatPrice(totalCard)}
            </p>
          </div>

          {/* Havale */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-muted-foreground">Havale</span>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {formatPrice(totalTransfer)}
            </p>
          </div>
        </div>

        {/* Toplam */}
        <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-lg p-3 border-2 border-emerald-300 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Toplam Gelir
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatPrice(totalRevenue)}
            </span>
          </div>
        </div>

        {/* İşlem Sayısı */}
        <div className="text-center pt-2 border-t border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-muted-foreground">Toplam İşlem</p>
          <p className="text-sm font-semibold">
            {todaySales.length + todayRepairs.length + todayPhoneSales.length} adet
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
