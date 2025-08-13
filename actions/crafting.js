module.exports = (game, rl, promptUser, battlePrompt) => {

  function showRecipes() {
    if (game.currentContext === 'battle') {
      console.log("Kamu tidak bisa melihat resep saat bertempur!");
      battlePrompt();
      return;
    }
    console.log(`========================
|     DAFTAR RESEP     |
========================`);
    game.recipes.forEach((r, idx) => {
      const inputs = r.inputs.map(i => `${i.quantity}x ${i.item}`).join(' + ');
      console.log(`[${idx+1}] ${r.output} = ${inputs}`);
    });
    console.log("\nBuat dengan: buat [nama item]");
    promptUser();
  }

  function craftItem(itemName) {
    if (game.currentContext === 'battle') {
      console.log("Kamu tidak bisa membuat item saat bertempur!");
      battlePrompt();
      return;
    }
    if (!itemName) {
      console.log("Tentukan item yang ingin dibuat. Contoh: buat Pisau Batu");
      promptUser();
      return;
    }
    const recipe = game.recipes.find(r => r.output.toLowerCase() === itemName.toLowerCase());
    if (!recipe) {
      console.log(`Resep untuk "${itemName}" tidak ditemukan.`);
      promptUser();
      return;
    }
    const player = game.player;
    const template = game.items.find(i => i.name.toLowerCase() === recipe.output.toLowerCase());
    if (!template) {
      console.log(`Definisi item untuk ${recipe.output} tidak ditemukan.`);
      promptUser();
      return;
    }
    
    // --- PERUBAHAN ---
    // Pemeriksaan inventaris penuh yang lama dihapus.
    // Logika sekarang adalah: coba buat, jika gagal (karena inventaris penuh), kembalikan bahan.
    // Ini lebih akurat dengan sistem slot baru.
    for (const req of recipe.inputs) {
      if (!game.player.hasItem(req.item, req.quantity)) {
        console.log(`Bahan tidak cukup. Kamu memerlukan ${req.quantity}x ${req.item}.`);
        promptUser();
        return;
      }
    }
    
    // Ambil bahan dari inventaris
    for (const req of recipe.inputs) {
      game.player.removeItem(req.item, req.quantity);
    }
    
    // Coba tambahkan item hasil craft. player.addItem akan return false jika gagal.
    if (game.player.addItem(template, 1)) {
        console.log(`Selamat! Kamu berhasil membuat ${template.name}.`);
    } else {
        console.log("Gagal membuat item karena inventaris penuh. Bahan dikembalikan.");
        // Kembalikan bahan jika gagal
        for (const req of recipe.inputs) {
            const materialTemplate = game.items.find(i => i.name === req.item);
            if(materialTemplate) game.player.addItem(materialTemplate, req.quantity);
        }
    }
    // --- AKHIR PERUBAHAN ---
    
    promptUser();
  }

  function repairItem(itemName) {
    console.log("Fitur perbaikan item belum tersedia dalam versi ini.");
    promptUser();
  }

  return { showRecipes, craftItem, repairItem };
};
