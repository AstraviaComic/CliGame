module.exports = (game, rl, promptUser, battlePrompt, processCommand) => {
    
  function showBarterOptions() {
    if (game.currentContext === 'battle') {
      console.log("Kamu tidak bisa barter saat bertempur!");
      battlePrompt();
      return;
    }
    const currentArea = game.player.currentArea;
    const availableTraders = game.barterOptions.filter(t => t.area === currentArea);
    if (availableTraders.length === 0) {
      console.log("Tidak ada pedagang di area ini.");
      promptUser();
      return;
    }
    console.log(`========================
|        BARTER        |
========================`);
    availableTraders.forEach(trader => {
      console.log(`\n${trader.name}: ${trader.description}`);
      trader.trades.forEach(trade => {
        const give = trade.give.map(i => `${i.quantity}x ${i.item}`).join(' + ');
        const recv = trade.receive.map(i => `${i.quantity}x ${i.item}`).join(' + ');
        console.log(`[${trade.id}] Tukar ${give} -> ${recv}`);
      });
    });
    console.log("\nBarter dengan: tukar [id-penawaran] atau pergi");
    game.currentContext = "barter";
    rl.question('BARTER> ', (input) => processCommand(input));
  }

  function barterItem(tradeId) {
    if (game.currentContext !== 'barter') {
        console.log("Kamu harus melihat opsi barter terlebih dahulu dengan perintah 'barter'.");
        promptUser();
        return;
    }
    if (!tradeId || isNaN(parseInt(tradeId))) {
      console.log("Tentukan ID penawaran yang valid. Contoh: tukar 1");
      rl.question('BARTER> ', (input) => processCommand(input));
      return;
    }
    const currentArea = game.player.currentArea;
    const availableTraders = game.barterOptions.filter(t => t.area === currentArea);
    let trade = null;
    for (const trader of availableTraders) {
      const foundTrade = trader.trades.find(t => t.id == parseInt(tradeId));
      if (foundTrade) {
        trade = foundTrade;
        break;
      }
    }
    if (!trade) {
      console.log(`Penawaran dengan ID [${tradeId}] tidak ditemukan di area ini.`);
      rl.question('BARTER> ', (input) => processCommand(input));
      return;
    }
    for (const req of trade.give) {
      if (!game.player.hasItem(req.item, req.quantity)) {
        console.log(`Bahan tidak cukup. Kamu memerlukan ${req.quantity}x ${req.item}.`);
        rl.question('BARTER> ', (input) => processCommand(input));
        return;
      }
    }

    // --- PERUBAHAN ---
    // Simulasi penambahan item untuk memeriksa kapasitas inventaris secara akurat
    const canReceiveAll = () => {
        const tempInventory = JSON.parse(JSON.stringify(game.player.inventory)); // Deep copy
        let slotsUsed = tempInventory.length;

        for (const recv of trade.receive) {
            const template = game.items.find(i => i.name === recv.item);
            if (!template) continue;

            let remainingQty = recv.quantity;
            const isStackable = template.category !== 'equipment';
            const stackLimit = isStackable ? game.player.stackLimit : 1;

            if (isStackable) {
                for (const slot of tempInventory) {
                    if (slot.item.name === template.name && slot.quantity < stackLimit) {
                        const canAdd = stackLimit - slot.quantity;
                        const toAdd = Math.min(remainingQty, canAdd);
                        slot.quantity += toAdd;
                        remainingQty -= toAdd;
                    }
                }
            }

            while (remainingQty > 0) {
                if (slotsUsed >= game.player.inventoryCapacity) {
                    console.log(`⚠ Gagal barter. Inventaris tidak cukup untuk menerima ${recv.quantity}x ${recv.item}.`);
                    return false;
                }
                const toAddInNewSlot = Math.min(remainingQty, stackLimit);
                slotsUsed++;
                remainingQty -= toAddInNewSlot;
            }
        }
        return true;
    };

    if (!canReceiveAll()) {
        rl.question('BARTER> ', (input) => processCommand(input));
        return;
    }
    // --- AKHIR PERUBAHAN ---

    // Lanjutkan barter jika pemeriksaan berhasil
    for (const req of trade.give) {
      game.player.removeItem(req.item, req.quantity);
    }
    console.log("Kamu menukarkan barangmu...");
    for (const recv of trade.receive) {
      const template = game.items.find(i => i.name === recv.item);
      if (template) {
        game.player.addItem(template, recv.quantity);
        console.log(`...dan menerima ${recv.quantity}x ${recv.item}!`);
      }
    }
    console.log("Kamu menyelesaikan barter.");
    game.currentContext = 'normal';
    promptUser();
  }
  
  function leaveBarter() {
    if (game.currentContext !== 'barter') {
      console.log("Kamu tidak sedang dalam sesi barter.");
      promptUser();
      return;
    }
    console.log("\nKamu meninggalkan sesi barter dan kembali melanjutkan petualangan.");
    game.currentContext = 'normal';
    promptUser();
  }
  
  return { showBarterOptions, barterItem, leaveBarter };
};
