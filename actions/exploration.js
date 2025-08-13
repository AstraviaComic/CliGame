module.exports = (game, rl, checkPlayerDeath, promptUser, battlePrompt, startBattle) => {

  function showAreas() {
    if (game.currentContext === 'battle') {
      console.log("Kamu tidak bisa melihat area saat bertempur!");
      battlePrompt();
      return;
    }
    const currentArea = game.areas.find(a => a.name === game.player.currentArea);
    console.log(`========================
|     AREA JELAJAH     |
========================
Lokasi: ${game.player.currentArea}

Terhubung ke:`);
    currentArea.connected.forEach(area => console.log(`• ${area}`));
    console.log(`
Pindah dengan:
> pindah [nama area]
========================`);
  }

  function findMaterials() {
    const area = game.areas.find(a => a.name === game.player.currentArea);
    const availableMaterials = (area && area.materials && area.materials.length > 0) ? area.materials : game.items.filter(i => i.category === 'material');
    const materialCount = Math.floor(Math.random() * 3) + 1;
    game.foundMaterials = [];
    for (let i = 0; i < materialCount; i++) {
      const item = availableMaterials[Math.floor(Math.random() * availableMaterials.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const existing = game.foundMaterials.find(fm => fm.name === item.name);
      if (existing) existing.quantity += quantity;
      else game.foundMaterials.push({ ...item, quantity });
    }

    game.currentContext = "found_items";
  }

  function badLuckEvent() {
    const events = [
      { description: "Kamu tergelincir dan mengalami pendarahan", effect: { type: "bleeding", damage: 10, duration: 3, description: "Pendarahan (-10HP per penjelajahan)", expired: false } },
      { description: "Kamu menginjak hewan beracun dan keracunan", effect: { type: "poison", damage: 5, duration: 3, description: "Keracunan (-5HP per giliran)", expired: false } },
      { description: "Kamu terjatuh dan keseleo", effect: { type: "sprain", damage: 0, description: "Keseleo (-3 serangan)", expired: false } }
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    console.log(`========================
|     KESIALAN!       |
========================
${ev.description}`);
    game.player.applyStatusEffect(ev.effect);
    promptUser();
  }
    
  function exploreArea() {
    if (game.currentContext === 'battle') {
      console.log("Kamu sedang bertempur, fokuslah pada musuhmu!");
      battlePrompt();
      return;
    }
    const player = game.player;
    player.stamina = Math.max(0, player.stamina - 15);
    player.processStatusEffects();
    if (checkPlayerDeath()) return;
    
    const rand = Math.random();
    if (rand < 0.35) {
      const battleStarted = startBattle();
      if (!battleStarted) {
        // Jika tidak ada pertempuran (area aman), tampilkan pesan ini
        console.log("Kamu tidak menemukan apapun setelah menjelajahi daerah sekitar sini, area ini nampaknya aman.");
        promptUser();
      }
      // Jika pertempuran dimulai, tidak perlu melakukan apa-apa lagi di sini
    } else if (rand < 0.65) {
      findMaterials();
      return 'found_items';
    } else if (rand < 0.8) {
      badLuckEvent();
    } else {
      console.log("Kamu tidak menemukan apapun setelah menjelajahi daerah sekitar sini, mungkin perlu menjelajah lebih dalam");
      promptUser();
    }
  }

  function moveArea(areaName) {
    if (game.currentContext === 'battle') {
      console.log("Kamu tidak bisa pindah area saat sedang bertempur!");
      battlePrompt();
      return;
    }
    if (!areaName) {
      console.log("Tentukan area tujuan. Contoh: pindah Sungai Amazon");
      promptUser();
      return;
    }
    const currentArea = game.areas.find(a => a.name === game.player.currentArea);
    if (!currentArea) {
      console.log("Area saat ini tidak valid!");
      promptUser();
      return;
    }
    const normalize = (name) => name.replace(/\s*\(.*\)$/, '').trim().toLowerCase();
    const normalizedInput = normalize(areaName);
    const destination = currentArea.connected.find(connectedArea => normalize(connectedArea).startsWith(normalizedInput));
    if (destination) {
      game.player.currentArea = destination;
      console.log(`Kamu pindah ke ${destination}`);
    } else {
      console.log(`Tidak dapat pindah ke "${areaName}" dari area ini.`);
    }
    promptUser();
  }

  function rest() {
    if (game.currentContext === 'battle') {
      console.log("Kamu tidak bisa istirahat saat bertempur!");
      battlePrompt();
      return;
    }
    const player = game.player;
    player.stamina = Math.min(100, player.stamina + 40);
    player.health = Math.min(player.maxHealth, player.health + 10);
    player.food = Math.max(0, player.food - 15);
    player.water = Math.max(0, player.water - 20);
    console.log("Kamu beristirahat dan memulihkan stamina dan kesehatan.");
    promptUser();
  }

  return { exploreArea, moveArea, rest, showAreas };
};
