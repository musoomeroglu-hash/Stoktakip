import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Plus, Trash2, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product, SaleItem, PaymentMethod, PaymentDetails, Customer } from "../utils/api";
import { cn } from "./ui/utils";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

interface SalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleteSale: (
    items: SaleItem[], 
    totalPrice: number, 
    totalProfit: number, 
    paymentMethod?: PaymentMethod, 
    paymentDetails?: PaymentDetails,
    customerInfo?: { name: string; phone: string }
  ) => void;
  products: Product[];
  formatPrice: (price: number) => string;
  customers: Customer[];
}

export function SalesDialog({ open, onOpenChange, onCompleteSale, products, formatPrice, customers }: SalesDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | undefined>();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Müşteri seçildiğinde bilgileri doldur
  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "new") {
      setSelectedCustomerId(null);
      setCustomerName("");
      setCustomerPhone("");
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomerId(customerId);
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
      }
    }
  };

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      toast.error("Lütfen bir ürün seçin");
      return;
    }

    if (quantity <= 0) {
      toast.error("Geçerli bir miktar girin");
      return;
    }

    if (quantity > product.stock) {
      toast.error("Yetersiz stok!");
      return;
    }

    const existingItem = saleItems.find((item) => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        toast.error("Yetersiz stok!");
        return;
      }
      
      setSaleItems(
        saleItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity, profit: (product.salePrice - product.purchasePrice) * newQuantity }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          salePrice: product.salePrice,
          purchasePrice: product.purchasePrice,
          profit: (product.salePrice - product.purchasePrice) * quantity,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
    toast.success("Ürün sepete eklendi");
  };

  const removeItem = (productId: string) => {
    setSaleItems(saleItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast.error("Yetersiz stok!");
      return;
    }

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setSaleItems(
      saleItems.map((item) =>
        item.productId === productId
          ? { 
              ...item, 
              quantity: newQuantity,
              profit: (item.salePrice - product.purchasePrice) * newQuantity 
            }
          : item
      )
    );
  };

  const updateSalePrice = (productId: string, newSalePrice: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newSalePrice < 0) {
      toast.error("Satış fiyatı negatif olamaz!");
      return;
    }

    setSaleItems(
      saleItems.map((item) =>
        item.productId === productId
          ? { 
              ...item, 
              salePrice: newSalePrice,
              profit: (newSalePrice - product.purchasePrice) * item.quantity 
            }
          : item
      )
    );
  };

  const totalPrice = saleItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  const totalProfit = saleItems.reduce((sum, item) => sum + item.profit, 0);

  const handleCompleteSale = () => {
    if (saleItems.length === 0) {
      toast.error("Sepete ürün ekleyin");
      return;
    }

    onCompleteSale(saleItems, totalPrice, totalProfit, paymentMethod, paymentDetails, { name: customerName, phone: customerPhone });
    setSaleItems([]);
    onOpenChange(false);
  };

  const availableProducts = products.filter((p) => p.stock > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Satış Yap
          </DialogTitle>
          <DialogDescription>
            Ürünleri sepete ekleyin ve satışı tamamlayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add Product Section */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="font-medium mb-3">Ürün Ekle</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchOpen}
                      className="w-full justify-between"
                    >
                      {selectedProductId
                        ? availableProducts.find((p) => p.id === selectedProductId)?.name
                        : "Ürün ara veya seç..."}
                      <ShoppingCart className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0">
                    <Command>
                      <CommandInput placeholder="Ürün ara..." />
                      <CommandList>
                        <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {availableProducts.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => {
                                setSelectedProductId(product.id);
                                setSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProductId === product.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ₺{product.salePrice} - Stok: {product.stock}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Adet"
                />
              </div>
              <Button onClick={addItem} type="button">
                <Plus className="w-4 h-4 mr-2" />
                Ekle
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          {saleItems.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium">Sepet ({saleItems.length} ürün)</h3>
              <div className="border rounded-lg divide-y">
                {saleItems.map((item) => (
                  <div key={item.productId} className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          ₺{item.salePrice.toFixed(2)} x {item.quantity} = ₺{(item.salePrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Satış Fiyatı (₺)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.salePrice}
                          onChange={(e) => updateSalePrice(item.productId, parseFloat(e.target.value) || 0)}
                          className="h-9"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs text-muted-foreground">Adet</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Sepet boş - Ürün ekleyin
            </div>
          )}

          {/* Summary */}
          {saleItems.length > 0 && (
            <div className="p-4 border rounded-lg bg-primary/5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toplam Tutar:</span>
                  <span className="text-xl font-semibold">₺{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Toplam Kâr:</span>
                  <span className="font-semibold">₺{totalProfit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {saleItems.length > 0 && (
            <PaymentMethodSelector
              totalAmount={totalPrice}
              onPaymentChange={(method, details) => {
                setPaymentMethod(method);
                setPaymentDetails(details);
              }}
              formatPrice={formatPrice}
            />
          )}

          {/* Customer Information */}
          {saleItems.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-3">Müşteri Bilgileri</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={selectedCustomerId || "new"}
                    onValueChange={handleCustomerSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Müşteri seçin">
                        {selectedCustomerId
                          ? customers.find(c => c.id === selectedCustomerId)?.name
                          : "🆕 Yeni Müşteri"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">🆕 Yeni Müşteri</SelectItem>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Müşteri Adı</Label>
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Müşteri Adı"
                    disabled={selectedCustomerId !== null}
                  />
                </div>
                <div className="w-32">
                  <Label className="text-xs text-muted-foreground">Telefon</Label>
                  <Input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    disabled={selectedCustomerId !== null}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleCompleteSale} disabled={saleItems.length === 0}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Satışı Tamamla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}