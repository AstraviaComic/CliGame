const game = require('./gameState');
function checkPlayerDeath(rl) {
    if (game.player.health <= 0) {
        console.log("\nKesehatanmu telah habis. Petualanganmu berakhir di sini.");
        console.log("================ GAME OVER ================");
        game.gameActive = false;
        if (rl) rl.close();
        return true;
    }
    return false;
}


function giveStarterItems() {
    const addItem = (name, qty = 1) => {
        const itemTemplate = game.items.find(i => i.name === name);
        if (itemTemplate) {
            // TIDAK ADA PERUBAHAN DI SINI
            // Fungsi player.addItem yang baru akan menangani penumpukan dan slot secara otomatis
            game.player.addItem(itemTemplate, qty);
        } else {
            console.warn(`Peringatan: Template item "${name}" tidak ditemukan.`);
        }
    };

    // Panggilan ini sekarang akan menggunakan logika inventaris baru
    addItem("Pisau Batu", 1);
    addItem("Daun Herba", 1);
    addItem("Pisang", 5);
    addItem("Batu", 5);
    addItem("Air Minum", 5);
    addItem("Daging Tikus", 5);
    addItem("Kayu", 10);
    addItem("Kulit Kayu", 2);
}

module.exports = { checkPlayerDeath, giveStarterItems };
