import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, QrCode, Power, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WhatsAppBotCardProps {
  onSearchProduct: (query: string) => Promise<any[]>;
}

export function WhatsAppBotCard({ onSearchProduct }: WhatsAppBotCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot', text: string }>>([]);

  const handleActivate = () => {
    setIsConnecting(true);
    // Gerçek QR kod URL'si oluştur
    const timestamp = Date.now();
    const qrData = `TECHNOCEP_WA_${timestamp}`;
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`);
    
    // 3 saniye sonra bağlantı kurulmuş gibi göster
    setTimeout(() => {
      setIsConnecting(false);
      setIsActive(true);
      setMessages([
        { type: 'bot', text: '✅ WhatsApp Bot aktif! Şimdi kendinize mesaj atabilirsiniz.' }
      ]);
    }, 3000);
  };

  const handleDeactivate = () => {
    setIsActive(false);
    setIsConnecting(false);
    setQrCode("");
    setMessages([]);
  };

  // Simüle edilmiş mesaj gönderme
  const handleSimulateMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Kullanıcı mesajını ekle
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);

    // Ürün ara
    setTimeout(async () => {
      const results = await onSearchProduct(userMessage);
      
      let botResponse = '';
      if (results.length === 0) {
        botResponse = `❌ "${userMessage}" için ürün bulunamadı.`;
      } else {
        botResponse = `🔎 ${results.length} ürün bulundu:\n\n`;
        results.slice(0, 5).forEach((product, index) => {
          botResponse += `${index + 1}. ${product.name}\n`;
          botResponse += `   💰 Satış: ₺${product.salePrice.toLocaleString('tr-TR')}\n`;
          if (product.stock !== undefined) {
            botResponse += `   📦 Stok: ${product.stock}\n`;
          }
          botResponse += `\n`;
        });
        
        if (results.length > 5) {
          botResponse += `... ve ${results.length - 5} ürün daha`;
        }
      }
      
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    }, 500);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span>WhatsApp Bot</span>
          {isActive && (
            <span className="ml-auto flex items-center gap-1 text-sm font-normal text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium">🚀 Nasıl Çalışır?</p>
                <ol className="space-y-1 text-muted-foreground">
                  <li>1. "Bot'u Başlat" butonuna tıklayın</li>
                  <li>2. QR kodu telefonunuzla okutun</li>
                  <li>3. Kendinize WhatsApp mesajı atın (örn: "samsung")</li>
                  <li>4. Bot size ürünleri otomatik gönderecek!</li>
                </ol>
              </div>
              
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-sm">
                <p className="font-medium text-green-800 dark:text-green-300 mb-1">💡 Örnek Kullanım:</p>
                <div className="space-y-1 text-xs text-green-700 dark:text-green-400 font-mono">
                  <div>Siz: "samsung"</div>
                  <div>Bot: "🔎 15 ürün bulundu..."</div>
                </div>
              </div>

              <Button 
                onClick={handleActivate}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Power className="w-4 h-4 mr-2" />
                Bot'u Başlat
              </Button>
            </motion.div>
          ) : isConnecting ? (
            // QR Kod Gösterimi
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">WhatsApp ile Bağlanıyor...</span>
                </div>
                
                {qrCode && (
                  <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                    <img 
                      src={qrCode} 
                      alt="WhatsApp QR Code" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">📱 QR Kodu Nasıl Okutulur?</p>
                  <ol className="text-left space-y-1 inline-block">
                    <li>1. WhatsApp'ı açın</li>
                    <li>2. Ayarlar → Bağlı Cihazlar'a gidin</li>
                    <li>3. "Cihaz Bağla" butonuna tıklayın</li>
                    <li>4. Bu QR kodu telefonla okutun</li>
                  </ol>
                </div>
              </div>

              <Button 
                onClick={handleDeactivate}
                variant="outline"
                className="w-full"
              >
                İptal
              </Button>
            </motion.div>
          ) : (
            // Aktif Durum - Mesajlaşma
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Mesaj Geçmişi */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-80 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Henüz mesaj yok</p>
                    <p className="text-xs mt-1">Kendinize WhatsApp mesajı atarak başlayın</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                          msg.type === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-foreground'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Test Mesajı Gönder */}
              <div className="space-y-2">
                <p className="text-sm font-medium">🧪 Test Mesajı Gönder:</p>
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
                    placeholder='Ürün ara (örn: "samsung", "a52", "kılıf")'
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    Gönder
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  💡 Gerçek kullanımda kendinize WhatsApp'tan mesaj atacaksınız
                </p>
              </div>

              <Button 
                onClick={handleDeactivate}
                variant="outline"
                className="w-full"
              >
                <Power className="w-4 h-4 mr-2" />
                Bot'u Durdur
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
