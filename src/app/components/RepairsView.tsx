import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Wrench, Phone, Calendar, DollarSign, Package, CheckCircle, Truck } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { RepairRecord } from "../utils/api";

interface RepairsViewProps {
  repairs: RepairRecord[];
  onUpdateStatus: (id: string, status: "in_progress" | "completed" | "delivered") => void;
}

export function RepairsView({ repairs, onUpdateStatus }: RepairsViewProps) {
  const getStatusBadge = (status: RepairRecord["status"]) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Tamir Ediliyor</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Tamir Edildi</Badge>;
      case "delivered":
        return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">Teslim Edildi</Badge>;
    }
  };

  const getNextStatus = (currentStatus: RepairRecord["status"]) => {
    switch (currentStatus) {
      case "in_progress":
        return { status: "completed" as const, label: "Tamir Edildi", icon: CheckCircle };
      case "completed":
        return { status: "delivered" as const, label: "Teslim Et", icon: Truck };
      default:
        return null;
    }
  };

  // Grouping repairs by status
  const inProgressRepairs = repairs.filter(r => r.status === "in_progress");
  const completedRepairs = repairs.filter(r => r.status === "completed");
  const deliveredRepairs = repairs.filter(r => r.status === "delivered");

  // Summary statistics
  const totalRevenue = deliveredRepairs.reduce((sum, r) => sum + r.repairCost, 0);
  const totalProfit = deliveredRepairs.reduce((sum, r) => sum + r.profit, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Tamir Ediliyor</div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{inProgressRepairs.length}</div>
              </div>
              <Wrench className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 dark:text-green-300">Tamir Edildi</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{completedRepairs.length}</div>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Toplam Gelir</div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">₺{totalRevenue.toFixed(2)}</div>
              </div>
              <DollarSign className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Toplam Kâr</div>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">₺{totalProfit.toFixed(2)}</div>
              </div>
              <Package className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repairs List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* In Progress */}
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              Tamir Ediliyor ({inProgressRepairs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {inProgressRepairs.map((repair) => (
              <RepairCard key={repair.id} repair={repair} onUpdateStatus={onUpdateStatus} />
            ))}
            {inProgressRepairs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tamir edilen cihaz yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/30">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Tamir Edildi ({completedRepairs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {completedRepairs.map((repair) => (
              <RepairCard key={repair.id} repair={repair} onUpdateStatus={onUpdateStatus} />
            ))}
            {completedRepairs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tamamlanan tamir yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivered */}
        <Card className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-600" />
              Teslim Edildi ({deliveredRepairs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {deliveredRepairs.map((repair) => (
              <RepairCard key={repair.id} repair={repair} onUpdateStatus={onUpdateStatus} />
            ))}
            {deliveredRepairs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Teslim edilen cihaz yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RepairCard({ 
  repair, 
  onUpdateStatus 
}: { 
  repair: RepairRecord; 
  onUpdateStatus: (id: string, status: "in_progress" | "completed" | "delivered") => void;
}) {
  const nextStatus = getNextStatus(repair.status);
  const NextIcon = nextStatus?.icon;

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{repair.deviceInfo}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{repair.customerName}</span>
              {getStatusBadge(repair.status)}
            </div>
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
            <p className="font-medium">₺{repair.repairCost.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Kâr:</span>
            <p className="font-medium text-green-600 dark:text-green-400">₺{repair.profit.toFixed(2)}</p>
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
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Tamir Ediliyor</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Tamir Edildi</Badge>;
    case "delivered":
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">Teslim Edildi</Badge>;
  }
}

function getNextStatus(currentStatus: RepairRecord["status"]) {
  switch (currentStatus) {
    case "in_progress":
      return { status: "completed" as const, label: "Tamir Edildi", icon: CheckCircle };
    case "completed":
      return { status: "delivered" as const, label: "Teslim Et", icon: Truck };
    default:
      return null;
  }
}