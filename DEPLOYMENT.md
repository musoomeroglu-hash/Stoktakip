# 🚀 Supabase Edge Function Deployment Rehberi

## ✅ Yapılanlar

Backend'e aşağıdaki yeni endpoint'ler eklendi:

### 📱 Telefon Satışları
- `GET /phone-sales` - Tüm telefon satışlarını getir
- `POST /phone-sales` - Yeni telefon satışı ekle
- `PUT /phone-sales/:id` - Telefon satışını güncelle
- `DELETE /phone-sales/:id` - Telefon satışını sil

### 💸 Giderler
- `GET /expenses` - Tüm giderleri getir
- `POST /expenses` - Yeni gider ekle
- `PUT /expenses/:id` - Gideri güncelle
- `DELETE /expenses/:id` - Gideri sil

### 📋 İstek & Siparişler
- `GET /customer-requests` - Tüm müşteri isteklerini getir
- `POST /customer-requests` - Yeni istek ekle
- `PUT /customer-requests/:id` - İsteği güncelle
- `DELETE /customer-requests/:id` - İsteği sil

## 📦 Deployment Adımları

### 1. Supabase Access Token Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Sağ üst köşeden profilinize tıklayın
3. **Access Tokens** sekmesine gidin
4. **Generate new token** butonuna tıklayın
5. Token'a bir isim verin (örn: "GitHub Actions Deploy")
6. Token'ı kopyalayın (bir daha gösterilmeyecek!)

### 2. GitHub Repository Secret Ekleme

1. GitHub repository'nize gidin
2. **Settings** > **Secrets and variables** > **Actions** sekmesine gidin
3. **New repository secret** butonuna tıklayın
4. İsim: `SUPABASE_ACCESS_TOKEN`
5. Value: Kopyaladığınız Supabase token'ı
6. **Add secret** butonuna tıklayın

### 3. Kod Değişikliklerini Push Etme

Terminalde aşağıdaki komutları çalıştırın:

```bash
# Değişiklikleri stage'e al
git add .

# Commit oluştur
git commit -m "feat: telefon satışları, giderler ve istek & siparişler endpoint'lerini ekle"

# GitHub'a push et
git push origin main
```

> **Not:** Branch'iniz `master` ise `main` yerine `master` yazın.

### 4. Deployment'ı Takip Etme

1. GitHub repository'nize gidin
2. **Actions** sekmesine tıklayın
3. En son push'ınızın workflow'unu göreceksiniz
4. Workflow'a tıklayarak detaylı logları görebilirsiniz
5. ✅ Yeşil tik işareti gördüğünüzde deployment tamamlanmıştır

## 🧪 Test Etme

Deployment tamamlandıktan sonra:

1. Uygulamayı yenileyin (F5)
2. **Telefon Satışları** bölümüne gidin
3. Yeni bir telefon satışı ekleyin
4. **Giderler** bölümüne gidin ve bir gider ekleyin
5. **İstek & Siparişler** bölümüne gidin ve bir istek ekleyin

Her şey çalışıyorsa tebrikler! 🎉

## ⚠️ Sorun Giderme

### Deployment başarısız oldu?

**Secret eksik hatası:**
- GitHub repository secret'ınızı kontrol edin
- İsmin tam olarak `SUPABASE_ACCESS_TOKEN` olduğundan emin olun

**Permission hatası:**
- Supabase token'ınızın geçerli olduğundan emin olun
- Token'ın gerekli yetkilere sahip olduğundan emin olun

**404 hatası devam ediyor:**
- Deployment'ın başarıyla tamamlandığından emin olun
- Tarayıcı önbelleğini temizleyin (Ctrl+Shift+Delete)
- Sayfayı hard refresh yapın (Ctrl+F5)

### Hala çalışmıyor mu?

1. Tarayıcı console'unu açın (F12)
2. Network sekmesine gidin
3. Bir işlem yapın (örn: telefon satışı ekle)
4. Hata mesajlarını kontrol edin
5. API endpoint'inin doğru olduğundan emin olun

## 📞 İletişim

Sorun yaşamaya devam ederseniz:
- GitHub Actions loglarını kontrol edin
- Supabase Dashboard'da Edge Functions loglarını kontrol edin
- API isteklerinin doğru endpoint'lere gittiğinden emin olun

---

**Son Güncelleme:** 9 Şubat 2026
