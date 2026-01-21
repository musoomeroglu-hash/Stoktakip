import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Smartphone, Trash2, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { PhoneSale } from "../utils/api";
import { useEffect } from "react";

interface PhoneSalesViewProps {
  phoneSales: PhoneSale[];
  onDeletePhoneSale: (id: string) => void;
}

export function PhoneSalesView({ phoneSales, onDeletePhoneSale }: PhoneSalesViewProps) {
  // Debug: Telefon satışları listesini kontrol et
  useEffect(() => {
    console.log("📱 PhoneSalesView - Mevcut telefon satışları:", phoneSales.length);
    console.log("📱 Telefon satışları detayı:", phoneSales);
  }, [phoneSales]);

  const totalProfit = phoneSales.reduce((sum, ps) => sum + ps.profit, 0);
  const totalRevenue = phoneSales.reduce((sum, ps) => sum + ps.salePrice, 0);
  const totalInvestment = phoneSales.reduce((sum, ps) => sum + ps.purchasePrice, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <Card className="border-2 border-purple-300 dark:border-purple-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Toplam Ciro</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
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
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
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
            <span>Telefon Satışları ({phoneSales.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {phoneSales.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="font-semibold text-lg mb-2">Henüz Telefon Satışı Yok</h3>
              <p className="text-sm text-muted-foreground">
                İkinci el telefon satışlarınızı buradan takip edebilirsiniz
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {phoneSales.map((sale) => (
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
                        <Badge variant="secondary" className="ml-2">
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
                          <p className="font-semibold text-orange-600 dark:text-orange-400">
                            ₺{sale.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                          <p className="text-xs text-muted-foreground">Satış Fiyatı</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
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
                      onClick={() => onDeletePhoneSale(sale.id)}
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