import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Smartphone, Trash2, DollarSign, TrendingUp, Calendar, Plus } from "lucide-react";
import { motion } from "motion/react";
import type { PhoneSale, PhoneStock } from "../utils/api";
import { useEffect, useState, useMemo } from "react";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface PhoneSalesViewProps {
  phoneSales: PhoneSale[];
  phoneStocks: PhoneStock[];
  onDeletePhoneSale: (id: string) => void;
  onDeletePhoneStock: (id: string) => void;
  onAddPhoneStock: () => void;
  isPrivacyMode: boolean;
}

export function PhoneSalesView({ phoneSales, phoneStocks, onDeletePhoneSale, onDeletePhoneStock, onAddPhoneStock, isPrivacyMode }: PhoneSalesViewProps) {
  // Date range states
  const [startDate, setStartDate] = useState<string>(() => {
    // Default: ayın ilk günü
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const year = firstDay.getFullYear();
    const month = String(firstDay.getMonth() + 1).padStart(2, '0');
    const day = String(firstDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [endDate, setEndDate] = useState<string>(() => {
    // Default: ayın son günü
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const year = lastDay.getFullYear();
    const month = String(lastDay.getMonth() + 1).padStart(2, '0');
    const day = String(lastDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  // Quick date range setters
  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startYear = firstDay.getFullYear();
    const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
    const startDay = String(firstDay.getDate()).padStart(2, '0');
    setStartDate(`${startYear}-${startMonth}-${startDay}`);

    const endYear = lastDay.getFullYear();
    const endMonth = String(lastDay.getMonth() + 1).padStart(2, '0');
    const endDay = String(lastDay.getDate()).padStart(2, '0');
    setEndDate(`${endYear}-${endMonth}-${endDay}`);
  };

  const setPreviousMonth = () => {
    const now = new Date();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const startYear = firstDayPrevMonth.getFullYear();
    const startMonth = String(firstDayPrevMonth.getMonth() + 1).padStart(2, '0');
    const startDay = String(firstDayPrevMonth.getDate()).padStart(2, '0');
    setStartDate(`${startYear}-${startMonth}-${startDay}`);

    const endYear = lastDayPrevMonth.getFullYear();
    const endMonth = String(lastDayPrevMonth.getMonth() + 1).padStart(2, '0');
    const endDay = String(lastDayPrevMonth.getDate()).padStart(2, '0');
    setEndDate(`${endYear}-${endMonth}-${endDay}`);
  };

  const setAllTime = () => {
    setStartDate('2020-01-01');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setEndDate(`${year}-${month}-${day}`);
  };

  // Filter phone sales based on date range
  const filteredPhoneSales = useMemo(() => {
    return phoneSales.filter(ps => isDateInRange(ps.date));
  }, [phoneSales, startDate, endDate]);

  // Debug: Telefon satışları listesini kontrol et
  useEffect(() => {
    console.log("📱 PhoneSalesView - Filtrelenmiş telefon satışları:", filteredPhoneSales.length);
  }, [filteredPhoneSales]);

  const totalProfit = filteredPhoneSales.reduce((sum, ps) => sum + ps.profit, 0);
  const totalRevenue = filteredPhoneSales.reduce((sum, ps) => sum + ps.salePrice, 0);
  const totalInvestment = filteredPhoneSales.reduce((sum, ps) => sum + ps.purchasePrice, 0);

  return (
    <div className="space-y-6">
      {/* Phone Stocks Section - AT THE TOP */}
      <Card className="border-2 border-indigo-300 dark:border-indigo-800 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Telefon Stokları ({phoneStocks.length})</span>
          </CardTitle>
          <Button
            onClick={onAddPhoneStock}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            TELEFON STOĞU EKLE
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {phoneStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-full mb-4 animate-pulse">
                <Smartphone className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
              </div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-2">Stokta Telefon Yok</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                Henüz envanterinizde satılacak telefon bulunmuyor. Yeni cihaz ekleyerek başlayın.
              </p>
              <Button
                onClick={onAddPhoneStock}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Telefon Stoğu Ekle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phoneStocks.map((stock) => (
                <motion.div
                  key={stock.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border-2 border-indigo-100 dark:border-indigo-900 rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all relative group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-indigo-900 dark:text-indigo-100">{stock.brand} {stock.model}</h3>
                      <p className="text-xs text-muted-foreground font-mono">IMEI: {stock.imei || "Belirtilmedi"}</p>
                    </div>
                    <Button
                      onClick={() => onDeletePhoneStock(stock.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-2 rounded">
                      <p className="text-[10px] text-orange-600 uppercase font-bold">Alış</p>
                      <p className={`text-sm font-bold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{stock.purchasePrice.toLocaleString('tr-TR')}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 p-2 rounded">
                      <p className="text-[10px] text-green-600 uppercase font-bold">Hedef Satış</p>
                      <p className={`text-sm font-bold ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>₺{stock.salePrice.toLocaleString('tr-TR')}</p>
                    </div>
                  </div>

                  {stock.notes && (
                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-1 italic border-t pt-1">
                      {stock.notes}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Date Range Filter */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-2 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-900 dark:text-purple-100">Tarih Aralığı:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto border-2 border-purple-300 dark:border-purple-700"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto border-2 border-purple-300 dark:border-purple-700"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={setCurrentMonth}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700"
                >
                  Bu Ay
                </Button>
                <Button
                  onClick={setPreviousMonth}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700"
                >
                  Geçen Ay
                </Button>
                <Button
                  onClick={setAllTime}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700"
                >
                  Tüm Zamanlar
                </Button>
              </div>

              <div className="ml-auto bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(startDate), "dd MMM yyyy", { locale: tr })} - {format(new Date(endDate), "dd MMM yyyy", { locale: tr })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <Card className="border-2 border-purple-300 dark:border-purple-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Toplam Ciro</p>
                <p className={`text-2xl font-bold text-purple-600 dark:text-purple-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                  ₺{totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Profit */}
        <Card className="border-2 border-green-300 dark:border-green-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Toplam Kâr</p>
                <p className={`text-2xl font-bold text-green-600 dark:text-green-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                  ₺{totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Investment */}
        <Card className="border-2 border-orange-300 dark:border-orange-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Toplam Yatırım</p>
                <p className={`text-2xl font-bold text-orange-600 dark:text-orange-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                  ₺{totalInvestment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phone Sales List */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Telefon Satışları ({filteredPhoneSales.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredPhoneSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                <Smartphone className="w-12 h-12 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="font-semibold text-xl mb-2 text-slate-900 dark:text-slate-100">Henüz Telefon Satışı Yok</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                Gerçekleşen telefon satışlarınız burada listelenecek. Stoktan satış yaparak başlayabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPhoneSales.map((sale) => {
                // Determine brand color
                const brand = sale.brand.toLowerCase();
                let brandColor = "bg-slate-500";
                let brandBg = "bg-slate-50";

                if (brand.includes("apple") || brand.includes("iphone")) {
                  brandColor = "bg-slate-800 dark:bg-slate-200";
                  brandBg = "bg-slate-100 dark:bg-slate-800";
                } else if (brand.includes("samsung")) {
                  brandColor = "bg-blue-600";
                  brandBg = "bg-blue-50 dark:bg-blue-900/20";
                } else if (brand.includes("xiaomi") || brand.includes("redmi")) {
                  brandColor = "bg-orange-500";
                  brandBg = "bg-orange-50 dark:bg-orange-900/20";
                } else if (brand.includes("huawei")) {
                  brandColor = "bg-red-600";
                  brandBg = "bg-red-50 dark:bg-red-900/20";
                }

                return (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative border border-slate-200 dark:border-slate-800 rounded-xl p-0 bg-white dark:bg-slate-950 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Brand Color Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${brandColor}`} />

                    <div className="p-4 pl-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${brandBg} ${brandColor.replace('bg-', 'text-')}`}>
                              {sale.brand}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100">
                            {sale.model}
                          </h3>
                        </div>
                        <div className={`flex flex-col items-end ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                          <span className="text-xs text-slate-400 font-medium uppercase">Kâr</span>
                          <span className={`text-lg font-bold ${sale.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                            {sale.profit >= 0 ? "+" : ""}{sale.profit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺
                          </span>
                        </div>
                      </div>

                      {/* IMEI & Date */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                          {sale.imei || "IMEI Yok"}
                        </span>
                        <span>{new Date(sale.date).toLocaleDateString('tr-TR')}</span>
                      </div>

                      {/* Financials */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Alış</span>
                          <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            {sale.purchasePrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺
                          </span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800/50">
                          <span className="text-[10px] text-blue-500 dark:text-blue-400 block mb-0.5">Satış</span>
                          <span className={`text-sm font-bold text-blue-700 dark:text-blue-300 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            {sale.salePrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺
                          </span>
                        </div>
                      </div>

                      {/* Customer & Delete */}
                      <div className="flex items-center justify-between mt-2 pt-2">
                        <div className="flex items-center gap-2 max-w-[80%]">
                          {sale.customerName ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                                {sale.customerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">
                                {sale.customerName}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Müşteri kaydı yok</span>
                          )}
                        </div>

                        <Button
                          onClick={() => {
                            if (window.confirm("Bu telefon satışını silmek istediğinize emin misiniz?")) {
                              onDeletePhoneSale(sale.id);
                            }
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}