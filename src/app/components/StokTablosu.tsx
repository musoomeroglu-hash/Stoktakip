"use client";

import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ArrowUpDown, Edit, Trash2, Eye } from "lucide-react";
import { StokBadge } from "./StokBadge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import type { Product, Category } from "../utils/api";

interface StokTablosuProps {
    products: Product[];
    categories: Category[];
    selectedProducts: Set<string>;
    onToggleSelection: (id: string) => void;
    onToggleAll: () => void;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onViewDetail: (product: Product) => void;
    getCategoryName: (id: string) => string;
    formatPrice: (price: number) => string;
    isPrivacyMode: boolean;
}

export function StokTablosu({
    products,
    categories,
    selectedProducts,
    onToggleSelection,
    onToggleAll,
    onEdit,
    onDelete,
    onViewDetail,
    getCategoryName,
    formatPrice,
    isPrivacyMode,
}: StokTablosuProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<Product>[] = [
        {
            id: "select",
            header: () => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onCheckedChange={onToggleAll}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={selectedProducts.has(row.original.id)}
                        onCheckedChange={() => onToggleSelection(row.original.id)}
                    />
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent p-0 font-semibold"
                >
                    Ürün Adı
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "categoryId",
            header: "Kategori",
            cell: ({ row }) => (
                <div className="text-slate-500 dark:text-slate-400">
                    {getCategoryName(row.getValue("categoryId"))}
                </div>
            ),
        },
        {
            accessorKey: "stock",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent p-0 font-semibold"
                    >
                        Stok
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className={`flex justify-center ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                    <StokBadge miktar={row.original.stock} minStok={row.original.minStock} />
                </div>
            ),
        },
        {
            accessorKey: "purchasePrice",
            header: () => <div className="text-right">Alış</div>,
            cell: ({ row }) => <div className={`text-right font-mono ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(row.getValue("purchasePrice"))}</div>,
        },
        {
            accessorKey: "salePrice",
            header: () => <div className="text-right">Satış</div>,
            cell: ({ row }) => <div className={`text-right font-mono font-semibold text-blue-600 dark:text-blue-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(row.getValue("salePrice"))}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-center">İşlemler</div>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                        onClick={() => onViewDetail(product)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Detayları Gör</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                        onClick={() => onEdit(product)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Düzenle</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        onClick={() => onDelete(product.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Sil</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        initialState: {
            pagination: {
                pageSize: 15,
            },
        },
    });

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-950/50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/40 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-12 text-slate-900 dark:text-slate-100 font-semibold text-center whitespace-nowrap px-4">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={`
                                        hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors even:bg-slate-50/50 dark:even:bg-slate-900/20
                                        ${row.original.stock <= row.original.minStock ? "border-l-4 border-l-red-500 dark:border-l-red-600" : ""}
                                    `}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 px-4 text-center">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Ürün bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const product = row.original;
                        return (
                            <div
                                key={row.id}
                                className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <Checkbox
                                            checked={selectedProducts.has(product.id)}
                                            onCheckedChange={() => onToggleSelection(product.id)}
                                            className="mt-1"
                                        />
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-slate-500">
                                                {getCategoryName(product.categoryId)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={isPrivacyMode ? "privacy-mode-blur" : ""}>
                                        <StokBadge miktar={product.stock} minStok={product.minStock} />
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fiyat Bilgisi</p>
                                        <div className="flex gap-3 items-center">
                                            <div className={isPrivacyMode ? "privacy-mode-blur" : ""}>
                                                <span className="text-[10px] text-slate-400 mr-1">Alış:</span>
                                                <span className="text-xs font-mono">{formatPrice(product.purchasePrice)}</span>
                                            </div>
                                            <div className={isPrivacyMode ? "privacy-mode-blur" : ""}>
                                                <span className="text-[10px] text-slate-400 mr-1">Satış:</span>
                                                <span className="text-sm font-mono font-bold text-blue-600 tracking-tight">
                                                    {formatPrice(product.salePrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 text-blue-600 border-blue-100 hover:bg-blue-50"
                                            onClick={() => onViewDetail(product)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 text-amber-600 border-amber-100 hover:bg-amber-50"
                                            onClick={() => onEdit(product)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 text-red-600 border-red-100 hover:bg-red-50"
                                            onClick={() => onDelete(product.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
                        Ürün bulunamadı.
                    </div>
                )}
            </div>


            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Toplam {products.length} ürün arasından {(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, products.length)} gösteriliyor.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8"
                    >
                        Önceki
                    </Button>
                    <div className="text-sm font-medium px-2">
                        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8"
                    >
                        Sonraki
                    </Button>
                </div>
            </div>
        </div>
    );
}
