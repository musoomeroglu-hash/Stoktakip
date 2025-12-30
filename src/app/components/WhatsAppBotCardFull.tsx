import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, Power, CheckCircle2, Loader2, Smartphone, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../utils/api";
import { toast } from "sonner";

export function WhatsAppBotCardFull() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot', text: string, time: string }>>([]);
  const [stats, setStats] = useState({ totalMessages: 0, totalSearches: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem("whatsapp_session");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (session.sessionId && session.phoneNumber) {
        setSessionId(session.sessionId);
        setPhoneNumber(session.phoneNumber);
        setIsActive(true);
        setMessages([
          { 
            type: 'bot', 
            text: '✅ Bağlantı geri yüklendi!\n\nWhatsApp Bot aktif ve hazır.\nKendinize mesaj atarak ürün arayabilirsiniz.', 
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  }, []);

  const handleActivate = async () => {
    setIsConnecting(true);
    try {
      const { sessionId: newSessionId } = await api.initWhatsAppSession();
      setSessionId(newSessionId);
      toast.success("Session oluşturuldu! Telefon numaranızı girin.");
    } catch (error) {
      console.error("WhatsApp init error:", error);
      
      // Eğer backend 404 hatası veriyorsa, direkt local demo mode'a geç
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('404')) {
        toast.info("Backend henüz hazır değil, demo modda devam ediliyor...");
        // Demo session oluştur
        const demoSessionId = "demo_" + Date.now().toString();
        setSessionId(demoSessionId);
        toast.success("Demo session oluşturuldu! Telefon numaranızı girin.");
      } else {
        toast.error("Bağlantı başlatılamadı: " + errorMsg);
        setIsConnecting(false);
      }
    }
  };

  const handleConnect = async () => {
    if (!phoneNumber) {
      toast.error("Lütfen telefon numaranızı girin");
      return;
    }

    // Demo mode check
    if (sessionId.startsWith("demo_")) {
      // Save to localStorage
      localStorage.setItem("whatsapp_session", JSON.stringify({
        sessionId,
        phoneNumber,
        connectedAt: new Date().toISOString(),
        mode: "demo"
      }));

      setIsActive(true);
      setIsConnecting(false);
      setMessages([
        { 
          type: 'bot', 
          text: `✅ WhatsApp Bot Aktif! (Demo Mode)\n\n📱 Bağlı Numara: ${phoneNumber}\n\n💬 Aşağıdaki test butonlarını kullanarak ürün arayabilirsiniz.\n\n🔍 Örnek: "samsung" yazın!`, 
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      toast.success("WhatsApp Bot başarıyla bağlandı! (Demo Mode) 🎉");
      return;
    }

    try {
      await api.authenticateWhatsApp(sessionId, phoneNumber);
      
      // Save to localStorage
      localStorage.setItem("whatsapp_session", JSON.stringify({
        sessionId,
        phoneNumber,
        connectedAt: new Date().toISOString()
      }));

      setIsActive(true);
      setIsConnecting(false);
      setMessages([
        { 
          type: 'bot', 
          text: `✅ WhatsApp Bot Aktif!\n\n📱 Bağlı Numara: ${phoneNumber}\n\n💬 Artık kendinize WhatsApp mesajı atarak ürün arayabilirsiniz.\n\n🔍 Örnek: "samsung" yazın, bot size Samsung ürünlerini göndersin!`, 
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      toast.success("WhatsApp Bot başarıyla bağlandı! 🎉");
    } catch (error) {
      // Fallback to demo mode
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('404')) {
        toast.info("Backend hazır değil, demo moduna geçiliyor...");
        
        localStorage.setItem("whatsapp_session", JSON.stringify({
          sessionId,
          phoneNumber,
          connectedAt: new Date().toISOString(),
          mode: "demo"
        }));

        setIsActive(true);
        setIsConnecting(false);
        setMessages([
          { 
            type: 'bot', 
            text: `✅ WhatsApp Bot Aktif! (Demo Mode)\n\n📱 Bağlı Numara: ${phoneNumber}\n\n💬 Test butonlarını kullanarak ürün arayın.\n\n🔍 Örnek: "samsung"`, 
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        toast.success("Demo modunda bağlandı! 🎉");
      } else {
        toast.error("Bağlantı kurulamadı: " + errorMsg);
      }
    }
  };

  const handleDeactivate = async () => {
    try {
      if (sessionId) {
        await api.disconnectWhatsApp(sessionId);
      }
      localStorage.removeItem("whatsapp_session");
      setIsActive(false);
      setIsConnecting(false);
      setSessionId("");
      setPhoneNumber("");
      setMessages([]);
      setStats({ totalMessages: 0, totalSearches: 0 });
      toast.info("WhatsApp Bot bağlantısı kesildi");
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const handleSimulateMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    // Kullanıcı mesajını ekle
    setMessages(prev => [...prev, { type: 'user', text: userMessage, time: currentTime }]);
    setStats(prev => ({ ...prev, totalMessages: prev.totalMessages + 1 }));

    try {
      // Backend'den gerçek cevap al
      const response = await api.sendWhatsAppMessage(sessionId, phoneNumber, userMessage);
      
      // Bot cevabını ekle
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: response.message,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }]);
        setStats(prev => ({ 
          ...prev, 
          totalMessages: prev.totalMessages + 1,
          totalSearches: prev.totalSearches + 1
        }));
      }, 500);
    } catch (error) {
      // Demo mode fallback - local search
      console.error("Message send error, using demo mode:", error);
      
      try {
        const products = await api.searchProducts(userMessage);
        
        let responseMessage = "";
        if (products.length === 0) {
          responseMessage = `❌ "${userMessage}" için ürün bulunamadı.\n\n💡 İpucu: Daha genel arama yapmayı deneyin.`;
        } else {
          responseMessage = `🔎 *${products.length} ürün bulundu:*\n\n`;
          
          products.slice(0, 10).forEach((product, index) => {
            responseMessage += `${index + 1}. *${product.name}*\n`;
            responseMessage += `   💰 Satış: ₺${product.salePrice?.toLocaleString('tr-TR') || '0'}\n`;
            if (product.purchasePrice) {
              responseMessage += `   🏷️ Alış: ₺${product.purchasePrice?.toLocaleString('tr-TR')}\n`;
            }
            if (product.stock !== undefined) {
              const stockEmoji = product.stock > 10 ? '✅' : product.stock > 0 ? '⚠️' : '❌';
              responseMessage += `   ${stockEmoji} Stok: ${product.stock}\n`;
            }
            if (product.barcode) {
              responseMessage += `   📊 Barkod: ${product.barcode}\n`;
            }
            responseMessage += `\n`;
          });
          
          if (products.length > 10) {
            responseMessage += `... ve ${products.length - 10} ürün daha\n\n`;
          }
          
          responseMessage += `_Techno.Cep Stok Sistemi (Demo Mode)_\n`;
          responseMessage += `📅 ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            type: 'bot', 
            text: responseMessage,
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }]);
          setStats(prev => ({ 
            ...prev, 
            totalMessages: prev.totalMessages + 1,
            totalSearches: prev.totalSearches + 1
          }));
        }, 500);
      } catch (searchError) {
        toast.error("Ürün araması başarısız: " + (searchError as Error).message);
      }
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span>WhatsApp Bot - Tam Sürüm</span>
          {isActive && (
            <span className="ml-auto flex items-center gap-1 text-sm font-normal text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Aktif
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {!isActive && !isConnecting ? (
            // Başlangıç Durumu
            <motion.div
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 border border-green-100 dark:border-green-900">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-lg">Gerçek WhatsApp Entegrasyonu</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Telefon numaranızı kaydedip, kendinize WhatsApp mesajı atarak ürün sorgulayın.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="font-medium text-green-800 dark:text-green-300 mb-2">✨ Özellikler:</p>
                <ul className="space-y-1.5 text-sm text-green-700 dark:text-green-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Telefon numaranızla bağlantı kurma
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Gerçek zamanlı ürün arama
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Otomatik fiyat ve stok bilgisi
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Mesaj geçmişi ve istatistikler
                  </li>
                </ul>
              </div>

              <Button 
                onClick={handleActivate}
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <Power className="w-4 h-4 mr-2" />
                WhatsApp Bot'u Başlat
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                🔐 Telefon numaranız güvenli şekilde saklanır
              </p>
            </motion.div>
          ) : isConnecting ? (
            // Bağlanma Ekranı
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center space-y-4 border border-green-100 dark:border-green-900">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Bağlantı Kuruluyor...</span>
                </div>
                
                <div className="space-y-3 max-w-sm mx-auto">
                  <div className="text-left">
                    <label className="text-sm font-medium mb-2 block">
                      📱 WhatsApp Telefon Numaranız
                    </label>
                    <Input
                      type="tel"
                      placeholder="+90 555 123 4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="text-center text-lg"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Kendinize mesaj atacağınız numara
                    </p>
                  </div>

                  <Button
                    onClick={handleConnect}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!phoneNumber}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Bağlan
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 text-xs text-blue-800 dark:text-blue-300">
                  💡 <strong>Nasıl Kullanılır:</strong><br />
                  1. Telefon numaranızı girin ve bağlanın<br />
                  2. Kendinize WhatsApp mesajı atın (örn: "samsung")<br />
                  3. Bot size ürünleri otomatik gönderecek!
                </div>
              </div>

              <Button 
                onClick={() => setIsConnecting(false)}
                variant="outline"
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                İptal
              </Button>
            </motion.div>
          ) : (
            // Aktif Durum
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Bağlantı Bilgisi */}
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      📱 Bağlı Numara: {phoneNumber}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                      {stats.totalSearches} arama • {stats.totalMessages} mesaj
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Mesaj Geçmişi */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-sm font-medium">💬 Mesajlar</p>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-12">
                      <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-10" />
                      <p className="font-medium">Henüz mesaj yok</p>
                      <p className="text-xs mt-1">Kendinize WhatsApp'tan mesaj atın</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                              msg.type === 'user'
                                ? 'bg-green-600 text-white rounded-br-none'
                                : 'bg-gray-100 dark:bg-gray-700 text-foreground rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                            <p className={`text-xs mt-1 ${
                              msg.type === 'user' 
                                ? 'text-green-100' 
                                : 'text-muted-foreground'
                            }`}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </div>

              {/* Test Mesajı */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">🧪 Test Mesajı (Simülasyon)</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['samsung', 'iphone', 'xiaomi', 'kılıf', 'şarj'].map(quickSearch => (
                    <button
                      key={quickSearch}
                      onClick={() => handleSimulateMessage(quickSearch)}
                      className="bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      {quickSearch}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('testMessage') as HTMLInputElement;
                    handleSimulateMessage(input.value);
                    input.value = '';
                  }}
                  className="flex gap-2"
                >
                  <Input
                    name="testMessage"
                    placeholder='Ürün adı yazın...'
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                    Gönder
                  </Button>
                </form>
              </div>

              <Button 
                onClick={handleDeactivate}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <Power className="w-4 h-4 mr-2" />
                Bağlantıyı Kes
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}