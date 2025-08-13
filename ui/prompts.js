
const readline = require('readline');
const game = require('../gameState');


function initializePrompts(processCommand) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const promptUser = () => {
        if (!game.gameActive) {
            if (rl) rl.close();
            return;
        }
        
        if (game.currentContext !== 'normal') {
            game.currentContext = 'normal';
        }
        rl.question('> ', (input) => {
            if (game.gameActive) processCommand(input);
        });
    };

    const battlePrompt = () => {
        if (!game.gameActive) {
            if (rl) rl.close();
            return;
        }
        if (game.currentContext !== 'battle') {
            console.log("Tidak lagi dalam pertempuran.");
            promptUser();
            return;
        }
        rl.question('PERTEMPURAN> ', (input) => {
            if (game.gameActive) processCommand(input);
        });
    };

    const foundItemsPrompt = () => {
        if (!game.gameActive) {
            if (rl) rl.close();
            return;
        }
        game.currentContext = 'found_items';
        console.log(`\n========================
|   TEMUAN MATERIAL!   |
========================`);
        if (game.foundMaterials.length > 0) {
            console.log("Saat menyusuri daerah kamu menemukan:");
            game.foundMaterials.forEach(item => {
                console.log(`• ${item.name} (${item.quantity})`);
            });
            console.log(`
Perintah:
> ambil
> ambil [item] [jumlah]
> abaikan
========================`);
        } else {
            console.log("Tidak ada barang ditemukan.");
            game.currentContext = "normal";
            promptUser();
            return;
        }
        rl.question('TEMUAN> ', (input) => {
            if (game.currentContext === "found_items") {
                processCommand(input);
            }
        });
    };

    return { rl, promptUser, battlePrompt, foundItemsPrompt };
}

module.exports = { initializePrompts };
