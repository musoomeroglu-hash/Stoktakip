import { api } from "@/app/utils/api";
import { toast } from "sonner";

export async function testAPIConnection() {
  console.log("🔍 API Bağlantısı test ediliyor...");
  
  const tests = [
    { name: "Kategoriler", fn: () => api.getCategories() },
    { name: "Ürünler", fn: () => api.getProducts() },
    { name: "Satışlar", fn: () => api.getSales() },
    { name: "Tamirler", fn: () => api.getRepairs() },
    { name: "Telefon Satışları", fn: () => api.getPhoneSales() },
    { name: "Giderler", fn: () => api.getExpenses() },
    { name: "İstek & Siparişler", fn: () => api.getCustomerRequests() },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const test of tests) {
    try {
      await test.fn();
      console.log(`✅ ${test.name} - Başarılı`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${test.name} - HATA:`, error);
      failCount++;
    }
  }

  if (failCount === 0) {
    toast.success(`✅ Tüm API testleri başarılı! (${successCount}/${tests.length})`);
    console.log("🎉 API bağlantısı tamam!");
    return true;
  } else {
    toast.error(`❌ ${failCount} API testi başarısız oldu. Konsolu kontrol edin.`);
    console.error(`⚠️ ${failCount} test başarısız, ${successCount} test başarılı`);
    return false;
  }
}

export async function testAddOperations() {
  console.log("🔍 Ekleme işlemleri test ediliyor...");
  
  try {
    // Test gider ekleme
    console.log("📝 Test gider ekleniyor...");
    const testExpense = await api.addExpense({
      name: "TEST GİDER - Silinecek",
      amount: 1,
      createdAt: new Date().toISOString()
    });
    console.log("✅ Test gider eklendi:", testExpense);

    // Test gider silme
    console.log("🗑️ Test gider siliniyor...");
    await api.deleteExpense(testExpense.id);
    console.log("✅ Test gider silindi");

    toast.success("✅ Ekleme ve silme işlemleri çalışıyor!");
    return true;
  } catch (error) {
    console.error("❌ Test işlemi başarısız:", error);
    toast.error("❌ Test başarısız! Konsolu kontrol edin.");
    return false;
  }
}
