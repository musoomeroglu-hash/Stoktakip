import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Category } from "../utils/api";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (category: Omit<Category, "id">) => void;
  categories: Category[];
  editCategory?: Category | null;
}

export function CategoryDialog({ open, onOpenChange, onAdd, categories, editCategory }: CategoryDialogProps) {
  const [name, setName] = useState(editCategory?.name || "");
  const [parentId, setParentId] = useState(editCategory?.parentId || "none");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      parentId: parentId === "none" ? undefined : parentId,
      createdAt: new Date().toISOString(),
    });
    setName("");
    setParentId("none");
    onOpenChange(false);
  };

  const mainCategories = categories.filter((c) => !c.parentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editCategory ? "Kategori Düzenle" : "Yeni Kategori"}</DialogTitle>
          <DialogDescription>
            Ana kategori veya alt kategori ekleyin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kategori Adı *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Elektronik, Giyim"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Üst Kategori (İsteğe Bağlı)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parent">
                  <SelectValue placeholder="Ana kategori olsun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ana Kategori</SelectItem>
                  {mainCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit">
              {editCategory ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}