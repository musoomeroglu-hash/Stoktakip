import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Receipt, Plus, X, TrendingDown, DollarSign, AlertTriangle, Calendar, Phone, Zap, Wifi, Home, Truck, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { api, type Sale, type RepairRecord, type PhoneSale, type SaleItem } from "../utils/api";

interface Expense {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
}

interface ExpensesViewProps {
  sales: Sale[];
  repairs: RepairRecord[];
  phoneSales: PhoneSale[];
  isPrivacyMode: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

export function ExpensesView({ sales, repairs, phoneSales, isPrivacyMode }: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // Date range states
  const [startDate, setStartDate] = useState<string>(() => {
    // Default: ayın ilk günü (local time)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const year = firstDay.getFullYear();
    const month = String(firstDay.getMonth() + 1).padStart(2, '0');
    const day = String(firstDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [endDate, setEndDate] = useState<string>(() => {
    // Default: ayın son günü (local time)
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Ayın son günü
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
    end.setHours(23, 59, 59, 999); // End of day
    return date >= start && date <= end;
  };

  // Quick date range setters
  const setToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    setStartDate(today);
    setEndDate(today);
  };

  const setThisWeek = () => {
    const now = new Date();
    const firstDayOfWeek = new Date(now);
    firstDayOfWeek.setDate(now.getDate() - now.getDay() + 1); // Pazartesi

    const startYear = firstDayOfWeek.getFullYear();
    const startMonth = String(firstDayOfWeek.getMonth() + 1).padStart(2, '0');
    const startDay = String(firstDayOfWeek.getDate()).padStart(2, '0');
    setStartDate(`${startYear}-${startMonth}-${startDay}`);

    const endYear = now.getFullYear();
    const endMonth = String(now.getMonth() + 1).padStart(2, '0');
    const endDay = String(now.getDate()).padStart(2, '0');
    setEndDate(`${endYear}-${endMonth}-${endDay}`);
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Ayın son günü

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

  // Supabase'den verileri yükle
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await api.getExpenses();
      setExpenses(data);
      console.log("✅ Giderler Supabase'den yüklendi:", data.length);
    } catch (error) {
      console.error("❌ Giderler yüklenirken hata:", error);
      toast.error("Giderler yüklenemedi. Lütfen sayfayı yenileyin.");
    }
  };

  const handleAddExpense = async () => {
    if (!expenseName.trim()) {
      toast.error("Lütfen gider adını girin!");
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Lütfen geçerli bir tutar girin!");
      return;
    }

    try {
      const newExpense = await api.addExpense({
        name: expenseName.trim(),
        amount: amount,
        createdAt: new Date().toISOString()
      });

      setExpenses([newExpense, ...expenses]);
      console.log("✅ Gider Supabase'e kaydedildi:", newExpense);

      // Form temizle
      setExpenseName("");
      setExpenseAmount("");
      setShowForm(false);

      toast.success("Gider başarıyla eklendi!");
    } catch (error) {
      console.error("❌ Gider kaydedilemedi:", error);
      toast.error("Gider kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id);
      const updatedExpenses = expenses.filter(exp => exp.id !== id);
      setExpenses(updatedExpenses);
      console.log("✅ Gider Supabase'Silindi");
      toast.success("Gider silindi");
    } catch (error) {
      console.error("❌ Gider silinemedi:", error);
      toast.error("Gider silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Filtrelenmiş giderler
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => isDateInRange(exp.createdAt));
  }, [expenses, startDate, endDate]);

  // Toplam kâr (filtrelenmiş) - SalesManagementView ile senkronize edildi
  const totalProfitInPeriod = useMemo(() => {
    const salesProfit = sales
      .filter(s =>
        !s.items.some((item: SaleItem) => item.productId.startsWith('repair-')) &&
        isDateInRange(s.date)
      )
      .reduce((sum, s) => sum + s.totalProfit, 0);

    const repairsProfit = repairs
      .filter(r =>
        (r.status === "completed" || r.status === "delivered") &&
        isDateInRange(r.createdAt)
      )
      .reduce((sum, r) => sum + (r.repairCost - r.partsCost), 0);

    const phoneSalesProfit = phoneSales
      .filter(ps => isDateInRange(ps.date))
      .reduce((sum, ps) => sum + ps.profit, 0);

    return salesProfit + repairsProfit + phoneSalesProfit;
  }, [sales, repairs, phoneSales, startDate, endDate]);

  // Toplam gider (filtrelenmiş)
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  // Net kâr (Seçili Dönem Kârı - Toplam Gider)
  const netProfit = totalProfitInPeriod - totalExpenses;

  // Pasta grafiği için veri (filtrelenmiş)
  const chartData = useMemo(() => {
    return filteredExpenses.map(exp => ({
      name: exp.name,
      value: exp.amount
    }));
  }, [filteredExpenses]);

  // Hızlı gider şablonları
  const quickExpenses = [
    "Telefon Faturası",
    "Elektrik Faturası",
    "İnternet Faturası",
    "Kira",
    "Stopaj",
    "Maaş",
    "Malzeme",
    "Kargo"
  ];

  const getExpenseIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("telefon")) return <Phone className="w-5 h-5" />;
    if (n.includes("elektrik") || n.includes("enerji")) return <Zap className="w-5 h-5" />;
    if (n.includes("internet") || n.includes("wifi")) return <Wifi className="w-5 h-5" />;
    if (n.includes("kira") || n.includes("aidat")) return <Home className="w-5 h-5" />;
    if (n.includes("kargo") || n.includes("nakliye")) return <Truck className="w-5 h-5" />;
    if (n.includes("maaş") || n.includes("personel")) return <Users className="w-5 h-5" />;
    return <Receipt className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-orange-300 dark:border-orange-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <span>Giderler</span>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-orange-600 hover:bg-orange-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Gider Ekle
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Date Range Filter */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-orange-900 dark:text-orange-100">Tarih Aralığı:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Date Inputs */}
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto border-2 border-orange-300 dark:border-orange-700"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto border-2 border-orange-300 dark:border-orange-700"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={setToday}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-700"
                >
                  Bugün
                </Button>
                <Button
                  onClick={setThisWeek}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-700"
                >
                  Bu Hafta
                </Button>
                <Button
                  onClick={setCurrentMonth}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-700"
                >
                  Bu Ay
                </Button>
                <Button
                  onClick={setPreviousMonth}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-700"
                >
                  Geçen Ay
                </Button>
                <Button
                  onClick={setAllTime}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-700"
                >
                  Tüm Zamanlar
                </Button>
              </div>
            </div>

            {/* Selected Period Display */}
            <div className="text-sm text-muted-foreground bg-white dark:bg-gray-800 px-3 py-2 rounded-md border-2 border-orange-200 dark:border-orange-700">
              📅 {new Date(startDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
              {' - '}
              {new Date(endDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Kâr Özet Kartı */}
      <Card className={`border-2 shadow-lg ${netProfit >= 0
        ? 'border-green-300 dark:border-green-800'
        : 'border-red-300 dark:border-red-800'
        }`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Toplam Kâr */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-muted-foreground">Toplam Kâr</span>
              </div>
              <div className={`text-2xl font-bold text-blue-600 dark:text-blue-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                ₺{totalProfitInPeriod.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Toplam Gider */}
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-muted-foreground">Toplam Gider</span>
              </div>
              <div className={`text-2xl font-bold text-orange-600 dark:text-orange-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                ₺{totalExpenses.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Net Kâr */}
            <div className={`text-center p-4 rounded-lg border-2 ${netProfit >= 0
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {netProfit >= 0 ? (
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
                )}
                <span className="text-sm font-medium text-muted-foreground">Net Kâr</span>
              </div>
              <div className={`text-2xl font-bold ${netProfit >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
                } ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                {netProfit >= 0 ? '₺' : '-₺'}
                {Math.abs(netProfit).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {netProfit < 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Giderler kârdan fazla!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-orange-300 dark:border-orange-700 shadow-xl">
              <CardHeader className="bg-orange-50 dark:bg-orange-950/30">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">Yeni Gider Ekle</span>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setExpenseName("");
                      setExpenseAmount("");
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Hızlı Seçim */}
                <div className="space-y-2">
                  <Label>Hızlı Seçim</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickExpenses.map((name) => (
                      <Button
                        key={name}
                        onClick={() => setExpenseName(name)}
                        variant="outline"
                        size="sm"
                        className={`${expenseName === name
                          ? 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700'
                          : ''
                          }`}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gider Adı */}
                  <div className="space-y-2">
                    <Label htmlFor="expenseName">
                      Gider Adı *
                    </Label>
                    <Input
                      id="expenseName"
                      value={expenseName}
                      onChange={(e) => setExpenseName(e.target.value)}
                      placeholder="Örn: Telefon Faturası"
                      className="border-orange-200 dark:border-orange-800 border-2"
                    />
                  </div>

                  {/* Gider Tutarı */}
                  <div className="space-y-2">
                    <Label htmlFor="expenseAmount">
                      Gider Tutarı (₺) *
                    </Label>
                    <Input
                      id="expenseAmount"
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="border-orange-200 dark:border-orange-800 border-2"
                    />
                  </div>
                </div>

                {/* Kaydet Butonu */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleAddExpense}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Gider Ekle
                  </Button>
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gider Listesi ve Pasta Grafiği */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gider Listesi */}
          <Card className="border-2 border-gray-300 dark:border-gray-700 shadow-lg">
            <CardHeader className="bg-gray-50 dark:bg-gray-900/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Gider Listesi ({filteredExpenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50/50 dark:bg-orange-950/10 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                            {getExpenseIcon(expense.name)}
                          </div>
                          <div>
                            <span className="font-semibold block">{expense.name}</span>
                          </div>
                        </div>
                        <div className={`text-xl font-bold text-orange-600 dark:text-orange-400 mb-1 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                          ₺{expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          📅 {new Date(expense.createdAt).toLocaleString('tr-TR')}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeleteExpense(expense.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pasta Grafiği */}
          <Card className="border-2 border-gray-300 dark:border-gray-700 shadow-lg">
            <CardHeader className="bg-gray-50 dark:bg-gray-900/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Gider Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      isPrivacyMode ? "****" : `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Boş Durum */}
      {expenses.length === 0 && !showForm && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="font-semibold text-lg mb-2">Henüz Gider Yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              İşletmenizin giderlerini buradan takip edebilirsiniz
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              İlk Gideri Ekle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}