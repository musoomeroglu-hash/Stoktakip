import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ClipboardList, Plus, X, Phone, User, Package, Calendar, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { api } from "@/app/utils/api";

interface CustomerRequest {
  id: string;
  customerName: string;
  phoneNumber: string;
  productName: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'completed';
}

export function CustomerRequestsView() {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [productName, setProductName] = useState("");
  const [notes, setNotes] = useState("");

  // Supabase'den verileri yükle
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.getCustomerRequests();
      setRequests(data);
      console.log("✅ İstek & Siparişler Supabase'den yüklendi:", data.length);
    } catch (error) {
      console.error("❌ İstek & Siparişler yüklenirken hata:", error);
      toast.error("İstekler yüklenemedi. Lütfen sayfayı yenileyin.");
    }
  };

  const handleAddRequest = async () => {
    if (!customerName.trim() || !phoneNumber.trim() || !productName.trim()) {
      toast.error("Lütfen tüm zorunlu alanları doldurun!");
      return;
    }

    try {
      const newRequest = await api.addCustomerRequest({
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        productName: productName.trim(),
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      setRequests([newRequest, ...requests]);
      console.log("✅ İstek Supabase'e kaydedildi:", newRequest);

      // Form temizle
      setCustomerName("");
      setPhoneNumber("");
      setProductName("");
      setNotes("");
      setShowForm(false);

      toast.success("İstek başarıyla kaydedildi!");
    } catch (error) {
      console.error("❌ İstek kaydedilemedi:", error);
      toast.error("İstek kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      const request = requests.find(req => req.id === id);
      if (!request) return;
      
      const updated = await api.updateCustomerRequest(id, { ...request, status: 'completed' });
      const updatedRequests = requests.map(req => req.id === id ? updated : req);
      setRequests(updatedRequests);
      toast.success("İstek tamamlandı olarak işaretlendi");
    } catch (error) {
      console.error("❌ İstek güncellenemedi:", error);
      toast.error("İstek güncellenemedi");
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await api.deleteCustomerRequest(id);
      const updatedRequests = requests.filter(req => req.id !== id);
      setRequests(updatedRequests);
      toast.success("İstek silindi");
    } catch (error) {
      console.error("❌ İstek silinemedi:", error);
      toast.error("İstek silinemedi");
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>İstek & Siparişler</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal text-muted-foreground">
                {pendingRequests.length} Bekleyen
              </span>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Yeni İstek
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-blue-300 dark:border-blue-700 shadow-xl">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">Yeni Müşteri İsteği</span>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setCustomerName("");
                      setPhoneNumber("");
                      setProductName("");
                      setNotes("");
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Müşteri Adı */}
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Müşteri Adı Soyadı *
                    </Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ahmet Yılmaz"
                      className="border-blue-200 dark:border-blue-800"
                    />
                  </div>

                  {/* Telefon */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      Telefon Numarası *
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0555 123 45 67"
                      className="border-blue-200 dark:border-blue-800"
                    />
                  </div>
                </div>

                {/* Ürün Adı */}
                <div className="space-y-2">
                  <Label htmlFor="productName" className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    İstenen Ürün *
                  </Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Samsung Galaxy A54 Mavi"
                    className="border-blue-200 dark:border-blue-800"
                  />
                </div>

                {/* Notlar */}
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    Notlar (Opsiyonel)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ek bilgiler, tercihler, özellikler..."
                    className="border-blue-200 dark:border-blue-800 min-h-[80px]"
                  />
                </div>

                {/* Kaydet Butonu */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleAddRequest}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    İsteği Kaydet
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

      {/* Bekleyen İstekler */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Bekleyen İstekler ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50/50 dark:bg-yellow-950/10 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Müşteri Bilgileri */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="font-semibold">{request.customerName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <a
                          href={`tel:${request.phoneNumber}`}
                          className="text-sm hover:underline"
                        >
                          {request.phoneNumber}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <span className="text-sm font-medium">{request.productName}</span>
                      </div>

                      {request.notes && (
                        <div className="pl-6 text-sm text-muted-foreground border-l-2 border-blue-200 dark:border-blue-800 ml-2">
                          {request.notes}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground pt-1">
                        📅 {new Date(request.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleMarkCompleted(request.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Tamamla
                      </Button>
                      <Button
                        onClick={() => handleDeleteRequest(request.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tamamlanan İstekler */}
      {completedRequests.length > 0 && (
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              Tamamlanan İstekler ({completedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {completedRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-950/10 opacity-75"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="font-semibold line-through decoration-green-500">
                          {request.customerName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-sm">{request.phoneNumber}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <span className="text-sm">{request.productName}</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        ✅ Tamamlandı: {new Date(request.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleDeleteRequest(request.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boş Durum */}
      {requests.length === 0 && !showForm && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
          <CardContent className="pt-12 pb-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="font-semibold text-lg mb-2">Henüz İstek Yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Müşterilerden gelen sipariş taleplerini buradan takip edebilirsiniz
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              İlk İsteği Ekle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}