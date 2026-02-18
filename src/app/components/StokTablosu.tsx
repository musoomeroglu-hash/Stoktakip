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
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            onClick={() => onViewDetail(product)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            onClick={() => onEdit(product)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => onDelete(product.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
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
            <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-950/50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/40 dark:bg-slate-900/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-12 text-slate-900 dark:text-slate-100 font-semibold">
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
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
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
