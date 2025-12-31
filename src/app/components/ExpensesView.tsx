import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Receipt, Plus, X, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Expense {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
}

interface ExpensesViewProps {
  totalProfit: number; // Toplam kâr
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

export function ExpensesView({ totalProfit }: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // LocalStorage'dan verileri yükle
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // LocalStorage'a kaydet
  const saveToLocalStorage = (updatedExpenses: Expense[]) => {
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
  };

  const handleAddExpense = () => {
    if (!expenseName.trim()) {
      toast.error("Lütfen gider adını girin!");
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Lütfen geçerli bir tutar girin!");
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      name: expenseName.trim(),
      amount: amount,
      createdAt: new Date().toISOString()
    };

    const updatedExpenses = [newExpense, ...expenses];
    saveToLocalStorage(updatedExpenses);

    // Form temizle
    setExpenseName("");
    setExpenseAmount("");
    setShowForm(false);

    toast.success("Gider başarıyla eklendi!");
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    saveToLocalStorage(updatedExpenses);
    toast.success("Gider silindi");
  };

  // Toplam gider
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Net kâr (Toplam Kâr - Toplam Gider)
  const netProfit = totalProfit - totalExpenses;

  // Pasta grafiği için veri
  const chartData = expenses.map(exp => ({
    name: exp.name,
    value: exp.amount
  }));

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

      {/* Net Kâr Özet Kartı */}
      <Card className={`border-2 shadow-lg ${
        netProfit >= 0 
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
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₺{totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Toplam Gider */}
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-muted-foreground">Toplam Gider</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ₺{totalExpenses.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Net Kâr */}
            <div className={`text-center p-4 rounded-lg border-2 ${
              netProfit >= 0 
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
              <div className={`text-2xl font-bold ${
                netProfit >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
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
                        className={`${
                          expenseName === name 
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
                Gider Listesi ({expenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {expenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50/50 dark:bg-orange-950/10 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-semibold">{expense.name}</span>
                        </div>
                        <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
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
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => 
                      `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
