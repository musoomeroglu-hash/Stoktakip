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

const DURUM_CONFIG: Record<StokDurum, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className: string }> = {
    yeterli: {
        variant: "outline",
        label: "✓ Yeterli",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
    },
    dusuk: {
        variant: "secondary",
        label: "⚠ Düşük",
        className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
    },
    kritik: {
        variant: "secondary",
        label: "⚠ Kritik",
        className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
    },
    tukendi: {
        variant: "destructive",
        label: "✕ Tükendi",
        className: ""
    },
};

export function StokBadge({ miktar, minStok }: StokBadgeProps) {
    const durum = getStokDurumu(miktar, minStok);
    const config = DURUM_CONFIG[durum];

    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label} ({miktar})
        </Badge>
    );
}
