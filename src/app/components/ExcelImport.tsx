import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ExcelImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: any[]) => void;
}

export function ExcelImport({ open, onOpenChange, onImport }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("Dosya boş veya geçersiz");
        return;
      }

      // Skip header line
      const products = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",").map(col => col.trim().replace(/^"|"$/g, ''));
        
        if (columns.length >= 6) {
          products.push({
            name: columns[0],
            category: columns[1],
            phoneModel: columns[2],
            quantity: parseInt(columns[3]) || 0,
            minQuantity: parseInt(columns[4]) || 0,
            price: parseFloat(columns[5]) || 0,
            description: columns[6] || "",
          });
        }
      }

      if (products.length > 0) {
        onImport(products);
        toast.success(`${products.length} ürün başarıyla yüklendi!`);
        setFile(null);
        onOpenChange(false);
      } else {
        toast.error("Geçerli ürün bulunamadı");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Dosya yüklenirken hata oluştu");
    }
  };

  const downloadTemplate = () => {
    const csv = `Ürün Adı,Kategori,Telefon Modeli,Stok Miktarı,Min Miktar,Fiyat,Açıklama
"Şeffaf Kılıf","Telefon Kılıfı","Apple iPhone 15 Pro Max",50,10,150,"Örnek ürün"
"Cam Ekran Koruyucu","Kırılmaz Ekran","Samsung Galaxy S24 Ultra",30,5,200,"Örnek ürün"`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stok-takip-sablon.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Şablon dosyası indirildi");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excel ile Toplu Yükleme</DialogTitle>
          <DialogDescription>
            CSV formatında ürün listesi yükleyerek toplu ekleme yapın
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Dosya Formatı
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              CSV dosyası aşağıdaki sütunları içermelidir:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Ürün Adı</li>
              <li>Kategori</li>
              <li>Telefon Modeli</li>
              <li>Stok Miktarı</li>
              <li>Min Miktar</li>
              <li>Fiyat</li>
              <li>Açıklama (opsiyonel)</li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={downloadTemplate}
          >
            <Download className="w-4 h-4 mr-2" />
            Şablon Dosyasını İndir
          </Button>

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "CSV dosyası seçin"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tıklayarak dosya seçin
              </p>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleImport} disabled={!file}>
            <Upload className="w-4 h-4 mr-2" />
            Yükle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
