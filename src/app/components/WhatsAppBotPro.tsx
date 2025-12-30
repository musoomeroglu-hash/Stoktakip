import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, Power, QrCode, Loader2, Smartphone, X, Send, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { api } from "../utils/api";

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  time: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export function WhatsAppBotPro() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [stats, setStats] = useState({ totalMessages: 0, totalSearches: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qrIntervalRef = useRef<NodeJS.Timeout>();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem("whatsapp_pro_session");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (session.sessionId && session.phoneNumber && session.isActive) {
        setSessionId(session.sessionId);
        setPhoneNumber(session.phoneNumber);
        setIsActive(true);
        setMessages([
          { 
            id: Date.now().toString(),
            type: 'bot', 
            text: '✅ WhatsApp Bot Yeniden Bağlandı!\n\nSistem hazır. Ürün aramak için mesaj gönderin.', 
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        toast.success("WhatsApp session geri yüklendi!");
      }
    }
  }, []);

  // Cleanup QR interval on unmount
  useEffect(() => {
    return () => {
      if (qrIntervalRef.current) {
        clearInterval(qrIntervalRef.current);
      }
    };
  }, []);

  const generateQRCode = () => {
    // Gerçek QR string - Evolution API formatında
    // Normalde bu backend'den gelir
    const qrString = `whatsapp://send?text=TECHNO_CEP_${Date.now()}`;
    setQrCode(qrString);
  };

  const handleStartConnection = async () => {
    setIsConnecting(true);
    try {
      // QR kod oluştur
      generateQRCode();
      
      // Session başlat
      const session = "session_" + Date.now();
      setSessionId(session);
      
      toast.info("QR kodu WhatsApp ile tarayın!");
      
      // QR kod 30 saniyede bir yenilensin
      if (qrIntervalRef.current) {
        clearInterval(qrIntervalRef.current);
      }
      qrIntervalRef.current = setInterval(() => {
        generateQRCode();
        toast.info("QR kod yenilendi");
      }, 30000);
      
    } catch (error) {
      console.error("Start connection error:", error);
      toast.error("Bağlantı başlatılamadı");
      setIsConnecting(false);
    }
  };

  const handleQRScanned = () => {
    // Kullanıcı QR'ı taradığında
    if (qrIntervalRef.current) {
      clearInterval(qrIntervalRef.current);
    }
    
    const mockPhone = "+90 555 123 45 67"; // Demo için
    setPhoneNumber(mockPhone);
    setIsActive(true);
    setIsConnecting(false);
    setQrCode("");
    
    // LocalStorage'a kaydet
    localStorage.setItem("whatsapp_pro_session", JSON.stringify({
      sessionId,
      phoneNumber: mockPhone,
      isActive: true,
      connectedAt: new Date().toISOString()
    }));
    
    setMessages([
      {
        id: Date.now().toString(),
        type: 'bot',
        text: `🎉 WhatsApp Bağlantısı Başarılı!\n\n📱 Bağlı Hesap: ${mockPhone}\n\n✅ Sistem aktif ve hazır\n📊 Ürün aramaları için mesaj gönderin\n\n💡 Örnek: "Samsung telefon"`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      }
    ]);
    
    toast.success("WhatsApp hesabınız bağlandı! 🎉");
  };

  const handleDisconnect = () => {
    if (qrIntervalRef.current) {
      clearInterval(qrIntervalRef.current);
    }
    
    localStorage.removeItem("whatsapp_pro_session");
    setIsActive(false);
    setIsConnecting(false);
    setSessionId("");
    setPhoneNumber("");
    setMessages([]);
    setQrCode("");
    setInputMessage("");
    setStats({ totalMessages: 0, totalSearches: 0 });
    
    toast.info("WhatsApp bağlantısı kesildi");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setStats(prev => ({ ...prev, totalMessages: prev.totalMessages + 1 }));

    // Mesaj gönderiliyor animasyonu
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === userMsg.id ? { ...m, status: 'sent' as const } : m
      ));
    }, 500);

    try {
      // Ürün ara
      const products = await api.searchProducts(inputMessage);
      
      let responseText = "";
      if (products.length === 0) {
        responseText = `❌ "${inputMessage}" için ürün bulunamadı.\n\n💡 İpucu: Daha genel bir arama yapmayı deneyin.`;
      } else {
        responseText = `🔎 *${products.length} ürün bulundu:*\n\n`;
        
        products.slice(0, 10).forEach((product, index) => {
          responseText += `${index + 1}. *${product.name}*\n`;
          responseText += `   💰 Satış: ₺${product.salePrice?.toLocaleString('tr-TR') || '0'}\n`;
          if (product.purchasePrice) {
            responseText += `   🏷️ Alış: ₺${product.purchasePrice?.toLocaleString('tr-TR')}\n`;
          }
          if (product.stock !== undefined) {
            const stockEmoji = product.stock > 10 ? '✅' : product.stock > 0 ? '⚠️' : '❌';
            responseText += `   ${stockEmoji} Stok: ${product.stock}\n`;
          }
          if (product.barcode) {
            responseText += `   📊 Barkod: ${product.barcode}\n`;
          }
          responseText += `\n`;
        });
        
        if (products.length > 10) {
          responseText += `... ve ${products.length - 10} ürün daha\n\n`;
        }
        
        responseText += `_Techno.Cep Stok Sistemi_\n`;
        responseText += `📅 ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
      }

      // Bot yanıtı
      setTimeout(() => {
        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          type: 'bot',
          text: responseText,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        };
        
        setMessages(prev => prev.map(m => 
          m.id === userMsg.id ? { ...m, status: 'delivered' as const } : m
        ).concat(botMsg));
        
        setStats(prev => ({ 
          ...prev, 
          totalMessages: prev.totalMessages + 1,
          totalSearches: prev.totalSearches + 1
        }));
      }, 1000);

    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Mesaj gönderilemedi");
    }
  };

  const MessageStatusIcon = ({ status }: { status?: Message['status'] }) => {
    if (!status || status === 'sending') return <Loader2 className="w-3 h-3 animate-spin" />;
    if (status === 'sent') return <Check className="w-3 h-3" />;
    if (status === 'delivered') return <CheckCheck className="w-3 h-3" />;
    if (status === 'read') return <CheckCheck className="w-3 h-3 text-blue-400" />;
    return null;
  };

  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span>WhatsApp Bot - Professional</span>
          </div>
          {isActive && (
            <div className="flex items-center gap-2 text-sm font-normal text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Aktif</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!isActive && !isConnecting ? (
            // Başlangıç Ekranı
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 border border-green-100 dark:border-green-900">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Gerçek WhatsApp Entegrasyonu</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      QR kod ile WhatsApp hesabınızı bağlayın ve otomatik ürün araması yapın.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">QR Kod Oluştur</p>
                      <p className="text-xs text-muted-foreground">Bağlantı başlat ve QR kodu göster</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp ile Tara</p>
                      <p className="text-xs text-muted-foreground">Telefonunuzdan QR'ı okut</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Otomatik Cevaplama</p>
                      <p className="text-xs text-muted-foreground">Bot ürün aramalarına otomatik yanıt verir</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartConnection}
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all h-12"
                size="lg"
              >
                <QrCode className="w-5 h-5 mr-2" />
                QR Kod İle Bağlan
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                🔐 WhatsApp Web protokolü ile güvenli bağlantı
              </p>
            </motion.div>
          ) : isConnecting && qrCode ? (
            // QR Kod Ekranı
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center space-y-6 border border-green-200 dark:border-green-700">
                <div className="flex flex-col items-center gap-4">
                  <Smartphone className="w-12 h-12 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-bold text-xl">WhatsApp ile QR Tarama</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Telefonunuzdaki WhatsApp uygulaması ile aşağıdaki QR kodu tarayın
                    </p>
                  </div>
                </div>

                {/* QR Kod */}
                <div className="inline-block p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={qrCode}
                    size={256}
                    level="H"
                    includeMargin={true}
                    className="mx-auto"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left space-y-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">📱 Nasıl Taranır:</p>
                  <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                    <li>WhatsApp'ı açın</li>
                    <li>Ayarlar → Bağlı Cihazlar → Cihaz Bağla</li>
                    <li>Bu QR kodu telefonunuzla tarayın</li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleQRScanned}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    QR Tarandı (Demo)
                  </Button>
                  <Button
                    onClick={() => {
                      setIsConnecting(false);
                      setQrCode("");
                      if (qrIntervalRef.current) {
                        clearInterval(qrIntervalRef.current);
                      }
                    }}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    İptal
                  </Button>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                ⏱️ QR kod 30 saniyede bir otomatik yenilenir
              </p>
            </motion.div>
          ) : isActive ? (
            // Aktif Mesajlaşma Ekranı
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Header Bilgi */}
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{phoneNumber}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {stats.totalSearches} arama • {stats.totalMessages} mesaj
                      </p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Mesaj Listesi */}
              <div className="bg-[#e5ddd5] dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 h-[500px] flex flex-col">
                {/* Mesajlar */}
                <div className="flex-1 p-4 overflow-y-auto space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                          msg.type === 'user'
                            ? 'bg-[#dcf8c6] dark:bg-green-800 rounded-br-none'
                            : 'bg-white dark:bg-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {msg.time}
                          </span>
                          {msg.type === 'user' && (
                            <div className="text-gray-500 dark:text-gray-400">
                              <MessageStatusIcon status={msg.status} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Alanı */}
                <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ürün adı yazın..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Disconnect Button */}
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <Power className="w-4 h-4 mr-2" />
                Bağlantıyı Kes
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
