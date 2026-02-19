-- 1. Cari Hareketler Tablosu
CREATE TABLE IF NOT EXISTS public.cari_hareketler (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid REFERENCES public.suppliers(id) ON DELETE CASCADE,
    islem_tarihi timestamp with time zone DEFAULT now(),
    islem_tipi text NOT NULL, -- 'alis', 'odeme', 'iade', 'borc_ekleme', 'alacak_ekleme'
    miktar numeric(15,2) NOT NULL DEFAULT 0,
    aciklama text,
    ilgili_id uuid, -- purchases.id veya ilerdeki payments.id
    fatura_no text,
    bakiye_etkisi numeric(15,2) NOT NULL, -- Borç artıran (+), borç azaltan (-)
    created_at timestamp with time zone DEFAULT now()
);

-- RLS (Row Level Security) - Gerekirse
ALTER TABLE public.cari_hareketler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON public.cari_hareketler FOR ALL TO authenticated USING (true);

-- 2. Alış Yapıldığında Cari Hareket Oluşturan Fonksiyon
CREATE OR REPLACE FUNCTION handle_purchase_cari_hareket()
RETURNS TRIGGER AS $$
BEGIN
    -- A. Alış Tahakkuku (Borç Artışı)
    INSERT INTO public.cari_hareketler (
        supplier_id, 
        islem_tarihi, 
        islem_tipi, 
        miktar, 
        aciklama, 
        ilgili_id, 
        fatura_no, 
        bakiye_etkisi
    ) VALUES (
        NEW.supplier_id,
        NEW.purchase_date::timestamp,
        'alis',
        NEW.total,
        COALESCE(NEW.notes, 'Alış Faturası'),
        NEW.id,
        NEW.invoice_number,
        NEW.total -- Borç arttı
    );

    -- B. Eğer peşin ödeme yapıldıysa (Tediye)
    IF NEW.paid_amount > 0 THEN
        INSERT INTO public.cari_hareketler (
            supplier_id, 
            islem_tarihi, 
            islem_tipi, 
            miktar, 
            aciklama, 
            ilgili_id, 
            fatura_no, 
            bakiye_etkisi
        ) VALUES (
            NEW.supplier_id,
            NEW.purchase_date::timestamp,
            'odeme',
            NEW.paid_amount,
            'Alış anında yapılan ödeme',
            NEW.id,
            NEW.invoice_number,
            -NEW.paid_amount -- Borç azaldı
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger'ı Oluştur
DROP TRIGGER IF EXISTS trg_purchase_cari_hareket ON public.purchases;
CREATE TRIGGER trg_purchase_cari_hareket
AFTER INSERT ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION handle_purchase_cari_hareket();

-- 4. Suppliers Tablosundaki balance'ı güncellemek için ek trigger gerekebilir 
-- (Zaten frontend veya başka bir trigger ile güncelleniyor olabilir ama garanti olsun)
CREATE OR REPLACE FUNCTION update_supplier_balance_from_hareket()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.suppliers
    SET balance = balance + NEW.bakiye_etkisi
    WHERE id = NEW.supplier_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_supplier_balance ON public.cari_hareketler;
CREATE TRIGGER trg_update_supplier_balance
AFTER INSERT ON public.cari_hareketler
FOR EACH ROW
EXECUTE FUNCTION update_supplier_balance_from_hareket();
