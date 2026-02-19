# Stoktakip - Modern Stok Takip Uygulaması

Anlık stok takibi yapmanızı, ürünlerinizi kategorize etmenizi ve stok hareketlerini izlemenizi sağlayan modern bir web uygulamasıdır.

**Canlı URL:** [stoktakip-omega.vercel.app](https://stoktakip-omega.vercel.app)

## Özellikler

- **Anlık Stok Takibi:** Ürünlerinizin stok durumunu gerçek zamanlı izleyin.
- **Kategori Yönetimi:** Ürünleri kategorilere ayırarak düzenli tutun.
- **Stok Hareketleri:** Giriş ve çıkış işlemlerinin kaydını tutun.
- **Kritik Stok Uyarıları:** Stok miktarı azalan ürünler için uyarılar alın.
- **Kullanıcı Dostu Arayüz:** Modern ve responsive tasarım.

## Teknoloji Stack'i

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend / Veritabanı:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Deployment:** Vercel

## Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn

### Adımlar

1. **Repoyu klonlayın:**
   ```bash
   git clone https://github.com/musoomeroglu-hash/Stoktakip.git
   cd Stoktakip
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment Değişkenlerini Ayarlayın:**
   `.env.local` dosyası oluşturun ve aşağıdaki Supabase anahtarlarını ekleyin:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Not: Bu anahtarları Supabase proje ayarlarından alabilirsiniz.*

4. **Uygulamayı çalıştırın:**
   ```bash
   npm run dev
   ```
   Tarayıcınızda `http://localhost:5173` adresine gidin.

## Geliştirme

- **Lint:** `npm run lint` komutu ile kod kalitesini kontrol edin.
- **Build:** `npm run build` komutu ile production build'i alın.
- **Preview:** `npm run preview` komutu ile build alınan projeyi önizleyin.

## Deployment

Proje Vercel üzerinde host edilmektedir. `main` branch'ine yapılan her push işlemi otomatik olarak canlıya alınır.

## Lisans

MIT