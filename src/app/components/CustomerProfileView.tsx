import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import type { Sale, RepairRecord } from "../utils/api";
import type { PhoneSale } from "./PhoneSaleDialog";

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

interface CustomerProfileViewProps {
  sales: Sale[];
  repairs: RepairRecord[];
  phoneSales: PhoneSale[];
  formatPrice: (price: number) => string;
  onAddCustomerToSale?: (customerInfo: { name: string; phone: string }) => void;
}

export function CustomerProfileView({ 
  sales, 
  repairs, 
  phoneSales, 
  formatPrice 
}: CustomerProfileViewProps) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Get all unique customers from sales
  const getAllCustomers = () => {
    const customerMap = new Map<string, CustomerProfile>();

    // From sales
    sales.forEach(sale => {
      if (sale.customerInfo) {
        const key = sale.customerInfo.phone;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: key,
            name: sale.customerInfo.name,
            phone: sale.customerInfo.phone,
            createdAt: sale.date,
          });
        }
      }
    });

    // From repairs
    repairs.forEach(repair => {
      const key = repair.customerPhone;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: repair.customerName,
          phone: repair.customerPhone,
          createdAt: repair.createdAt,
        });
      }
    });

    // From phone sales
    phoneSales.forEach(phoneSale => {
      const key = phoneSale.customerPhone;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: phoneSale.customerName,
          phone: phoneSale.customerPhone,
          createdAt: phoneSale.date,
        });
      }
    });

    // Merge with manually added customers
    customers.forEach(customer => {
      if (!customerMap.has(customer.phone)) {
        customerMap.set(customer.phone, customer);
      } else {
        // Merge notes and email
        const existing = customerMap.get(customer.phone)!;
        existing.email = customer.email || existing.email;
        existing.notes = customer.notes || existing.notes;
      }
    });

    return Array.from(customerMap.values());
  };

  const allCustomers = getAllCustomers();

  // Calculate customer stats
  const getCustomerStats = (customerPhone: string) => {
    const customerSales = sales.filter(s => s.customerInfo?.phone === customerPhone);
    const customerRepairs = repairs.filter(r => r.customerPhone === customerPhone);
    const customerPhoneSales = phoneSales.filter(ps => ps.customerPhone === customerPhone);

    const totalRevenue = 
      customerSales.reduce((sum, s) => sum + s.totalPrice, 0) +
      customerRepairs.reduce((sum, r) => sum + r.repairCost, 0) +
      customerPhoneSales.reduce((sum, ps) => sum + ps.salePrice, 0);

    const totalTransactions = customerSales.length + customerRepairs.length + customerPhoneSales.length;

    const allDates = [
      ...customerSales.map(s => new Date(s.date)),
      ...customerRepairs.map(r => new Date(r.createdAt)),
      ...customerPhoneSales.map(ps => new Date(ps.date)),
    ].sort((a, b) => b.getTime() - a.getTime());

    const lastPurchaseDate = allDates[0];
    const firstPurchaseDate = allDates[allDates.length - 1];

    return {
      totalRevenue,
      totalTransactions,
      lastPurchaseDate,
      firstPurchaseDate,
      sales: customerSales,
      repairs: customerRepairs,
      phoneSales: customerPhoneSales,
    };
  };

  const handleSaveCustomer = () => {
    if (!name || !phone) {
      toast.error("İsim ve telefon gerekli!");
      return;
    }

    if (editingCustomer) {
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, name, phone, email, notes }
          : c
      ));
      toast.success("Müşteri güncellendi!");
    } else {
      const newCustomer: CustomerProfile = {
        id: Date.now().toString(),
        name,
        phone,
        email,
        notes,
        createdAt: new Date().toISOString(),
      };
      setCustomers([...customers, newCustomer]);
      toast.success("Müşteri eklendi!");
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast.success("Müşteri silindi!");
    if (selectedCustomer?.id === id) {
      setSelectedCustomer(null);
    }
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setEditingCustomer(null);
  };

  const filteredCustomers = allCustomers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  // Sort by total revenue
  const sortedCustomers = filteredCustomers.sort((a, b) => {
    const statsA = getCustomerStats(a.phone);
    const statsB = getCustomerStats(b.phone);
    return statsB.totalRevenue - statsA.totalRevenue;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Müşteri Profilleri
          </h2>
          <p className="text-muted-foreground mt-1">
            Müşterilerinizi ve alışveriş geçmişlerini takip edin
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Müşteri
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Müşteri ara (isim veya telefon)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">
            Müşteri Listesi ({sortedCustomers.length})
          </h3>
          
          {sortedCustomers.length > 0 ? (
            <div className="space-y-2 max-h-[800px] overflow-y-auto">
              {sortedCustomers.map((customer) => {
                const stats = getCustomerStats(customer.phone);
                return (
                  <Card
                    key={customer.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCustomer?.phone === customer.phone
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                        : ""
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <h4 className="font-semibold">{customer.name}</h4>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">
                              <ShoppingBag className="w-3 h-3 mr-1" />
                              {stats.totalTransactions} işlem
                            </Badge>
                            <Badge variant="outline" className="text-xs text-green-600">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {formatPrice(stats.totalRevenue)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          {customer.notes && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCustomer(customer);
                                setName(customer.name);
                                setPhone(customer.phone);
                                setEmail(customer.email || "");
                                setNotes(customer.notes || "");
                                setDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Henüz müşteri kaydı yok
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer Detail */}
        <div>
          {selectedCustomer ? (
            <Card className="sticky top-6">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {selectedCustomer.name}
                </CardTitle>
                <CardDescription>Müşteri Detayları</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {(() => {
                  const stats = getCustomerStats(selectedCustomer.phone);
                  
                  return (
                    <>
                      {/* Contact Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{selectedCustomer.phone}</span>
                        </div>
                        {selectedCustomer.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span>{selectedCustomer.email}</span>
                          </div>
                        )}
                        {selectedCustomer.notes && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm font-medium mb-1">Notlar:</p>
                            <p className="text-sm text-muted-foreground">{selectedCustomer.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-muted-foreground">Toplam Alışveriş</span>
                          </div>
                          <p className="text-lg font-bold text-green-600">
                            {formatPrice(stats.totalRevenue)}
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-1">
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-muted-foreground">Toplam İşlem</span>
                          </div>
                          <p className="text-lg font-bold text-blue-600">
                            {stats.totalTransactions} adet
                          </p>
                        </div>

                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-muted-foreground">İlk Alışveriş</span>
                          </div>
                          <p className="text-sm font-semibold text-purple-600">
                            {stats.firstPurchaseDate?.toLocaleDateString('tr-TR')}
                          </p>
                        </div>

                        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-medium text-muted-foreground">Son Alışveriş</span>
                          </div>
                          <p className="text-sm font-semibold text-orange-600">
                            {stats.lastPurchaseDate?.toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {/* Purchase History */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          Alışveriş Geçmişi
                        </h4>
                        
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {/* Product Sales */}
                          {stats.sales.map((sale) => (
                            <div
                              key={sale.id}
                              className="p-3 bg-white dark:bg-gray-800 rounded-lg border text-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">Ürün Satışı</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(sale.date).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {sale.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                    <span>{item.productName} x{item.quantity}</span>
                                    <span className="font-medium">
                                      {formatPrice(item.salePrice * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between mt-2 pt-2 border-t">
                                <span className="font-semibold">Toplam:</span>
                                <span className="font-bold text-green-600">
                                  {formatPrice(sale.totalPrice)}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Repairs */}
                          {stats.repairs.map((repair) => (
                            <div
                              key={repair.id}
                              className="p-3 bg-white dark:bg-gray-800 rounded-lg border text-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                                  Tamir
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(repair.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                              <p className="text-xs mb-1">{repair.deviceInfo}</p>
                              <p className="text-xs text-muted-foreground mb-2">
                                {repair.problemDescription}
                              </p>
                              <div className="flex justify-between">
                                <span className="font-semibold">Tutar:</span>
                                <span className="font-bold text-blue-600">
                                  {formatPrice(repair.repairCost)}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Phone Sales */}
                          {stats.phoneSales.map((phoneSale) => (
                            <div
                              key={phoneSale.id}
                              className="p-3 bg-white dark:bg-gray-800 rounded-lg border text-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30">
                                  Telefon Satışı
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(phoneSale.date).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                              <p className="text-xs mb-1">
                                {phoneSale.brand} {phoneSale.model}
                              </p>
                              <div className="flex justify-between">
                                <span className="font-semibold">Tutar:</span>
                                <span className="font-bold text-purple-600">
                                  {formatPrice(phoneSale.salePrice)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Detayları görmek için bir müşteri seçin</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">İsim *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Müşteri adı"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Müşteri hakkında notlar (ör: Sürekli kılıf alıyor)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveCustomer}>
              {editingCustomer ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
