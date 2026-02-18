import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Search } from "lucide-react";
import type { Category } from "../utils/api";

interface StokFiltreProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedCategoryId: string | null;
    onCategoryChange: (value: string | null) => void;
    categories: Category[];
}

export function StokFiltre({
    searchQuery,
    onSearchChange,
    selectedCategoryId,
    onCategoryChange,
    categories,
}: StokFiltreProps) {
    const mainCategories = categories.filter((c) => !c.parentId);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Ürün adı veya barkod ara..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm"
                />
            </div>

            <Select
                value={selectedCategoryId || "all"}
                onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
            >
                <SelectTrigger className="w-full sm:w-[240px] h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm">
                    <SelectValue placeholder="Kategori Filtrele" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {mainCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
