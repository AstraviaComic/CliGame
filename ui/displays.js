
const game = require('../gameState');

function showStatus() {
  const p = game.player;
  console.log(`========================
|        STATUS        |
========================
Kesehatan : ${Math.max(0, p.health)}/${p.maxHealth}
Level     : ${p.level} (${p.exp}/${p.maxExp}XP)
Makanan   : ${p.food}/100
Minuman   : ${p.water}/100
Stamina   : ${p.stamina}/100
------------------------
PERTARUNGAN
- Serang   : ${p.attack + p.battleStats.attackBoost}
- Pertahan : ${p.defense + p.battleStats.defenseBoost}`);
  const extraBattleStatus = [];
  if (p.battleStats.defenseActive) extraBattleStatus.push("- SEDANG BERTAHAN (50% reduksi damage)");
  if (p.battleStats.defenseCooldownTimer > 0) extraBattleStatus.push(`- Cooldown Bertahan: ${p.battleStats.defenseCooldownTimer} giliran`);
  if (extraBattleStatus.length > 0) console.log(extraBattleStatus.join("\n"));
  console.log(`------------------------
PERLENGKAPAN
- Senjata   : ${p.equipment.weapon ? p.equipment.weapon.name + (p.equipment.weapon.durability ? ` (${p.equipment.weapon.durability}/${p.equipment.weapon.maxDurability})` : '') : 'Kosong'}
- Zirah     : ${p.equipment.armor ? p.equipment.armor.name + (p.equipment.armor.durability ? ` (${p.equipment.armor.durability}/${p.equipment.armor.maxDurability})` : '') : 'Kosong'}
- Aksesoris : ${p.equipment.accessory ? p.equipment.accessory.name : 'Kosong'}
INVENTARIS: ${p.inventory.length}/${p.inventoryCapacity}
========================`);
}

function showHelp() {
  console.log(`========================
|     LIST PERINTAH    |
========================

UMUM:
• bantuan   : Panduan perintah
• status    : Statistik karakter
• kantong   : Lihat inventaris

PERTEMPURAN:
• serang [id] : Serang musuh tertentu
• bertahan    : Kurangi kerusakan
• gunakan [item] : Pakai item saat bertarung
• kabur      : Lari dari pertempuran

EKSPLORASI:
• jelajah   : Jelajahi area saat ini
• pindah [area] : Pindah ke area lain
• istirahat : Pulihkan stamina
• makan [item] : Konsumsi makanan
• minum [item] : Konsumsi minuman
• area      : Lihat area yang tersedia

CRAFTING:
• buat [item]   : Buat item dari bahan
• resep      : Lihat daftar resep

ITEM:
• pakai [item] : Pakai perlengkapan
• lepas [item] : Lepaskan perlengkapan
• ambil [item] [jml] : Ambil item tertentu
• abaikan     : Lewati item yang ditemukan

BARTER:
• barter      : Lihat opsi tukar
• tukar [id] : Gunakan ini untuk barter 
========================`);
}

module.exports = { showStatus, showHelp };
