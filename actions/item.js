module.exports = (game, rl, checkPlayerDeath, showStatus, promptUser, battlePrompt, foundItemsPrompt) => {
    
  function showInventory() {
    const p = game.player;
    console.log(`========================
|      INVENTARIS      |
========================`);
    // --- PERUBAHAN ---
    // Menampilkan inventaris berbasis slot
    if (p.inventory.length === 0) {
      console.log("Inventaris kosong.");
    } else {
      // Loop melalui setiap slot di inventaris
      p.inventory.forEach(slot => {
        const item = slot.item;
        const dur = item.durability ? ` (D:${item.durability}${item.maxDurability ? '/' + item.maxDurability : ''})` : '';
        // Tampilkan nama item dari slot dan kuantitas dari slot
        console.log(`• ${item.name} x${slot.quantity}${dur}`);
      });
    }
    // Kapasitas sekarang dihitung berdasarkan jumlah slot yang terpakai
    console.log('========================');
    console.log(`SLOT: ${p.inventory.length}/${p.inventoryCapacity}`);
    console.log('========================');
    // --- AKHIR PERUBAHAN ---
  }

  function showBattleInventory() {
  const p = game.player;
  console.log(`========================
|      INVENTARIS      |
========================`);
  // Filter item yang relevan untuk pertempuran dari setiap slot
  const battleItems = p.inventory.filter(slot => slot.item.category === 'consumable' || slot.item.category === 'equipment');
  
  if (battleItems.length === 0) {
    console.log("Tidak ada item yang bisa digunakan dalam pertempuran");
  } else {
    battleItems.forEach(slot => {
      const item = slot.item;
      // Tampilkan nama item dan kuantitas
      console.log(`• ${item.name} x${slot.quantity}`);
      
      // Tampilkan efek item dengan indentasi
      if (item.effect) {
        Object.entries(item.effect).forEach(([effectName, effectValue]) => {
          console.log(`   ⤷ ${effectName}: ${effectValue > 0 ? '+' : ''}${effectValue}`);
        });
      }
    });
  }
  console.log('========================');
}
  
  function clearFoundItems() {
    if (game.foundMaterials.length > 0) {
      console.log("\n(Kamu beranjak pergi dan meninggalkan barang yang ditemukan sebelumnya.)");
      game.foundMaterials = []; 
    }
    if (game.currentContext === 'found_items' || game.currentContext === 'barter') {
        game.currentContext = 'normal';
    }
  }
    
  function useItemOutsideCombat(itemName) {
    if (!itemName) {
      console.log("Tentukan item yang ingin digunakan. Contoh: gunakan Daun Herba");
      promptUser();
      return;
    }
    const player = game.player;
    // --- PERUBAHAN ---
    const inventorySlot = player.inventory.find(slot => slot.item.name.toLowerCase() === itemName.toLowerCase());
    if (!inventorySlot) {
    // --- AKHIR PERUBAHAN ---
      console.log(`Tidak ada item bernama "${itemName}" di inventarismu.`);
      promptUser();
      return;
    }
    const item = inventorySlot.item; // Ambil item dari slot
    if (item.category === 'consumable') {
      player.applyItemEffects(item.effect);
      if (checkPlayerDeath()) return;
      player.removeItem(item.name, 1);
      console.log(`Kamu menggunakan ${item.name}. Efek diterapkan: ${JSON.stringify(item.effect)}`);
      showStatus();
    } else if (item.category === 'equipment') {
      if (player.equip(item)) {
        console.log(`Kamu memakai ${item.name}`);
        showStatus();
      } else {
        console.log(`Tidak bisa memakai item ${item.name}`);
      }
    } else {
      console.log(`Item ${item.name} tidak bisa digunakan langsung.`);
    }
    promptUser();
  }

  function eat(itemName) {
    if (game.currentContext === 'battle') {
      console.log("Gunakan 'gunakan [makanan]' untuk makan saat bertempur");
      battlePrompt();
      return;
    }
    if (!itemName) {
      console.log("Tentukan makanan. Contoh: makan Pisang");
      promptUser();
      return;
    }
    const player = game.player;
    // --- PERUBAHAN ---
    const foodSlot = player.inventory.find(slot => slot.item.name.toLowerCase() === itemName.toLowerCase() && slot.item.category === "consumable" && (slot.item.effect && slot.item.effect.food));
    if (!foodSlot) {
    // --- AKHIR PERUBAHAN ---
      console.log(`Tidak ada makanan bernama "${itemName}" di inventarismu.`);
      promptUser();
      return;
    }
    const foodItem = foodSlot.item;
    player.applyItemEffects(foodItem.effect);
    player.removeItem(foodItem.name, 1);
    console.log(`Kamu memakan ${foodItem.name} dan mengisi ${foodItem.effect.food} poin makanan.`);
    promptUser();
  }

  function drink(itemName) {
    if (game.currentContext === 'battle') {
      console.log("Gunakan 'gunakan [minuman]' untuk minum saat bertempur");
      battlePrompt();
      return;
    }
    if (!itemName) {
      console.log("Tentukan minuman. Contoh: minum Air Minum");
      promptUser();
      return;
    }
    const player = game.player;
    // --- PERUBAHAN ---
    const drinkSlot = player.inventory.find(slot => slot.item.name.toLowerCase() === itemName.toLowerCase() && slot.item.category === "consumable" && (slot.item.effect && slot.item.effect.water));
    if (!drinkSlot) {
    // --- AKHIR PERUBAHAN ---
      console.log(`Tidak ada minuman bernama "${itemName}" di inventarismu.`);
      promptUser();
      return;
    }
    const drinkItem = drinkSlot.item;
    player.applyItemEffects(drinkItem.effect);
    player.removeItem(drinkItem.name, 1);
    console.log(`Kamu meminum ${drinkItem.name} dan mengisi ${drinkItem.effect.water} poin minuman.`);
    promptUser();
  }

  function equipItem(itemName) {
    if (game.currentContext === 'battle') {
      console.log("Kamu tidak bisa mengganti perlengkapan saat bertempur!");
      battlePrompt();
      return;
    }
    if (!itemName) {
      console.log("Tentukan item yang ingin dipakai. Contoh: pakai Pisau Batu");
      promptUser();
      return;
    }
    // --- PERUBAHAN ---
    const inventorySlot = game.player.inventory.find(slot => slot.item.name.toLowerCase() === itemName.toLowerCase());
    if (!inventorySlot) {
    // --- AKHIR PERUBAHAN ---
      console.log(`Tidak ada item bernama "${itemName}" di inventarismu.`);
      promptUser();
      return;
    }
    const item = inventorySlot.item;
    if (item.category === "equipment") {
      if (game.player.equip(item)) console.log(`Kamu memakai ${item.name}`);
      else console.log(`Tidak bisa memakai ${item.name}`);
    } else {
      console.log(`Item ${item.name} tidak bisa dipakai sebagai perlengkapan.`);
    }
    promptUser();
  }

  function unequipItem(itemName) {
    if (game.currentContext === 'battle') {
      console.log("Kamu tidak bisa melepas perlengkapan saat bertempur!");
      battlePrompt();
      return;
    }
    if (!itemName) {
      console.log("Tentukan item yang ingin dilepas. Contoh: lepas Pisau Batu");
      promptUser();
      return;
    }
    const normalized = itemName.toLowerCase();
    const player = game.player;
    
    // --- PERUBAHAN ---
    // Logika unequip disederhanakan karena sudah ditangani di Player.js
    let unequipped = false;
    if (player.equipment.weapon && player.equipment.weapon.name.toLowerCase() === normalized) {
      if (player.unequip('weapon')) {
        console.log(`${itemName} telah dilepas.`);
        unequipped = true;
      }
    } else if (player.equipment.armor && player.equipment.armor.name.toLowerCase() === normalized) {
      if (player.unequip('armor')) {
        console.log(`${itemName} telah dilepas.`);
        unequipped = true;
      }
    } else if (player.equipment.accessory && player.equipment.accessory.name.toLowerCase() === normalized) {
      if (player.unequip('accessory')) {
        console.log(`${itemName} telah dilepas.`);
        unequipped = true;
      }
    }
    
    if (!unequipped) {
       console.log(`Kamu tidak sedang memakai item bernama "${itemName}".`);
    }
    // --- AKHIR PERUBAHAN ---
    promptUser();
  }

  function takeItems(itemName, quantity) {
      const player = game.player;
      if (itemName) {
        const normalized = itemName.toLowerCase().trim();
        const idx = game.foundMaterials.findIndex(i => i.name.toLowerCase() === normalized);
        if (idx === -1) {
          console.log(`Tidak ada item bernama "${itemName}" yang ditemukan.`);
          foundItemsPrompt();
          return;
        }
        const found = game.foundMaterials[idx];
        const takeQty = (quantity && !isNaN(parseInt(quantity))) ? parseInt(quantity) : found.quantity;
        if (takeQty <= 0) {
          console.log("Jumlah tidak valid.");
          foundItemsPrompt();
          return;
        }
        if (takeQty > found.quantity) {
          console.log(`Hanya ada ${found.quantity} ${found.name} yang ditemukan.`);
          foundItemsPrompt();
          return;
        }
        const template = game.items.find(i => i.name === found.name);
        // --- PERUBAHAN ---
        // player.addItem sekarang menangani logika slot dan mengembalikan boolean
        if (template) {
            if(player.addItem(template, takeQty)) {
                found.quantity -= takeQty;
                console.log(`Kamu mengambil ${takeQty}x ${found.name}`);
            } // Jika gagal, pesan error sudah ditampilkan dari dalam addItem
        }
        if (found.quantity <= 0) game.foundMaterials.splice(idx, 1);
        // --- AKHIR PERUBAHAN ---
      } else {
        // --- PERUBAHAN ---
        // Logika ambil semua item disesuaikan
        let remainingFound = [];
        game.foundMaterials.forEach(found => {
          const template = game.items.find(i => i.name === found.name);
          if (template) {
              // Coba tambahkan item. Jika berhasil, item itu tidak perlu dimasukkan ke remainingFound.
              if (player.addItem(template, found.quantity)) {
                  console.log(`Kamu mengambil ${found.quantity}x ${found.name}`);
              } else {
                  // Jika addItem gagal (misal, hanya sebagian yang masuk),
                  // item yang gagal akan tetap ada di foundMaterials.
                  // Untuk simplifikasi, kita anggap seluruh tumpukan gagal jika addItem melempar false.
                  remainingFound.push(found);
              }
          }
        });
        game.foundMaterials = remainingFound;
        // --- AKHIR PERUBAHAN ---
      }
      if (game.foundMaterials.length === 0) {
        game.currentContext = "normal";
        console.log("\n========================\nSemua material yang ditemukan telah diambil.\n========================");
        promptUser();
      } else {
        foundItemsPrompt();
      }
  }

  function ignoreItems() {
    if (game.currentContext !== "found_items") {
      console.log("Tidak ada item yang bisa diabaikan saat ini.");
      promptUser();
      return;
    }
    console.log("Kamu mengabaikan item yang ditemukan.");
    game.foundMaterials = [];
    game.currentContext = "normal";
    promptUser();
  }

  return { showInventory, showBattleInventory, clearFoundItems, useItemOutsideCombat, eat, drink, equipItem, unequipItem, takeItems, ignoreItems };
};
