import { Badge } from "./ui/badge";

type StokDurum = "yeterli" | "dusuk" | "kritik" | "tukendi";

interface StokBadgeProps {
    miktar: number;
    minStok: number;
}

function getStokDurumu(miktar: number, minStok: number): StokDurum {
    if (miktar <= 0) return "tukendi";
    if (miktar <= minStok * 0.5) return "kritik";
    if (miktar <= minStok) return "dusuk";
    return "yeterli";
}

const DURUM_CONFIG: Record<StokDurum, {
    label: string;
    color: string;
    bg: string;
    border: string;
    barColor: string;
    icon: string;
}> = {
    yeterli: {
        label: "Yeterli",
        color: "#10b981",
        bg: "rgba(16,185,129,0.12)",
        border: "rgba(16,185,129,0.3)",
        barColor: "#10b981",
        icon: "✓",
    },
    dusuk: {
        label: "Düşük",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.3)",
        barColor: "#f59e0b",
        icon: "⚠",
    },
    kritik: {
        label: "Kritik",
        color: "#f97316",
        bg: "rgba(249,115,22,0.12)",
        border: "rgba(249,115,22,0.3)",
        barColor: "#f97316",
        icon: "⚠",
    },
    tukendi: {
        label: "Tükendi",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.12)",
        border: "rgba(239,68,68,0.3)",
        barColor: "#ef4444",
        icon: "✕",
    },
};

export function StokBadge({ miktar, minStok }: StokBadgeProps) {
    const durum = getStokDurumu(miktar, minStok);
    const config = DURUM_CONFIG[durum];

    return (
        <div className="inline-flex flex-col items-center gap-1 min-w-[80px]">
            <div className="flex items-center gap-1.5">
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border"
                    style={{
                        color: config.color,
                        background: config.bg,
                        borderColor: config.border,
                    }}
                >
                    {config.icon} {config.label} ({miktar})
                </span>
            </div>
            {/* Mini progress bar */}
            <div className="w-full h-1 bg-slate-100 dark:bg-[#2a4245] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${Math.min((miktar / Math.max(minStok * 3, 1)) * 100, 100)}%`,
                        background: config.barColor,
                    }}
                />
            </div>
        </div>
    );
}
