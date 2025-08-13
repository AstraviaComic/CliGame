class Player {
  constructor() {
    this.health = 100;
    this.maxHealth = 100;
    this.level = 1;
    this.exp = 0;
    this.maxExp = 100;
    this.food = 100;
    this.water = 100;
    this.stamina = 100;
    this.attack = 10;
    this.defense = 5;
    // --- PERUBAHAN ---
    // Inventaris sekarang adalah array of slots. Setiap elemen adalah objek { item, quantity }.
    this.inventory = []; 
    this.inventoryCapacity = 20; // Ini sekarang berarti 20 SLOTS.
    this.stackLimit = 10; // Batas tumpukan per slot untuk item stackable.
    // --- AKHIR PERUBAHAN ---
    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null
    };
    this.currentArea = "Hutan (Lv.1)";
    this.statusEffects = [];
    this.battleStats = {
      attackBoost: 0,
      defenseBoost: 0,
      defenseActive: false,
      defenseCooldown: 0,
      defenseCooldownTimer: 0
    };
  }

  // --- PERUBAHAN BESAR PADA LOGIKA ITEM ---

  /**
   * Menambahkan item ke inventaris dengan logika slot dan stack limit.
   * @param {object} itemTemplate - Template item yang akan ditambahkan.
   * @param {number} quantity - Jumlah item yang akan ditambahkan.
   * @returns {boolean} - Mengembalikan true jika SEMUA item berhasil ditambahkan, false jika tidak.
   */
  addItem(itemTemplate, quantity = 1) {
    let remainingQuantity = quantity;
    const isStackable = itemTemplate.category !== 'equipment';
    const stackLimit = isStackable ? this.stackLimit : 1;

    // Tahap 1: Isi slot yang sudah ada (hanya untuk item yang bisa ditumpuk)
    if (isStackable) {
      for (const slot of this.inventory) {
        if (remainingQuantity <= 0) break;
        if (slot.item.name === itemTemplate.name && slot.quantity < stackLimit) {
          const canAdd = stackLimit - slot.quantity;
          const toAdd = Math.min(remainingQuantity, canAdd);
          slot.quantity += toAdd;
          remainingQuantity -= toAdd;
        }
      }
    }

    // Tahap 2: Gunakan slot baru untuk sisa item
    while (remainingQuantity > 0) {
      if (this.inventory.length >= this.inventoryCapacity) {
        // Jika sudah tidak ada slot tersisa dan masih ada item yang belum ditambahkan
        console.log(`Peringatan: Inventaris penuh. ${remainingQuantity}x ${itemTemplate.name} tidak dapat ditambahkan.`);
        return false;
      }

      const toAddInNewSlot = Math.min(remainingQuantity, stackLimit);
      const newItem = { ...itemTemplate }; // Buat salinan item
      
      const newSlot = {
        item: newItem,
        quantity: toAddInNewSlot
      };
      
      this.inventory.push(newSlot);
      remainingQuantity -= toAddInNewSlot;
    }
    
    return true; // Semua item berhasil ditambahkan
  }

  /**
   * Menghapus item dari inventaris.
   * @param {string} itemName - Nama item yang akan dihapus.
   * @param {number} quantity - Jumlah yang akan dihapus.
   * @returns {boolean} - True jika berhasil, false jika tidak.
   */
  removeItem(itemName, quantity = 1) {
    let remainingToRemove = quantity;
    // Iterasi dari belakang agar splice tidak mengganggu loop
    for (let i = this.inventory.length - 1; i >= 0; i--) {
      if (remainingToRemove <= 0) break;
      const slot = this.inventory[i];
      if (slot.item.name === itemName) {
        const toRemove = Math.min(remainingToRemove, slot.quantity);
        slot.quantity -= toRemove;
        remainingToRemove -= toRemove;
        if (slot.quantity <= 0) {
          this.inventory.splice(i, 1);
        }
      }
    }
    return remainingToRemove <= 0;
  }

  /**
   * Memeriksa apakah pemain memiliki item dalam jumlah tertentu.
   * @param {string} itemName - Nama item.
   * @param {number} quantity - Jumlah yang dibutuhkan.
   * @returns {boolean}
   */
  hasItem(itemName, quantity = 1) {
    let total = 0;
    for (const slot of this.inventory) {
      if (slot.item.name === itemName) {
        total += slot.quantity;
      }
    }
    return total >= quantity;
  }

  /**
   * Memakai equipment.
   * @param {object} item - Item yang akan dipakai (dari inventaris).
   * @returns {boolean}
   */
  equip(item) {
    if (!item || item.category !== 'equipment' || !item.slot) return false;

    // Cari slot di inventaris yang berisi item ini
    const invSlotIndex = this.inventory.findIndex(slot => slot.item.name === item.name);
    if (invSlotIndex === -1) return false; // Item tidak ditemukan di inventaris

    // Jika sudah ada equipment di slot tujuan, lepas dulu
    if (this.equipment[item.slot]) {
      this.unequip(item.slot);
    }
    
    // Pindahkan item dari inventaris ke slot equipment
    this.equipment[item.slot] = this.inventory[invSlotIndex].item;
    this.applyItemEffects(item.effect);

    // Hapus dari inventaris (karena sudah dipakai)
    this.inventory.splice(invSlotIndex, 1);
    
    return true;
  }
  
  /**
   * Melepas equipment.
   * @param {string} slot - Tipe slot ('weapon', 'armor', 'accessory').
   * @returns {boolean}
   */
  unequip(slot) {
    const eq = this.equipment[slot];
    if (!eq) return false;
    
    // Kembalikan item ke inventaris
    // addItem akan menangani penempatan di slot baru
    if (this.inventory.length < this.inventoryCapacity) {
      this.addItem(eq, 1);
      this.removeItemEffects(eq.effect);
      this.equipment[slot] = null;
      return true;
    } else {
      console.log(`Inventaris penuh, tidak bisa melepas ${eq.name}.`);
      return false;
    }
  }
  
  // --- AKHIR PERUBAHAN BESAR ---
  
  applyItemEffects(effectObj) {
    if (!effectObj) return;
    for (let key in effectObj) {
      switch (key) {
        case 'health':
          this.health = Math.min(this.maxHealth, this.health + effectObj[key]);
          break;
        case 'maxHealth':
          this.maxHealth += effectObj[key];
          this.health = Math.min(this.health, this.maxHealth);
          break;
        case 'food':
          this.food = Math.min(100, this.food + effectObj[key]);
          break;
        case 'water':
          this.water = Math.min(100, this.water + effectObj[key]);
          break;
        case 'stamina':
          this.stamina = Math.min(100, this.stamina + effectObj[key]);
          break;
        case 'attackBoost':
          this.battleStats.attackBoost += effectObj[key];
          break;
        case 'defenseBoost':
          this.battleStats.defenseBoost += effectObj[key];
          break;
        case 'attack':
          this.attack += effectObj[key];
          break;
        case 'defense':
          this.defense += effectObj[key];
          break;
        case 'inventoryCapacity':
          this.inventoryCapacity += effectObj[key];
          break;
        default:
          if (key in this && typeof this[key] === 'number') {
            this[key] += effectObj[key];
          }
      }
    }
  }

  removeItemEffects(effectObj) {
    if (!effectObj) return;
    for (let key in effectObj) {
      switch (key) {
        case 'maxHealth':
          this.maxHealth -= effectObj[key];
          if (this.health > this.maxHealth) this.health = this.maxHealth;
          break;
        case 'attackBoost':
          this.battleStats.attackBoost -= effectObj[key];
          if (this.battleStats.attackBoost < 0) this.battleStats.attackBoost = 0;
          break;
        case 'defenseBoost':
          this.battleStats.defenseBoost -= effectObj[key];
          if (this.battleStats.defenseBoost < 0) this.battleStats.defenseBoost = 0;
          break;
        case 'attack':
          this.attack -= effectObj[key];
          break;
        case 'defense':
          this.defense -= effectObj[key];
          break;
        case 'inventoryCapacity':
          this.inventoryCapacity -= effectObj[key];
          break;
        default:
          if (key in this && typeof this[key] === 'number') {
            this[key] -= effectObj[key];
          }
      }
    }
  }
  
  addExp(amount) {
    this.exp += amount;
    while (this.exp >= this.maxExp) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.exp = this.exp - this.maxExp;
    this.maxExp = Math.floor(this.maxExp * 1.5);
    this.maxHealth += 10;
    this.health = this.maxHealth;
    this.attack += 2;
    this.defense += 1;
  }

  applyStatusEffect(effect) {
    this.statusEffects.push(effect);
  }

  processStatusEffects() {
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const effect = this.statusEffects[i];
      if (effect.type === 'bleeding') {
        this.health -= effect.damage;
      }
      if (effect.type === 'poison') {
        this.health -= effect.damage || 2;
      }

      if (effect.duration !== undefined) {
        effect.duration--;
        if (effect.duration <= 0) {
          effect.expired = true;
        }
      }
    }
    
    this.statusEffects = this.statusEffects.filter(e => !e.expired);
  }
}

module.exports = Player;
