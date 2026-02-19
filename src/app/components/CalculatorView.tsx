import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { motion } from "motion/react";
import { Delete, Calculator } from "lucide-react";

interface CalculatorViewProps {
  usdRate: number;
}

export function CalculatorView({ usdRate }: CalculatorViewProps) {
  const [tryValue, setTryValue] = useState<string>("");
  const [usdValue, setUsdValue] = useState<string>("");
  const [activeInput, setActiveInput] = useState<"try" | "usd">("try");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for numpad keys
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleNumberClick(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveInput(activeInput === 'try' ? 'usd' : 'try');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tryValue, usdValue, activeInput, usdRate]);

  const handleNumberClick = (num: string) => {
    if (activeInput === "try") {
      const newValue = tryValue + num;
      setTryValue(newValue);
      if (newValue && usdRate > 0) {
        setUsdValue((parseFloat(newValue) * usdRate).toFixed(2));
      }
    } else {
      const newValue = usdValue + num;
      setUsdValue(newValue);
      if (newValue && usdRate > 0) {
        setTryValue((parseFloat(newValue) / usdRate).toFixed(2));
      }
    }
  };

  const handleDecimal = () => {
    if (activeInput === "try") {
      if (!tryValue.includes(".")) {
        setTryValue(tryValue + ".");
      }
    } else {
      if (!usdValue.includes(".")) {
        setUsdValue(usdValue + ".");
      }
    }
  };

  const handleClear = () => {
    setTryValue("");
    setUsdValue("");
  };

  const handleDelete = () => {
    if (activeInput === "try") {
      const newValue = tryValue.slice(0, -1);
      setTryValue(newValue);
      if (newValue && usdRate > 0) {
        setUsdValue((parseFloat(newValue) * usdRate).toFixed(2));
      } else {
        setUsdValue("");
      }
    } else {
      const newValue = usdValue.slice(0, -1);
      setUsdValue(newValue);
      if (newValue && usdRate > 0) {
        setTryValue((parseFloat(newValue) / usdRate).toFixed(2));
      } else {
        setTryValue("");
      }
    }
  };

  const buttons = [
    { label: "C", type: "function", className: "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white" },
    { label: "⌫", type: "function", className: "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white" },
    { label: "00", type: "number", className: "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white" },
    { label: "/", type: "operator", className: "bg-orange-500 text-white", disabled: true },
    { label: "7", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "8", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "9", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "×", type: "operator", className: "bg-orange-500 text-white", disabled: true },
    { label: "4", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "5", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "6", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "-", type: "operator", className: "bg-orange-500 text-white", disabled: true },
    { label: "1", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "2", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "3", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "+", type: "operator", className: "bg-orange-500 text-white", disabled: true },
    { label: "0", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white col-span-2" },
    { label: ".", type: "number", className: "bg-gray-700 dark:bg-gray-800 text-white" },
    { label: "=", type: "operator", className: "bg-orange-500 text-white", disabled: true },
  ];

  const handleButtonClick = (button: typeof buttons[0]) => {
    if (button.disabled) return;

    if (button.label === "C") {
      handleClear();
    } else if (button.label === "⌫") {
      handleDelete();
    } else if (button.label === ".") {
      handleDecimal();
    } else if (button.type === "number") {
      handleNumberClick(button.label);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold">Döviz Çevirici</h2>
      </div>

      {/* Display */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 overflow-hidden">
        <CardContent className="p-6 space-y-4">
          {/* TRY Display */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveInput("try")}
            className={`cursor-pointer p-4 rounded-2xl transition-all ${
              activeInput === "try"
                ? "bg-blue-500/20 border-2 border-blue-500"
                : "bg-gray-800/50 border-2 border-transparent hover:border-gray-600"
            }`}
          >
            <div className="text-sm text-gray-400 mb-1">Türk Lirası (₺)</div>
            <div className="text-3xl font-light text-white text-right min-h-[40px] break-all">
              {tryValue || "0"}
            </div>
          </motion.div>

          {/* Exchange Rate Info */}
          <div className="text-center text-xs text-gray-500">
            {usdRate > 0 ? `1 USD = ${(1 / usdRate).toFixed(4)} TRY` : "Kur yükleniyor..."}
          </div>

          {/* USD Display */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveInput("usd")}
            className={`cursor-pointer p-4 rounded-2xl transition-all ${
              activeInput === "usd"
                ? "bg-green-500/20 border-2 border-green-500"
                : "bg-gray-800/50 border-2 border-transparent hover:border-gray-600"
            }`}
          >
            <div className="text-sm text-gray-400 mb-1">Dolar ($)</div>
            <div className="text-3xl font-light text-white text-right min-h-[40px] break-all">
              {usdValue || "0"}
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Keypad */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {buttons.map((button, index) => (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleButtonClick(button)}
                disabled={button.disabled}
                className={`
                  ${button.className}
                  ${button.label === "0" ? "col-span-2" : ""}
                  h-16 rounded-2xl text-2xl font-light
                  transition-all duration-150
                  hover:opacity-80 active:opacity-60
                  disabled:opacity-30 disabled:cursor-not-allowed
                  shadow-lg
                  flex items-center justify-center
                `}
              >
                {button.label === "⌫" ? <Delete className="w-6 h-6" /> : button.label}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="text-center space-y-1">
        <div className="text-xs text-muted-foreground">
          Hesaplamak istediğiniz para birimini seçin
        </div>
        <div className="text-xs text-blue-500 dark:text-blue-400">
          💡 Klavye Kısayolları: 0-9 (Rakamlar) • . (Nokta) • Backspace (Sil) • Esc (Temizle) • Tab (Değiştir)
        </div>
      </div>
    </div>
  );
}