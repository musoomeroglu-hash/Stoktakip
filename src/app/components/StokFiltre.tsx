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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00e1ff] transition-colors" />
                <Input
                    placeholder="Ürün adı veya barkod ara..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 h-10 bg-white dark:bg-[#162a2d] border-[#d0e4e6] dark:border-[#2a4245] focus:border-[#00e1ff] focus:ring-[#00e1ff]/20 text-slate-900 dark:text-[#e8f5f6] placeholder:text-slate-400 dark:placeholder:text-[#9ab8bc] rounded-lg shadow-sm transition-all"
                />
            </div>

            <Select
                value={selectedCategoryId || "all"}
                onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
            >
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white dark:bg-[#162a2d] border-[#d0e4e6] dark:border-[#2a4245] text-slate-700 dark:text-[#e8f5f6] rounded-lg shadow-sm focus:border-[#00e1ff] focus:ring-[#00e1ff]/20">
                    <SelectValue placeholder="Tüm Kategoriler" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#162a2d] border-[#d0e4e6] dark:border-[#2a4245]">
                    <SelectItem value="all" className="dark:text-[#e8f5f6] dark:focus:bg-[#1e3639]">Tüm Kategoriler</SelectItem>
                    {mainCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="dark:text-[#e8f5f6] dark:focus:bg-[#1e3639]">
                            {cat.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
