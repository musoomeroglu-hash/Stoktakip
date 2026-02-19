import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ClipboardList, Plus, X, Phone, User, Package, Calendar, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { api } from "../utils/api";
import { Trash2 } from "lucide-react";

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
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-yellow-200 dark:border-yellow-800">
            <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-lg text-yellow-700 dark:text-yellow-400">Bekleyen İstekler ({pendingRequests.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-white dark:bg-gray-950 border border-yellow-200 dark:border-yellow-900/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                <div className="p-5 pl-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold border-2 border-white dark:border-gray-900 shadow-sm">
                        {request.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{request.customerName}</h4>
                        <a href={`tel:${request.phoneNumber}`} className="text-xs text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {request.phoneNumber}
                        </a>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                      {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                      <span className="font-bold text-lg text-gray-800 dark:text-gray-200 leading-tight">
                        {request.productName}
                      </span>
                    </div>
                    {request.notes && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-yellow-50/50 dark:bg-yellow-950/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/20 italic">
                        "{request.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      onClick={() => handleMarkCompleted(request.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow transition-all"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Tamamla
                    </Button>
                    <Button
                      onClick={() => handleDeleteRequest(request.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tamamlanan İstekler */}
      {completedRequests.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-800">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">Tamamlanan İstekler ({completedRequests.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100 line-through decoration-gray-400">{request.customerName}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                      {request.productName}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Tamamlandı
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteRequest(request.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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