import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Smartphone, Trash2, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { motion } from "motion/react";
import type { PhoneSale } from "../utils/api";
import { useEffect, useState, useMemo } from "react";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface PhoneSalesViewProps {
  phoneSales: PhoneSale[];
  onDeletePhoneSale: (id: string) => void;
  isPrivacyMode: boolean;
}

export function PhoneSalesView({ phoneSales, onDeletePhoneSale, isPrivacyMode }: PhoneSalesViewProps) {
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
      <Card className="border-2 border-purple-300 dark:border-purple-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Telefon Satışları ({filteredPhoneSales.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredPhoneSales.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="font-semibold text-lg mb-2">Henüz Telefon Satışı Yok</h3>
              <p className="text-sm text-muted-foreground">
                İkinci el telefon satışlarınızı buradan takip edebilirsiniz
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPhoneSales.map((sale) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-950/10 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Brand & Model */}
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-bold text-lg">
                          {sale.brand} {sale.model}
                        </h3>
                        <Badge variant="secondary" className={`ml-2 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                          {sale.profit >= 0 ? (
                            <span className="text-green-600 dark:text-green-400">
                              +₺{sale.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              -₺{Math.abs(sale.profit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </Badge>
                      </div>

                      {/* IMEI */}
                      {sale.imei && (
                        <div className="text-sm text-muted-foreground mb-2">
                          IMEI: {sale.imei}
                        </div>
                      )}

                      {/* Prices */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                          <p className="text-xs text-muted-foreground">Alış Fiyatı</p>
                          <p className={`font-semibold text-orange-600 dark:text-orange-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            ₺{sale.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                          <p className="text-xs text-muted-foreground">Satış Fiyatı</p>
                          <p className={`font-semibold text-green-600 dark:text-green-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                            ₺{sale.salePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      {(sale.customerName || sale.customerPhone) && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2">
                          <p className="text-xs text-muted-foreground mb-1">Müşteri Bilgileri</p>
                          {sale.customerName && (
                            <p className="text-sm font-medium">{sale.customerName}</p>
                          )}
                          {sale.customerPhone && (
                            <p className="text-sm text-muted-foreground">{sale.customerPhone}</p>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {sale.notes && (
                        <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded mb-2">
                          <p className="text-xs mb-1">Notlar:</p>
                          <p>{sale.notes}</p>
                        </div>
                      )}

                      {/* Date */}
                      <div className="text-xs text-muted-foreground">
                        📅 {new Date(sale.date).toLocaleString('tr-TR')}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      onClick={() => {
                        if (window.confirm("Bu telefon satışını silmek istediğinize emin misiniz?")) {
                          onDeletePhoneSale(sale.id);
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}