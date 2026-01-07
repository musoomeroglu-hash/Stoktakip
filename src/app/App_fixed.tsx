// This is a temporary fix file - I'll copy the corrected section
  // Handle repair
  const handleAddRepair = async (repair: Omit<RepairRecord, "id">) => {
    try {
      const newRepair = await api.addRepair(repair);
      setRepairs([newRepair, ...repairs]);
      toast.success("Tamir kaydı oluşturuldu!");
    } catch (error) {
      console.error("Repair add error:", error);
      toast.error("Tamir kaydı oluşturulamadı");
    }
  };

  // Handle repair status update
  const handleUpdateRepairStatus = async (id: string, status: "in_progress" | "completed" | "delivered") => {
    try {
      const updated = await api.updateRepairStatus(id, status);
      
      // If delivered, add to sales
      if (status === "delivered") {
        const sale: Omit<Sale, "id"> = {
          items: [{
            productId: "repair-" + id,
            productName: `Tamir: ${updated.deviceInfo}`,
            quantity: 1,
            salePrice: updated.repairCost,
            purchasePrice: updated.partsCost,
            profit: updated.profit,
          }],
          totalPrice: updated.repairCost,
          totalProfit: updated.profit,
          date: new Date().toISOString(),
        };

        await api.addSale(sale);
        const updatedSales = await api.getSales();
        setSales(updatedSales);
      }

      const updatedRepairs = repairs.map((r) => (r.id === id ? updated : r));
      setRepairs(updatedRepairs);
      
      toast.success("Tamir durumu güncellendi");
      playSuccessSound();
    } catch (error) {
      console.error("Repair status update error:", error);
      toast.error("Tamir durumu güncellenemedi");
    }
  };

  // Handle phone sale
  const handleAddPhoneSale = (phoneSale: PhoneSale) => {
    const updatedPhoneSales = [phoneSale, ...phoneSales];
    setPhoneSales(updatedPhoneSales);
    localStorage.setItem("phoneSales", JSON.stringify(updatedPhoneSales));
    playSuccessSound();
  };

  const handleDeletePhoneSale = (id: string) => {
    const updatedPhoneSales = phoneSales.filter((ps) => ps.id !== id);
    setPhoneSales(updatedPhoneSales);
    localStorage.setItem("phoneSales", JSON.stringify(updatedPhoneSales));
    toast.success("Telefon satışı silindi");
  };

  // Handle repair update
  const handleUpdateRepair = async (id: string, data: Partial<RepairRecord>) => {
    try {
      const updated = await api.updateRepair(id, data);
      setRepairs(repairs.map((r) => (r.id === id ? updated : r)));
      toast.success("Tamir güncellendi");
    } catch (error) {
      console.error("Error updating repair:", error);
      toast.error("Tamir güncellenemedi");
    }
  };
