import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Plus, Edit, Trash2, User, Phone, Mail, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "../utils/api";
import { Textarea } from "./ui/textarea";

interface CariViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, "id">) => void;
  onUpdateCustomer: (id: string, customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddTransaction: (customerId: string, type: "debt" | "credit" | "payment_received" | "payment_made", amount: number, description: string) => void;
}

export function CariView({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer, onAddTransaction }: CariViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [transactionData, setTransactionData] = useState({
    type: "debt" as "debt" | "credit" | "payment_received" | "payment_made",
    amount: 0,
    description: "",
  });

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        notes: customer.notes || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      toast.error("Lütfen ad ve telefon alanlarını doldurun");
      return;
    }

    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, {
        ...editingCustomer,
        ...formData,
      });
    } else {
      onAddCustomer({
        ...formData,
        debt: 0,
        credit: 0,
        createdAt: new Date().toISOString(),
      });
    }

    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleOpenTransaction = (customer: Customer) => {
    setSelectedCustomer(customer);
    setTransactionData({
      type: "debt",
      amount: 0,
      description: "",
    });
    setTransactionDialogOpen(true);
  };

  const handleAddTransaction = () => {
    if (!selectedCustomer || transactionData.amount <= 0) {
      toast.error("Lütfen geçerli bir tutar girin");
      return;
    }

    onAddTransaction(
      selectedCustomer.id,
      transactionData.type,
      transactionData.amount,
      transactionData.description
    );

    setTransactionDialogOpen(false);
    setSelectedCustomer(null);
  };

  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);
  const totalCredit = customers.reduce((sum, c) => sum + c.credit, 0);
  const balance = totalDebt - totalCredit;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950 dark:to-red-900/50 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-700 dark:text-red-300">Toplam Borç</div>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">₺{totalDebt.toLocaleString('tr-TR')}</div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">Müşteriler bize borçlu</div>
              </div>
              <TrendingUp className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 dark:text-green-300">Toplam Alacak</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">₺{totalCredit.toLocaleString('tr-TR')}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">Biz müşterilere borçluyuz</div>
              </div>
              <TrendingDown className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200 dark:border-blue-800' : 'from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900/50 border-orange-200 dark:border-orange-800'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>Net Durum</div>
                <div className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-orange-900 dark:text-orange-100'}`}>
                  ₺{Math.abs(balance).toLocaleString('tr-TR')}
                </div>
                <div className={`text-xs mt-1 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {balance >= 0 ? 'Lehimizde' : 'Aleyhimizde'}
                </div>
              </div>
              <DollarSign className={`w-10 h-10 ${balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Cari Hesaplar ({customers.length})
            </CardTitle>
            <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Cari
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/30 dark:to-purple-900/30">
                  <th className="text-left p-3">Müşteri Adı</th>
                  <th className="text-left p-3">İletişim</th>
                  <th className="text-right p-3">Borç</th>
                  <th className="text-right p-3">Alacak</th>
                  <th className="text-right p-3">Bakiye</th>
                  <th className="text-center p-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => {
                  const balance = customer.debt - customer.credit;
                  const rowColor = index % 2 === 0 
                    ? "bg-white/50 dark:bg-gray-900/50" 
                    : "bg-indigo-50/30 dark:bg-indigo-950/20";

                  return (
                    <tr key={customer.id} className={`border-b ${rowColor} hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors`}>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.notes && (
                            <p className="text-xs text-muted-foreground">{customer.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-right p-3">
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          ₺{customer.debt.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-right p-3">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ₺{customer.credit.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-right p-3">
                        <Badge variant={balance > 0 ? "destructive" : balance < 0 ? "default" : "secondary"}>
                          {balance > 0 && '+'}₺{balance.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenTransaction(customer)}
                            title="İşlem Ekle"
                          >
                            <DollarSign className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm(`${customer.name} cari hesabını silmek istediğinize emin misiniz?`)) {
                                onDeleteCustomer(customer.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {customers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Henüz cari hesap eklenmemiş
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
          <DialogHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle>{editingCustomer ? "Cari Düzenle" : "Yeni Cari Ekle"}</DialogTitle>
            <DialogDescription>
              Müşteri bilgilerini girin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Müşteri Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ahmet Yılmaz"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0555 123 4567"
              />
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ornek@mail.com"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ek bilgiler..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle>İşlem Ekle - {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              Borç/Alacak işlemi ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="type">İşlem Tipi</Label>
              <select
                id="type"
                value={transactionData.type}
                onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value as any })}
                className="w-full border rounded-md p-2"
              >
                <option value="debt">Borç Ekle (Müşteri bize borçlandı)</option>
                <option value="credit">Alacak Ekle (Biz müşteriye borçlandık)</option>
                <option value="payment_received">Tahsilat (Borç ödemesi aldık)</option>
                <option value="payment_made">Ödeme (Alacak ödemesi yaptık)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="amount">Tutar (₺)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={transactionData.amount}
                onChange={(e) => setTransactionData({ ...transactionData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={transactionData.description}
                onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                placeholder="İşlem açıklaması..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>İptal</Button>
            <Button onClick={handleAddTransaction}>İşlemi Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
