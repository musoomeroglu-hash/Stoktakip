import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Banknote, CreditCard, Landmark, Wallet } from "lucide-react";
import type { PaymentMethod, PaymentDetails } from "../utils/api";

interface PaymentMethodSelectorProps {
  totalAmount: number;
  onPaymentChange: (method: PaymentMethod, details?: PaymentDetails) => void;
  formatPrice: (price: number) => string;
}

export function PaymentMethodSelector({ 
  totalAmount, 
  onPaymentChange,
  formatPrice 
}: PaymentMethodSelectorProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashAmount, setCashAmount] = useState<string>(totalAmount.toString());
  const [cardAmount, setCardAmount] = useState<string>("0");
  const [transferAmount, setTransferAmount] = useState<string>("0");

  useEffect(() => {
    // Update payment details when method or amounts change
    if (paymentMethod === "mixed") {
      const cash = parseFloat(cashAmount) || 0;
      const card = parseFloat(cardAmount) || 0;
      const transfer = parseFloat(transferAmount) || 0;
      
      onPaymentChange("mixed", {
        cash: cash > 0 ? cash : undefined,
        card: card > 0 ? card : undefined,
        transfer: transfer > 0 ? transfer : undefined,
      });
    } else {
      onPaymentChange(paymentMethod);
    }
  }, [paymentMethod, cashAmount, cardAmount, transferAmount]);

  const handleMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    // Reset amounts when changing method
    if (method !== "mixed") {
      setCashAmount(totalAmount.toString());
      setCardAmount("0");
      setTransferAmount("0");
    }
  };

  const getMixedTotal = () => {
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;
    const transfer = parseFloat(transferAmount) || 0;
    return cash + card + transfer;
  };

  const getMixedDifference = () => {
    return getMixedTotal() - totalAmount;
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Ödeme Yöntemi</Label>
        <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          Toplam: {formatPrice(totalAmount)}
        </div>
      </div>

      <RadioGroup value={paymentMethod} onValueChange={handleMethodChange}>
        <div className="grid grid-cols-2 gap-3">
          {/* Nakit */}
          <div
            className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
              paymentMethod === "cash"
                ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                : "border-gray-200 dark:border-gray-700 hover:border-green-300"
            }`}
            onClick={() => handleMethodChange("cash")}
          >
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
              <Banknote className="w-5 h-5 text-green-600" />
              <span className="font-medium">Nakit</span>
            </Label>
          </div>

          {/* Kart */}
          <div
            className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
              paymentMethod === "card"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
            }`}
            onClick={() => handleMethodChange("card")}
          >
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Kart</span>
            </Label>
          </div>

          {/* Havale */}
          <div
            className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
              paymentMethod === "transfer"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
            }`}
            onClick={() => handleMethodChange("transfer")}
          >
            <RadioGroupItem value="transfer" id="transfer" />
            <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer flex-1">
              <Landmark className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Havale/EFT</span>
            </Label>
          </div>

          {/* Karma */}
          <div
            className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
              paymentMethod === "mixed"
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
            }`}
            onClick={() => handleMethodChange("mixed")}
          >
            <RadioGroupItem value="mixed" id="mixed" />
            <Label htmlFor="mixed" className="flex items-center gap-2 cursor-pointer flex-1">
              <Wallet className="w-5 h-5 text-orange-600" />
              <span className="font-medium">Karma</span>
            </Label>
          </div>
        </div>
      </RadioGroup>

      {/* Karma Ödeme Detayları */}
      {paymentMethod === "mixed" && (
        <div className="space-y-3 pt-3 border-t-2 border-indigo-200 dark:border-indigo-800">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cashAmount" className="text-xs flex items-center gap-1">
                <Banknote className="w-3 h-3" /> Nakit
              </Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="border-green-300 dark:border-green-700"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cardAmount" className="text-xs flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Kart
              </Label>
              <Input
                id="cardAmount"
                type="number"
                step="0.01"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                className="border-blue-300 dark:border-blue-700"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="transferAmount" className="text-xs flex items-center gap-1">
                <Landmark className="w-3 h-3" /> Havale
              </Label>
              <Input
                id="transferAmount"
                type="number"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="border-purple-300 dark:border-purple-700"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Toplam Kontrolü */}
          <div
            className={`p-3 rounded-lg border-2 text-center ${
              Math.abs(getMixedDifference()) < 0.01
                ? "bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-700"
                : "bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Girilen Toplam:</span>
              <span className="font-bold">{formatPrice(getMixedTotal())}</span>
            </div>
            {Math.abs(getMixedDifference()) >= 0.01 && (
              <div className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                {getMixedDifference() > 0 ? "Fazla: " : "Eksik: "}
                {formatPrice(Math.abs(getMixedDifference()))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
