import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { FolderTree, Trash2 } from "lucide-react";
import { type Category, type Product } from "../utils/api";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  products: Product[];
  onDeleteCategory: (id: string) => void;
}

export function CategoryManagementDialog({
  open,
  onOpenChange,
  categories,
  products,
  onDeleteCategory,
}: CategoryManagementDialogProps) {
  const mainCategories = categories.filter((c) => !c.parentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kategori Yönetimi</DialogTitle>
          <DialogDescription>
            Kategorilerinizi görüntüleyin ve yönetin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {mainCategories.map((mainCat) => {
            const subCategories = categories.filter((c) => c.parentId === mainCat.id);
            const productCount = products.filter((p) => 
              p.categoryId === mainCat.id || 
              subCategories.some((sub) => sub.id === p.categoryId)
            ).length;

            return (
              <div key={mainCat.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FolderTree className="w-5 h-5 text-primary" />
                    <span className="font-medium">{mainCat.name}</span>
                    <Badge>{productCount} ürün</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteCategory(mainCat.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {subCategories.length > 0 && (
                  <div className="ml-8 space-y-1 mt-2">
                    {subCategories.map((subCat) => {
                      const subProductCount = products.filter(
                        (p) => p.categoryId === subCat.id
                      ).length;
                      return (
                        <div
                          key={subCat.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">→ {subCat.name}</span>
                            <Badge variant="outline">{subProductCount}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteCategory(subCat.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {mainCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Henüz kategori yok
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}