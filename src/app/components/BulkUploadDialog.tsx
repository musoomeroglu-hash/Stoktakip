import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Product, Category } from "../utils/api";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onBulkAdd: (products: Omit<Product, "id">[]) => Promise<void>;
}

export function BulkUploadDialog({ open, onOpenChange, categories, onBulkAdd }: BulkUploadDialogProps) {
  const [uploading, setUploading] = useState(false);

  // Excel şablon indir
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Ürün Adı": "Örnek Ürün 1",
        "Kategori": "Aksesuarlar → Kulaklık",
        "Barkod": "1234567890",
        "Stok": 10,
        "Min Stok": 5,
        "Alış Fiyatı": 50,
        "Satış Fiyatı": 75,
        "Açıklama": "Ürün açıklaması",
      },
      {
        "Ürün Adı": "Örnek Ürün 2",
        "Kategori": "Aksesuarlar → Şarj Aleti",
        "Barkod": "0987654321",
        "Stok": 20,
        "Min Stok": 10,
        "Alış Fiyatı": 30,
        "Satış Fiyatı": 50,
        "Açıklama": "Ürün açıklaması",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Şablon");

    XLSX.writeFile(wb, "urun_yukleme_sablonu.xlsx");
    toast.success("Şablon dosyası indirildi");
  };

  // Excel dosyası yükle
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<{
          "Ürün Adı": string;
          "Kategori": string;
          "Barkod"?: string;
          "Stok": number;
          "Min Stok": number;
          "Alış Fiyatı": number;
          "Satış Fiyatı": number;
          "Açıklama"?: string;
        }>(worksheet);

        const productsToAdd: Omit<Product, "id">[] = [];

        for (const row of jsonData) {
          // Kategori adını parse et (örn: "Aksesuarlar → Kulaklık")
          const categoryParts = row["Kategori"].split("→").map(s => s.trim());
          
          let categoryId = "";
          if (categoryParts.length === 2) {
            // Alt kategori ara
            const subCategory = categories.find(
              c => c.name === categoryParts[1] && 
              categories.find(p => p.id === c.parentId)?.name === categoryParts[0]
            );
            categoryId = subCategory?.id || "";
          }

          if (!categoryId) {
            toast.error(`Kategori bulunamadı: ${row["Kategori"]}`);
            continue;
          }

          productsToAdd.push({
            name: row["Ürün Adı"],
            categoryId,
            barcode: row["Barkod"] || "",
            stock: row["Stok"],
            minStock: row["Min Stok"],
            purchasePrice: row["Alış Fiyatı"],
            salePrice: row["Satış Fiyatı"],
            description: row["Açıklama"] || "",
            createdAt: new Date().toISOString(),
          });
        }

        if (productsToAdd.length > 0) {
          await onBulkAdd(productsToAdd);
          toast.success(`${productsToAdd.length} ürün eklendi`);
          onOpenChange(false);
        }
      } catch (error) {
        console.error("Excel yükleme hatası:", error);
        toast.error("Excel dosyası okunamadı");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Toplu Ürün Yükleme</DialogTitle>
          <DialogDescription>
            Excel dosyası ile birden fazla ürün ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Adım 1: Şablon İndir */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="font-medium">Excel Şablonunu İndirin</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Örnek veri içeren şablon dosyasını indirin ve doldurun
            </p>
            <Button 
              onClick={handleDownloadTemplate} 
              variant="outline" 
              className="ml-10"
            >
              <Download className="w-4 h-4 mr-2" />
              Şablon İndir
            </Button>
          </div>

          {/* Adım 2: Dosya Yükle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="font-medium">Doldurulmuş Dosyayı Yükleyin</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Ürün bilgilerini girdikten sonra Excel dosyasını yükleyin
            </p>
            <div className="ml-10">
              <label htmlFor="bulk-upload-input">
                <Button variant="default" disabled={uploading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Yükleniyor..." : "Excel Dosyası Yükle"}
                  </span>
                </Button>
              </label>
              <input
                id="bulk-upload-input"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Bilgi */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">Önemli Notlar:</p>
                <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                  <li>Kategori formatı: "Ana Kategori → Alt Kategori"</li>
                  <li>Sadece alt kategoriler kullanılabilir</li>
                  <li>Tüm zorunlu alanları doldurun</li>
                  <li>Fiyatlar ondalıklı sayı olabilir (örn: 49.99)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
