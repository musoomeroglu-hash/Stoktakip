import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Wrench, Phone, Calendar, DollarSign, Package, CheckCircle, Truck, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import type { RepairRecord } from "../utils/api";

interface RepairsViewProps {
  repairs: RepairRecord[];
  onUpdateStatus: (id: string, status: "in_progress" | "completed" | "delivered") => void;
  onUpdateRepair?: (id: string, data: Partial<RepairRecord>) => void;
  onDeleteRepair?: (id: string) => void;
  currency: "TRY" | "USD";
  usdRate: number;
  formatPrice: (price: number) => string;
  isPrivacyMode: boolean;
}

export function RepairsView({ repairs, onUpdateStatus, onUpdateRepair, onDeleteRepair, currency, usdRate, formatPrice, isPrivacyMode }: RepairsViewProps) {
  const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Date range states
  const [startDate, setStartDate] = useState<string>(() => {
    // Default: ayın ilk günü
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const year = firstDay.getFullYear();
    const month = String(firstDay.getMonth() + 1).padStart(2, '0');
    const day = String(firstDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [endDate, setEndDate] = useState<string>(() => {
    // Default: ayın son günü
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const year = lastDay.getFullYear();
    const month = String(lastDay.getMonth() + 1).padStart(2, '0');
    const day = String(lastDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  // Quick date range setters
  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startYear = firstDay.getFullYear();
    const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
    const startDay = String(firstDay.getDate()).padStart(2, '0');
    setStartDate(`${startYear}-${startMonth}-${startDay}`);

    const endYear = lastDay.getFullYear();
    const endMonth = String(lastDay.getMonth() + 1).padStart(2, '0');
    const endDay = String(lastDay.getDate()).padStart(2, '0');
    setEndDate(`${endYear}-${endMonth}-${endDay}`);
  };

  const setPreviousMonth = () => {
    const now = new Date();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const startYear = firstDayPrevMonth.getFullYear();
    const startMonth = String(firstDayPrevMonth.getMonth() + 1).padStart(2, '0');
    const startDay = String(firstDayPrevMonth.getDate()).padStart(2, '0');
    setStartDate(`${startYear}-${startMonth}-${startDay}`);

    const endYear = lastDayPrevMonth.getFullYear();
    const endMonth = String(lastDayPrevMonth.getMonth() + 1).padStart(2, '0');
    const endDay = String(lastDayPrevMonth.getDate()).padStart(2, '0');
    setEndDate(`${endYear}-${endMonth}-${endDay}`);
  };

  const setAllTime = () => {
    setStartDate('2020-01-01');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setEndDate(`${year}-${month}-${day}`);
  };

  // Edit form state
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerPhone: "",
    deviceInfo: "",
    imei: "",
    problemDescription: "",
    repairCost: 0,
    partsCost: 0,
    status: "in_progress" as "in_progress" | "completed" | "delivered",
  });

  // Grouping repairs by status with date filtering
  const filteredRepairs = useMemo(() => {
    return repairs.filter(r => isDateInRange(r.createdAt));
  }, [repairs, startDate, endDate]);

  const inProgressRepairs = filteredRepairs.filter(r => r.status === "in_progress");
  const completedRepairs = filteredRepairs.filter(r => r.status === "completed");
  const deliveredRepairs = filteredRepairs.filter(r => r.status === "delivered");

  // Summary statistics
  const totalRevenue = deliveredRepairs.reduce((sum, r) => sum + r.repairCost, 0);
  const totalProfit = deliveredRepairs.reduce((sum, r) => sum + r.profit, 0);

  // Handle edit repair
  const handleEditRepair = (repair: RepairRecord) => {
    setEditingRepair(repair);
    setEditForm({
      customerName: repair.customerName,
      customerPhone: repair.customerPhone,
      deviceInfo: repair.deviceInfo,
      imei: repair.imei || "",
      problemDescription: repair.problemDescription,
      repairCost: repair.repairCost,
      partsCost: repair.partsCost,
      status: repair.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRepair || !onUpdateRepair) return;

    const profit = editForm.repairCost - editForm.partsCost;

    onUpdateRepair(editingRepair.id!, {
      ...editForm,
      profit,
    });

    setEditDialogOpen(false);
    setEditingRepair(null);
    toast.success("Tamir kaydı güncellendi");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Tamir Ediliyor</div>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">{inProgressRepairs.length}</div>
              </div>
              <Wrench className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900/50 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-700 dark:text-slate-300">Teslim Bekleyen</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{completedRepairs.length}</div>
              </div>
              <CheckCircle className="w-10 h-10 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Toplam Gelir</div>
                <div className={`text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(totalRevenue)}</div>
              </div>
              <DollarSign className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 dark:text-green-300">Toplam Kâr</div>
                <div className={`text-3xl font-bold text-green-900 dark:text-green-100 mt-2 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(totalProfit)}</div>
              </div>
              <Package className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">Tarih Aralığı:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto border-2 border-blue-300 dark:border-blue-700"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto border-2 border-blue-300 dark:border-blue-700"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={setCurrentMonth}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700"
                >
                  Bu Ay
                </Button>
                <Button
                  onClick={setPreviousMonth}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700"
                >
                  Geçen Ay
                </Button>
                <Button
                  onClick={setAllTime}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700"
                >
                  Tüm Zamanlar
                </Button>
              </div>

              <div className="ml-auto bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(startDate), "dd MMM yyyy", { locale: tr })} - {format(new Date(endDate), "dd MMM yyyy", { locale: tr })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repairs List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* In Progress - Orange */}
        <Card className="bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-950/20 dark:to-gray-900 border-t-4 border-t-orange-500">
          <CardHeader className="bg-orange-50/50 dark:bg-orange-950/30 pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Wrench className="w-5 h-5" />
              Tamir Ediliyor ({inProgressRepairs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {inProgressRepairs.map((repair) => (
              <RepairCard
                key={repair.id}
                repair={repair}
                onUpdateStatus={onUpdateStatus}
                onEdit={handleEditRepair}
                onDelete={onDeleteRepair}
                formatPrice={formatPrice}
                isPrivacyMode={isPrivacyMode}
              />
            ))}
            {inProgressRepairs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                <Wrench className="w-12 h-12 mb-2" />
                <p>Tamir işleminde cihaz yok</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed (Waiting) - Slate */}
        <Card className="bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-950/20 dark:to-gray-900 border-t-4 border-t-slate-500">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-950/30 pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-400">
              <CheckCircle className="w-5 h-5" />
              Teslim Bekleyen ({completedRepairs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {completedRepairs.map((repair) => (
              <RepairCard
                key={repair.id}
                repair={repair}
                onUpdateStatus={onUpdateStatus}
                onEdit={handleEditRepair}
                onDelete={onDeleteRepair}
                formatPrice={formatPrice}
                isPrivacyMode={isPrivacyMode}
              />
            ))}
            {completedRepairs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                <CheckCircle className="w-12 h-12 mb-2" />
                <p>Teslim bekleyen cihaz yok</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivered - Green */}
        <Card className="bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/20 dark:to-gray-900 border-t-4 border-t-green-500">
          <CardHeader className="bg-green-50/50 dark:bg-green-950/30 pb-2">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Truck className="w-5 h-5" />
              Teslim Edildi ({deliveredRepairs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {deliveredRepairs.map((repair) => (
              <RepairCard
                key={repair.id}
                repair={repair}
                onUpdateStatus={onUpdateStatus}
                onEdit={handleEditRepair}
                onDelete={onDeleteRepair}
                formatPrice={formatPrice}
                isPrivacyMode={isPrivacyMode}
              />
            ))}
            {deliveredRepairs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                <Truck className="w-12 h-12 mb-2" />
                <p>Teslim edilen cihaz yok</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Repair Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tamir Kaydını Düzenle</DialogTitle>
            <DialogDescription>
              Tamir bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customer-name">Müşteri Adı</Label>
                <Input
                  id="edit-customer-name"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-customer-phone">Telefon</Label>
                <Input
                  id="edit-customer-phone"
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-device-info">Cihaz Bilgisi</Label>
              <Input
                id="edit-device-info"
                value={editForm.deviceInfo}
                onChange={(e) => setEditForm({ ...editForm, deviceInfo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imei">IMEI</Label>
              <Input
                id="edit-imei"
                value={editForm.imei}
                onChange={(e) => setEditForm({ ...editForm, imei: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-problem">Arıza Açıklaması</Label>
              <Textarea
                id="edit-problem"
                value={editForm.problemDescription}
                onChange={(e) => setEditForm({ ...editForm, problemDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-repair-cost">Tamir Ücreti (₺)</Label>
                <Input
                  id="edit-repair-cost"
                  type="number"
                  step="0.01"
                  value={editForm.repairCost}
                  onChange={(e) => setEditForm({ ...editForm, repairCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parts-cost">Malzeme Maliyeti (₺)</Label>
                <Input
                  id="edit-parts-cost"
                  type="number"
                  step="0.01"
                  value={editForm.partsCost}
                  onChange={(e) => setEditForm({ ...editForm, partsCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Kâr</p>
              <p className={`text-2xl font-bold text-green-600 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                ₺{(editForm.repairCost - editForm.partsCost).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveEdit}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RepairCard({
  repair,
  onUpdateStatus,
  onEdit,
  onDelete,
  formatPrice,
  isPrivacyMode
}: {
  repair: RepairRecord;
  onUpdateStatus: (id: string, status: "in_progress" | "completed" | "delivered") => void;
  onEdit: (repair: RepairRecord) => void;
  onDelete?: (id: string) => void;
  formatPrice: (price: number) => string;
  isPrivacyMode: boolean;
}) {
  const nextStatus = getNextStatus(repair.status);
  const NextIcon = nextStatus?.icon;

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight">{repair.deviceInfo}</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                {repair.customerName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{repair.customerName}</span>
              {getStatusBadge(repair.status)}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(repair)}
              className="h-8 w-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (window.confirm("Bu tamir kaydını silmek istediğinize emin misiniz?")) {
                    onDelete(repair.id);
                  }
                }}
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          {repair.customerPhone}
        </div>

        {/* IMEI */}
        {repair.imei && (
          <div className="text-sm">
            <span className="text-muted-foreground">IMEI:</span>
            <p className="font-mono">{repair.imei}</p>
          </div>
        )}

        {/* Problem */}
        <div className="text-sm">
          <p className="text-muted-foreground line-clamp-2">{repair.problemDescription}</p>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Tamir Ücreti:</span>
            <p className={`font-medium ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(repair.repairCost)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Kâr:</span>
            <p className={`font-medium text-green-600 dark:text-green-400 ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(repair.profit)}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {format(new Date(repair.createdAt), "dd MMM yyyy, HH:mm", { locale: tr })}
        </div>

        {/* Action Button */}
        {nextStatus && (
          <Button
            onClick={() => onUpdateStatus(repair.id, nextStatus.status)}
            className="w-full"
            size="sm"
            variant={nextStatus.status === "delivered" ? "default" : "outline"}
          >
            {NextIcon && <NextIcon className="w-4 h-4 mr-2" />}
            {nextStatus.label}
          </Button>
        )}

        {repair.status === "delivered" && repair.deliveredAt && (
          <div className="text-xs text-muted-foreground text-center">
            Teslim: {format(new Date(repair.deliveredAt), "dd MMM yyyy, HH:mm", { locale: tr })}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadge(status: RepairRecord["status"]) {
  switch (status) {
    case "in_progress":
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-orange-200">Tamir Ediliyor</Badge>;
    case "completed":
      return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200">Teslim Bekliyor</Badge>;
    case "delivered":
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200">Teslim Edildi</Badge>;
  }
}

function getNextStatus(currentStatus: RepairRecord["status"]) {
  switch (currentStatus) {
    case "in_progress":
      return { status: "completed" as const, label: "Tamamlandı", icon: CheckCircle };
    case "completed":
      return { status: "delivered" as const, label: "Teslim Et", icon: Truck };
    default:
      return null;
  }
}