import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Wrench, Phone, Calendar, DollarSign, Package, CheckCircle, Truck, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { useState, useMemo } from "react";
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

export function RepairsView({ repairs, onUpdateStatus, onUpdateRepair, onDeleteRepair, formatPrice, isPrivacyMode }: RepairsViewProps) {
  const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
  });

  const isDateInRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
    setEndDate(`${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`);
  };
  const setPreviousMonth = () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(`${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}-01`);
    setEndDate(`${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`);
  };
  const setAllTime = () => {
    setStartDate("2020-01-01");
    const now = new Date();
    setEndDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  };

  const [editForm, setEditForm] = useState({
    customerName: "", customerPhone: "", deviceInfo: "", imei: "",
    problemDescription: "", repairCost: 0, partsCost: 0,
    status: "in_progress" as "in_progress" | "completed" | "delivered",
  });

  const filteredRepairs = useMemo(() => repairs.filter(r => isDateInRange(r.createdAt)), [repairs, startDate, endDate]);
  const inProgressRepairs = filteredRepairs.filter(r => r.status === "in_progress");
  const completedRepairs = filteredRepairs.filter(r => r.status === "completed");
  const deliveredRepairs = filteredRepairs.filter(r => r.status === "delivered");
  const totalRevenue = deliveredRepairs.reduce((s, r) => s + r.repairCost, 0);
  const totalProfit = deliveredRepairs.reduce((s, r) => s + r.profit, 0);

  const handleEditRepair = (repair: RepairRecord) => {
    setEditingRepair(repair);
    setEditForm({ customerName: repair.customerName, customerPhone: repair.customerPhone, deviceInfo: repair.deviceInfo, imei: repair.imei || "", problemDescription: repair.problemDescription, repairCost: repair.repairCost, partsCost: repair.partsCost, status: repair.status });
    setEditDialogOpen(true);
  };
  const handleSaveEdit = () => {
    if (!editingRepair || !onUpdateRepair) return;
    onUpdateRepair(editingRepair.id!, { ...editForm, profit: editForm.repairCost - editForm.partsCost });
    setEditDialogOpen(false); setEditingRepair(null); toast.success("Tamir kaydı güncellendi");
  };

  // Kanban sütun config
  const columns = [
    { key: "in_progress", label: "Tamir Ediliyor", count: inProgressRepairs.length, items: inProgressRepairs, icon: Wrench, color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.4)", emptyIcon: Wrench, emptyLabel: "Tamir işleminde cihaz yok" },
    { key: "completed", label: "Teslim Bekleyen", count: completedRepairs.length, items: completedRepairs, icon: CheckCircle, color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.35)", emptyIcon: CheckCircle, emptyLabel: "Teslim bekleyen cihaz yok" },
    { key: "delivered", label: "Teslim Edildi", count: deliveredRepairs.length, items: deliveredRepairs, icon: Truck, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.4)", emptyIcon: Truck, emptyLabel: "Teslim edilen cihaz yok" },
  ];

  const kpis = [
    { label: "Tamir Ediliyor", value: String(inProgressRepairs.length), icon: Wrench, color: "#f97316", bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.4)", blurred: false },
    { label: "Teslim Bekleyen", value: String(completedRepairs.length), icon: CheckCircle, color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)", blurred: false },
    { label: "Toplam Gelir", value: formatPrice(totalRevenue), icon: DollarSign, color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.35)", blurred: true },
    { label: "Toplam Kâr", value: formatPrice(totalProfit), icon: Package, color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.35)", blurred: true },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="relative overflow-hidden rounded-xl border p-5 bg-white dark:bg-[#162a2d] group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" style={{ borderColor: kpi.border }}>
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity" style={{ background: kpi.bg }} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9ab8bc]">{kpi.label}</p>
                <div className="p-2 rounded-lg" style={{ background: kpi.bg }}>
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <p className={`text-3xl font-bold tabular-nums text-slate-900 dark:text-white ${kpi.blurred && isPrivacyMode ? "privacy-mode-blur" : ""}`}>{kpi.value}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, ${kpi.color}60, transparent)` }} />
          </div>
        ))}
      </div>

      {/* Tarih Filtresi */}
      <div className="rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-white dark:bg-[#162a2d] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Calendar className="w-4 h-4 text-[#00e1ff]" />
            <span className="text-sm font-semibold text-slate-700 dark:text-[#e8f5f6]">Tarih Aralığı:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] text-slate-800 dark:text-[#e8f5f6] text-sm focus:outline-none focus:border-[#00e1ff]" />
              <span className="text-slate-400">-</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] text-slate-800 dark:text-[#e8f5f6] text-sm focus:outline-none focus:border-[#00e1ff]" />
            </div>
            <div className="flex gap-2">
              {[{ label: "Bu Ay", fn: setCurrentMonth }, { label: "Geçen Ay", fn: setPreviousMonth }, { label: "Tüm Zamanlar", fn: setAllTime }].map(btn => (
                <button key={btn.label} onClick={btn.fn}
                  className="h-9 px-3 rounded-lg border border-[#d0e4e6] dark:border-[#2a4245] bg-white dark:bg-[#1e3639] text-slate-600 dark:text-[#9ab8bc] hover:border-[#00e1ff]/50 hover:text-[#00e1ff] text-sm font-medium transition-all duration-200">
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#d0e4e6] dark:border-[#2a4245] bg-[#f5f8f8] dark:bg-[#1e3639] text-sm text-slate-600 dark:text-[#9ab8bc] shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#00e1ff]" />
            {format(new Date(startDate), "dd MMM yyyy", { locale: tr })} - {format(new Date(endDate), "dd MMM yyyy", { locale: tr })}
          </div>
        </div>
      </div>

      {/* Kanban 3 Kolon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {columns.map(col => (
          <div key={col.key} className="rounded-xl border overflow-hidden" style={{ borderColor: col.border, background: col.bg }}>
            {/* Kolon başlığı */}
            <div className="px-5 py-4 border-b" style={{ borderColor: col.border }}>
              <div className="flex items-center gap-2">
                <col.icon className="w-4 h-4" style={{ color: col.color }} />
                <span className="font-bold text-sm" style={{ color: col.color }}>
                  {col.label} ({col.count})
                </span>
              </div>
            </div>

            {/* Kartlar */}
            <div className="p-4 space-y-3 max-h-[620px] overflow-y-auto">
              {col.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-30">
                  <col.emptyIcon className="w-12 h-12 mb-3" style={{ color: col.color }} />
                  <p className="text-sm text-center text-slate-500 dark:text-[#9ab8bc]">{col.emptyLabel}</p>
                </div>
              ) : col.items.map(repair => (
                <RepairCard
                  key={repair.id}
                  repair={repair}
                  onUpdateStatus={onUpdateStatus}
                  onEdit={handleEditRepair}
                  onDelete={onDeleteRepair}
                  formatPrice={formatPrice}
                  isPrivacyMode={isPrivacyMode}
                  accentColor={col.color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#162a2d] border-[#d0e4e6] dark:border-[#2a4245]">
          <DialogHeader>
            <DialogTitle className="dark:text-[#e8f5f6]">Tamir Kaydını Düzenle</DialogTitle>
            <DialogDescription className="dark:text-[#9ab8bc]">Tamir bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Müşteri Adı</Label><Input value={editForm.customerName} onChange={e => setEditForm({ ...editForm, customerName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Telefon</Label><Input value={editForm.customerPhone} onChange={e => setEditForm({ ...editForm, customerPhone: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Cihaz Bilgisi</Label><Input value={editForm.deviceInfo} onChange={e => setEditForm({ ...editForm, deviceInfo: e.target.value })} /></div>
            <div className="space-y-2"><Label>IMEI</Label><Input value={editForm.imei} onChange={e => setEditForm({ ...editForm, imei: e.target.value })} /></div>
            <div className="space-y-2"><Label>Arıza Açıklaması</Label><Textarea value={editForm.problemDescription} onChange={e => setEditForm({ ...editForm, problemDescription: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tamir Ücreti (₺)</Label><Input type="number" step="0.01" value={editForm.repairCost} onChange={e => setEditForm({ ...editForm, repairCost: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Malzeme Maliyeti (₺)</Label><Input type="number" step="0.01" value={editForm.partsCost} onChange={e => setEditForm({ ...editForm, partsCost: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
              <p className="text-xs text-slate-500 dark:text-[#9ab8bc] mb-1">Kâr</p>
              <p className={`text-2xl font-bold text-[#10b981] ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>
                ₺{(editForm.repairCost - editForm.partsCost).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSaveEdit} className="bg-[#00e1ff] hover:bg-[#33e7ff] text-[#0f2123] font-bold">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── RepairCard bileşeni ──────────────────────────────────────────
function RepairCard({ repair, onUpdateStatus, onEdit, onDelete, formatPrice, isPrivacyMode, accentColor }: {
  repair: RepairRecord;
  onUpdateStatus: (id: string, status: "in_progress" | "completed" | "delivered") => void;
  onEdit: (repair: RepairRecord) => void;
  onDelete?: (id: string) => void;
  formatPrice: (price: number) => string;
  isPrivacyMode: boolean;
  accentColor: string;
}) {
  const next = getNextStatus(repair.status);
  const NextIcon = next?.icon;

  return (
    <div className="rounded-xl border border-[#d0e4e6] dark:border-[#2a4245] bg-white dark:bg-[#162a2d] p-4 space-y-3 hover:border-opacity-80 transition-all">
      {/* Başlık + aksiyonlar */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-slate-800 dark:text-[#e8f5f6] leading-tight truncate">{repair.deviceInfo}</h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: accentColor }}>
              {repair.customerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-slate-500 dark:text-[#9ab8bc] font-medium truncate">{repair.customerName}</span>
            {getStatusBadge(repair.status)}
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <button onClick={() => onEdit(repair)} className="p-1.5 rounded-lg hover:bg-[#e8f5f6] dark:hover:bg-[#2a4245] text-slate-400 hover:text-amber-500 transition-colors">
            <Edit className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button onClick={() => { if (window.confirm("Bu tamir kaydını silmek istiyor musunuz?")) onDelete(repair.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Telefon */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9ab8bc]">
        <Phone className="w-3.5 h-3.5" />
        {repair.customerPhone}
      </div>

      {/* IMEI */}
      {repair.imei && (
        <div className="text-xs">
          <span className="text-slate-400 dark:text-[#9ab8bc]">IMEI:</span>
          <p className="font-mono text-slate-600 dark:text-[#e8f5f6]">{repair.imei}</p>
        </div>
      )}

      {/* Arıza */}
      <p className="text-xs text-slate-500 dark:text-[#9ab8bc] line-clamp-2">{repair.problemDescription}</p>

      {/* Fiyatlar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400 dark:text-[#9ab8bc]">Tamir Ücreti:</span>
          <p className={`font-bold text-sm text-slate-800 dark:text-[#e8f5f6] tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(repair.repairCost)}</p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-[#9ab8bc]">Kâr:</span>
          <p className={`font-bold text-sm text-[#10b981] tabular-nums ${isPrivacyMode ? "privacy-mode-blur" : ""}`}>{formatPrice(repair.profit)}</p>
        </div>
      </div>

      {/* Tarih */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-[#9ab8bc]">
        <Calendar className="w-3 h-3" />
        {format(new Date(repair.createdAt), "dd MMM yyyy, HH:mm", { locale: tr })}
      </div>

      {/* İleri duruma geç butonu */}
      {next && (
        <button onClick={() => onUpdateStatus(repair.id, next.status)}
          className="w-full h-8 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 hover:opacity-90"
          style={next.status === "delivered"
            ? { background: accentColor, color: "#fff", borderColor: accentColor }
            : { background: "transparent", color: accentColor, borderColor: accentColor }}>
          {NextIcon && <NextIcon className="w-3.5 h-3.5" />}
          {next.label}
        </button>
      )}

      {/* Teslim tarihi */}
      {repair.status === "delivered" && repair.deliveredAt && (
        <p className="text-[10px] text-slate-400 dark:text-[#9ab8bc] text-center">
          Teslim: {format(new Date(repair.deliveredAt), "dd MMM yyyy, HH:mm", { locale: tr })}
        </p>
      )}
    </div>
  );
}

function getStatusBadge(status: RepairRecord["status"]) {
  const cfg = {
    in_progress: { label: "Tamir Ediliyor", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
    completed: { label: "Teslim Bekliyor", color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)" },
    delivered: { label: "Teslim Edildi", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
  }[status];
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
}

function getNextStatus(status: RepairRecord["status"]) {
  if (status === "in_progress") return { status: "completed" as const, label: "Tamamlandı", icon: CheckCircle };
  if (status === "completed") return { status: "delivered" as const, label: "Teslim Et", icon: Truck };
  return null;
}
