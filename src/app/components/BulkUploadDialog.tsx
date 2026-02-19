import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
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
    // Sistemdeki gerçek kategorileri kullanarak örnekler oluştur
    const subCategories = categories.filter(c => c.parentId);
    
    if (subCategories.length === 0) {
      toast.error("Önce kategori oluşturmalısınız! Kategori menüsünden ana kategori ve alt kategori ekleyin.", {
        duration: 5000
      });
      return;
    }
    
    // Tüm kategorileri dropdown için hazırla
    const categoryDropdownList = subCategories.map(subCat => {
      const parentCat = categories.find(c => c.id === subCat.parentId);
      return `${parentCat?.name || ""} → ${subCat.name}`;
    });
    
    const templateData = [];
    
    // İlk 3 alt kategoriyi örnek olarak kullan
    for (let i = 0; i < Math.min(3, subCategories.length); i++) {
      const subCat = subCategories[i];
      const parentCat = categories.find(c => c.id === subCat.parentId);
      
      if (parentCat) {
        templateData.push({
          "Ürün Adı": `Örnek Ürün ${i + 1}`,
          "Kategori": `${parentCat.name} → ${subCat.name}`,
          "Barkod": `${1000000000 + i}`,
          "Stok": 10,
          "Min Stok": 5,
          "Alış Fiyatı": 50,
          "Satış Fiyatı": 75,
          "Açıklama": "Ürün açıklaması",
        });
      }
    }

    // 50 boş satır daha ekle (kullanıcı için)
    for (let i = 3; i < 53; i++) {
      templateData.push({
        "Ürün Adı": "",
        "Kategori": "",
        "Barkod": "",
        "Stok": 0,
        "Min Stok": 0,
        "Alış Fiyatı": 0,
        "Satış Fiyatı": 0,
        "Açıklama": "",
      });
    }

    const wb = XLSX.utils.book_new();
    
    // Şablon sayfası
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Sütun genişliklerini ayarla
    ws['!cols'] = [
      { wch: 30 }, // Ürün Adı
      { wch: 35 }, // Kategori
      { wch: 15 }, // Barkod
      { wch: 10 }, // Stok
      { wch: 10 }, // Min Stok
      { wch: 12 }, // Alış Fiyatı
      { wch: 12 }, // Satış Fiyatı
      { wch: 30 }, // Açıklama
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

    // Kategoriler listesi sayfası (Dropdown referansı için)
    const categoryListData = categoryDropdownList.map(cat => ({ "Kategori": cat }));
    const wsCat = XLSX.utils.json_to_sheet(categoryListData);
    wsCat['!cols'] = [{ wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsCat, "Kategori Listesi");
    
    // Kategori açıklamaları sayfası
    const categoryDetailData = subCategories.map(subCat => {
      const parentCat = categories.find(c => c.id === subCat.parentId);
      return {
        "Ana Kategori": parentCat?.name || "",
        "Alt Kategori": subCat.name,
        "Excel'de Kullanım": `${parentCat?.name || ""} → ${subCat.name}`,
      };
    });
    const wsDetail = XLSX.utils.json_to_sheet(categoryDetailData);
    wsDetail['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsDetail, "Kategori Detayları");

    XLSX.writeFile(wb, "urun_yukleme_sablonu.xlsx");
    
    toast.success(
      "✅ Şablon indirildi! Kategori sütununa çift tıklayın ve aşağı ok ile kategorileri görebilirsiniz.", 
      { duration: 5000 }
    );
  };

  // Excel dosyası yükle
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Lütfen geçerli bir Excel dosyası seçin (.xlsx veya .xls)");
      event.target.value = "";
      return;
    }

    // Check if categories exist
    const subCategories = categories.filter(c => c.parentId);
    if (subCategories.length === 0) {
      toast.error("Önce kategori oluşturmalısınız! Kategori menüsünden ana kategori ve alt kategori ekleyin.", {
        duration: 5000
      });
      event.target.value = "";
      return;
    }

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

        // Filter out empty rows - boş satırları filtrele
        const validData = jsonData.filter(row => 
          row["Ürün Adı"] && 
          row["Ürün Adı"].toString().trim() !== "" &&
          row["Kategori"] && 
          row["Kategori"].toString().trim() !== ""
        );

        console.log(`Excel'den okunan toplam satır: ${jsonData.length}`);
        console.log(`Geçerli satır sayısı: ${validData.length}`);

        if (validData.length === 0) {
          toast.error("Excel dosyası boş veya geçersiz format");
          setUploading(false);
          event.target.value = "";
          return;
        }

        const productsToAdd: Omit<Product, "id">[] = [];
        const errors: string[] = [];

        for (let i = 0; i < validData.length; i++) {
          const row = validData[i];
          const rowNum = i + 2; // Excel'de satır numarası (başlık 1, veri 2'den başlar)

          // Kategori adını parse et (→, ->, - ayraçlarını destekle)
          const categoryInput = row["Kategori"].toString().trim();
          let categoryParts: string[] = [];
          
          // Farklı ayraçları dene
          if (categoryInput.includes("→")) {
            categoryParts = categoryInput.split("→").map(s => s.trim());
          } else if (categoryInput.includes("->")) {
            categoryParts = categoryInput.split("->").map(s => s.trim());
          } else if (categoryInput.includes("-")) {
            categoryParts = categoryInput.split("-").map(s => s.trim());
          } else if (categoryInput.includes(">")) {
            categoryParts = categoryInput.split(">").map(s => s.trim());
          } else {
            categoryParts = [categoryInput];
          }
          
          let categoryId = "";
          
          if (categoryParts.length === 2) {
            // İki parça var: Ana Kategori - Alt Kategori
            const [parentName, subName] = categoryParts;
            
            // Büyük/küçük harf duyarsız arama
            const subCategory = categories.find(
              c => c.name.toLowerCase() === subName.toLowerCase() && 
              c.parentId &&
              categories.find(p => p.id === c.parentId && p.name.toLowerCase() === parentName.toLowerCase())
            );
            categoryId = subCategory?.id || "";
          } else if (categoryParts.length === 1) {
            // Tek kategori adı: Sadece alt kategori olarak ara
            const subName = categoryParts[0];
            const subCategory = categories.find(
              c => c.name.toLowerCase() === subName.toLowerCase() && c.parentId
            );
            categoryId = subCategory?.id || "";
          }

          if (!categoryId) {
            // Kullanıcıya mevcut kategorileri göster
            const availableCats = categories.filter(c => c.parentId).slice(0, 3).map(subCat => {
              const parentCat = categories.find(p => p.id === subCat.parentId);
              return `${parentCat?.name || ""} → ${subCat.name}`;
            }).join(", ");
            errors.push(
              `Satır ${rowNum}: Kategori bulunamadı: "${row["Kategori"]}"\n` +
              `Örnek kategoriler: ${availableCats}`
            );
            continue;
          }

          productsToAdd.push({
            name: row["Ürün Adı"],
            categoryId,
            barcode: row["Barkod"] || "",
            stock: Number(row["Stok"]) || 0,
            minStock: Number(row["Min Stok"]) || 0,
            purchasePrice: Number(row["Alış Fiyatı"]) || 0,
            salePrice: Number(row["Satış Fiyatı"]) || 0,
            description: row["Açıklama"] || "",
            createdAt: new Date().toISOString(),
          });
        }

        // Hataları göster
        if (errors.length > 0) {
          const maxErrors = 5;
          const errorMsg = errors.slice(0, maxErrors).join("\n");
          const moreErrors = errors.length > maxErrors ? `\n... ve ${errors.length - maxErrors} hata daha` : "";
          toast.error(`${errors.length} hata bulundu:\n${errorMsg}${moreErrors}`, { duration: 6000 });
        }

        if (productsToAdd.length > 0) {
          await onBulkAdd(productsToAdd);
          toast.success(`${productsToAdd.length} ürün başarıyla eklendi!`);
          onOpenChange(false);
        } else if (errors.length === 0) {
          toast.error("Eklenecek geçerli ürün bulunamadı");
        }
      } catch (error) {
        console.error("Excel yükleme hatası:", error);
        toast.error("Excel dosyası okunamadı. Lütfen dosya formatını kontrol edin.");
      } finally {
        setUploading(false);
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Dosya okunamadı");
      setUploading(false);
      event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  // Mevcut alt kategorileri listele
  const subCategories = categories.filter(c => c.parentId);
  const categoryOptions = subCategories.map(subCat => {
    const parentCat = categories.find(c => c.id === subCat.parentId);
    return {
      parent: parentCat?.name || "",
      sub: subCat.name,
      format: `${parentCat?.name || ""} → ${subCat.name}`,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Toplu Ürün Yükleme</DialogTitle>
          <DialogDescription>
            Excel dosyası ile birden fazla ürün ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Sol Taraf - Adımlar */}
          <div className="space-y-6">
            {/* Adım 1: Şablon İndir */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <h3 className="font-medium">Excel Şablonunu İndirin</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Mevcut kategorilerinizle hazırlanmış şablonu indirin
              </p>
              <Button 
                onClick={handleDownloadTemplate} 
                variant="outline" 
                className="ml-10"
                disabled={categoryOptions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Şablon İndir
              </Button>
              {categoryOptions.length === 0 && (
                <p className="text-sm text-red-500 ml-10">
                  ⚠️ Önce kategori oluşturmalısınız
                </p>
              )}
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
                <div className="text-sm space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-100">📌 Kategori Dropdown Ekleme:</p>
                  <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 space-y-1 ml-2">
                    <li>Excel'de Kategori sütununun herhangi bir hücresini seçin</li>
                    <li>Veri → Veri Doğrulama menüsüne gidin</li>
                    <li>"Liste" seçeneğini seçin</li>
                    <li>Kaynak olarak "Kategori Listesi" sayfasını seçin</li>
                    <li>Veya "Kategori Detayları" sayfasından kopyala-yapıştır yapın</li>
                  </ol>
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <p className="font-medium text-blue-900 dark:text-blue-100">ℹ️ Önemli Notlar:</p>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1 ml-2">
                      <li>Kategori formatı: "Ana Kategori → Alt Kategori"</li>
                      <li>Tüm zorunlu alanları doldurun</li>
                      <li>Fiyatlar ondalıklı sayı olabilir (örn: 49.99)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Mevcut Kategoriler */}
          <div className="space-y-3">
            <h3 className="font-medium">📋 Kullanılabilir Kategoriler</h3>
            <p className="text-sm text-muted-foreground">
              Excel dosyanızda aşağıdaki kategori formatlarından birini kullanın:
            </p>
            <div className="rounded-lg border bg-card">
              {categoryOptions.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="divide-y">
                    {categoryOptions.map((cat, index) => (
                      <div key={index} className="p-3 hover:bg-muted/50 transition-colors">
                        <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {cat.format}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ana: {cat.parent} / Alt: {cat.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p className="mb-2">⚠️ Henüz kategori eklenmemiş</p>
                  <p className="text-sm">Önce "Kategori" menüsünden ana kategori ve alt kategori ekleyin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}