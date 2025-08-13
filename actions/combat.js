module.exports = (game, rl, checkPlayerDeath, promptUser, battlePrompt, foundItemsPrompt, processCommand) => {

  
  function displayBattleStatus(battleLogs = [], extraMessage = null, playerActionLog = []) {
    const player = game.player;
    console.log(`
========================
|    SERANGAN HEWAN!   |
========================`);
    
    console.log("Kamu diganggu oleh makhluk liar!");

    console.log(`
MUSUH:`);
    game.currentBattleEnemies.forEach((enemy) => {
      console.log(`[${enemy.id}] ${enemy.name}`);
      console.log(`      HP: ${Math.max(0, enemy.health)}/${enemy.maxHealth}`);
      console.log(`      ATK: ${enemy.attack}`);
      console.log(`      DEF: ${enemy.defense}`);
    });
    console.log(`\nSTATUSMU:`);
    console.log(`Kesehatan : ${Math.max(0, player.health)}/${player.maxHealth}`);
    console.log(`Stamina   : ${player.stamina}/100\n`);
    if (extraMessage || battleLogs.length > 0 || playerActionLog.length > 0) {
      playerActionLog.forEach(log => console.log(log));
      if (extraMessage) console.log(extraMessage);
      battleLogs.forEach(log => console.log(log));
      console.log();
    }

    console.log(`PERINTAH PERTEMPURAN:
> serang [id]
> bertahan
> kantong
> gunakan [item]
> kabur
========================`);
  }

  
  function startBattle() {
    game.currentBattleEnemies = [];
    const area = game.areas.find(a => a.name === game.player.currentArea);

    // Cek jika area tidak ada atau tidak memiliki musuh terdefinisi
    if (!area || !area.enemies || area.enemies.length === 0) {
      return false; // Kembalikan false untuk menandakan pertempuran tidak dimulai
    }
    
    const enemyPool = area.enemies;
    const enemyCount = 1 + Math.floor(Math.random() * Math.min(2, enemyPool.length));
    const Enemy = require('../core/Enemy');
    
    for (let i = 0; i < enemyCount; i++) {
      const idx = Math.floor(Math.random() * enemyPool.length);
      const template = enemyPool[idx];
      if (template) { // Pastikan template musuh valid
          const enemy = new Enemy(template.name, template.health, template.attack, template.defense, template.escapeChance, template.exp, template.drops);
          enemy.id = i + 1;
          game.currentBattleEnemies.push(enemy);
      }
    }

    // Jika karena suatu hal tidak ada musuh yang berhasil dibuat, batalkan pertempuran
    if (game.currentBattleEnemies.length === 0) {
        return false;
    }

    game.currentContext = "battle";
    displayBattleStatus();
    battlePrompt();
    return true; // Kembalikan true untuk menandakan pertempuran berhasil dimulai
  }

  function enemyAttack(isAfterPlayerAction = false, extraMessage = null, playerActionLog = []) {
    const player = game.player;
    const logs = [];
    game.currentBattleEnemies.forEach(enemy => {
      if (enemy.health > 0) {
        let dmg = enemy.attack - (player.defense + player.battleStats.defenseBoost);
        if (dmg < 0) dmg = 0;
        if (player.battleStats.defenseActive) dmg = Math.floor(dmg * 0.5);
        player.health -= dmg;
        logs.push(`${enemy.name} menyerangmu (-${dmg}HP)`);
        if (player.equipment.armor && typeof player.equipment.armor.durability === 'number') {
      
          player.equipment.armor.durability--;
          if (player.equipment.armor.durability <= 0) {
            logs.push(`⚠ Zirah ${player.equipment.armor.name} hancur dan tidak bisa dipakai lagi!`);
            if (player.equipment.armor.effect) player.removeItemEffects(player.equipment.armor.effect);
            player.equipment.armor = null;
          }
        }
      }
    });
    if (player.battleStats.defenseActive) {
      player.battleStats.defenseCooldown--;
      if (player.battleStats.defenseCooldown <= 0) {
        player.battleStats.defenseActive = false;
        logs.push("Efek bertahan telah berakhir.");
        player.battleStats.defenseCooldownTimer = 3;
      }
    } else if (player.battleStats.defenseCooldownTimer > 0) {
      player.battleStats.defenseCooldownTimer--;
      if (player.battleStats.defenseCooldownTimer === 0) logs.push("Kamu sekarang bisa bertahan lagi.");
    }

    // ... (setelah kalkulasi damage dan efek lainnya)

if (checkPlayerDeath()) {
    return; // Hentikan fungsi sepenuhnya di sini.
}

if (isAfterPlayerAction) {
    displayBattleStatus(logs, extraMessage, playerActionLog);
    battlePrompt();
}

  }

  function attackEnemy(enemyId) {
    if (!enemyId) {
      console.log("Tentukan ID musuh yang ingin diserang.");
      battlePrompt();
      return;
    }
    const enemy = game.currentBattleEnemies.find(e => e.id == enemyId);
    if (!enemy || enemy.health <= 0) {
      console.log("ID musuh tidak valid atau musuh sudah mati.");
      battlePrompt();
      return;
    }
    const player = game.player;
    const baseAttack = player.attack + player.battleStats.attackBoost;
    const damage = Math.max(1, baseAttack - enemy.defense);
    enemy.health -= damage;

    const playerActionLog = [`Kamu menyerang ${enemy.name} (-${damage}HP)`];
    if (player.equipment.weapon && typeof player.equipment.weapon.durability === 'number') {
      player.equipment.weapon.durability--;
      if (player.equipment.weapon.durability <= 0) {
        playerActionLog.push(`⚠ Senjatamu ${player.equipment.weapon.name} rusak dan hancur!`);
        if (player.equipment.weapon.effect) player.removeItemEffects(player.equipment.weapon.effect);
        player.equipment.weapon = null;
      }
    }

    if (enemy.health <= 0) {
      playerActionLog.push(`${enemy.name} mati!`);
      player.addExp(enemy.exp);
      enemy.drops.forEach(drop => {
        if (Math.random() < drop.chance) {
          const template = game.items.find(i => i.name === drop.item);
          if (template) {
            const existing = game.foundMaterials.find(fm => fm.name === template.name);
            const qty = drop.quantity || 1;
            if (existing) existing.quantity += qty;
    
            else game.foundMaterials.push({ ...template, quantity: qty });
          }
        }
      });
      game.currentBattleEnemies = game.currentBattleEnemies.filter(e => e.id != enemyId);
    }

    if (game.currentBattleEnemies.length === 0) {
      if (game.foundMaterials.length > 0) {
        console.log("\n========================\n|  JARAHAN DIJATUHKAN  |\n========================");
        game.foundMaterials.forEach(item => {
          console.log(`• ${item.name} (${item.quantity})`);
        });
        console.log(`\nPerintah:\n> ambil [item] [jumlah]\n> abaikan\n========================`);
        game.currentContext = "found_items";
        rl.question('JARAHAN> ', (input) => {
          if (game.gameActive) processCommand(input);
        });
      } else {
        console.log("\n========================\n|    PERTEMPURAN USAI    |\n========================");
        game.currentContext = "normal";
        promptUser();
      }
      return;
    }

    enemyAttack(true, null, playerActionLog);
  }

  function defend() {
    const player = game.player;
    if (player.battleStats.defenseCooldownTimer > 0) {
      console.log(`Kamu masih perlu menunggu ${player.battleStats.defenseCooldownTimer} giliran lagi sebelum bisa bertahan.`);
      battlePrompt();
      return;
    }
    player.battleStats.defenseActive = true;
    player.battleStats.defenseCooldown = 2;
    enemyAttack(true, null, ["Kamu bersiap bertahan. Kerusakan yang diterima akan berkurang selama 2 giliran."]);
  }

  function useItemInCombat(itemName) {
    if (!itemName) {
      console.log("Tentukan item yang ingin digunakan. Contoh: gunakan Daun Herba");
      battlePrompt();
      return;
    }
    const player = game.player;
    const inventorySlot = player.inventory.find(slot => slot.item.name.toLowerCase() === itemName.toLowerCase());
if (!inventorySlot) {
  console.log(`Tidak ada item bernama "${itemName}" di inventarismu.`);
  battlePrompt();
  return;
}
const item = inventorySlot.item;

    if (!item) {
      console.log(`Tidak ada item bernama "${itemName}" di inventarismu.`);
      battlePrompt();
      return;
    }

    let playerActionLog = [];
    if (item.category === 'consumable') {
      player.applyItemEffects(item.effect);
      playerActionLog.push(`Kamu menggunakan ${item.name}.`);
      player.removeItem(item.name, 1);
    } else {
      playerActionLog.push(`Item ${item.name} tidak bisa digunakan dalam pertempuran.`);
    }

    enemyAttack(true, null, playerActionLog);
  }

  function fleeBattle() {
    const enemy = game.currentBattleEnemies[0];
    const escapeChance = Math.random() * 100;
    if (escapeChance < (enemy ? enemy.escapeChance : 50)) {
      console.log("\nKamu berhasil kabur dari pertempuran!");
      game.currentContext = "normal";
      promptUser();
    } else {
      enemyAttack(true, "Gagal kabur!");
    }
  }

  return { startBattle, attackEnemy, defend, useItemInCombat, fleeBattle };
};
