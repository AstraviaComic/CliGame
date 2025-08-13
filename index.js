const game = require('./gameState');
const { checkPlayerDeath, giveStarterItems } = require('./gameLogic');
const { showStatus, showHelp } = require('./ui/displays');
const { initializePrompts } = require('./ui/prompts');


let processCommand;
const { rl, promptUser, battlePrompt, foundItemsPrompt } = initializePrompts((input) => processCommand(input));
const dependencies = {
    game: game,
    rl: rl,
    checkPlayerDeath: () => checkPlayerDeath(rl),
    promptUser: promptUser,
    battlePrompt: battlePrompt,
    foundItemsPrompt: foundItemsPrompt,
    showStatus: showStatus,
    processCommand: (input) => processCommand(input)
};
const combatActions = require('./actions/combat')(dependencies.game, dependencies.rl, dependencies.checkPlayerDeath, dependencies.promptUser, dependencies.battlePrompt, dependencies.foundItemsPrompt, dependencies.processCommand);
const explorationActions = require('./actions/exploration')(dependencies.game, dependencies.rl, dependencies.checkPlayerDeath, dependencies.promptUser, dependencies.battlePrompt, combatActions.startBattle);
const craftingActions = require('./actions/crafting')(dependencies.game, dependencies.rl, dependencies.promptUser, dependencies.battlePrompt);
const itemActions = require('./actions/item')(dependencies.game, dependencies.rl, dependencies.checkPlayerDeath, dependencies.showStatus, dependencies.promptUser, dependencies.battlePrompt, dependencies.foundItemsPrompt);
const barterActions = require('./actions/barter')(dependencies.game, dependencies.rl, dependencies.promptUser, dependencies.battlePrompt, dependencies.processCommand);

const actions = {
    ...combatActions,
    ...explorationActions,
    ...craftingActions,
    ...itemActions,
    ...barterActions
};
processCommand = (input) => {
    if (!game.gameActive) return;

    const parts = input.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (game.currentContext === 'found_items' && !['ambil', 'abaikan', 'bantuan', 'status', 'kantong'].includes(command)) {
        actions.clearFoundItems();
    }
    
    if (game.currentContext === 'barter' && !['tukar', 'pergi', 'kantong', 'status', 'bantuan'].includes(command)) {
        console.log("\nPerintah tidak valid saat barter. Gunakan: 'tukar [id]', 'pergi', 'kantong', atau 'bantuan'.");
        rl.question('BARTER> ', (input) => processCommand(input));
        return;
    }

    if (game.currentContext === 'battle' && !['serang', 'bertahan', 'gunakan', 'kabur', 'bantuan', 'status', 'kantong'].includes(command)) {
        console.log("Perintah tidak tersedia saat pertempuran! Gunakan: serang, bertahan, gunakan [item], kabur, bantuan, status, atau kantong");
        battlePrompt();
        return;
    }
  
    
    switch (command) {
        
        case 'bantuan':
            showHelp();
            promptUser();
            break;
        case 'status':
            showStatus();
            promptUser();
            break;
        case 'kantong':
            
            
            if (game.currentContext === 'battle') {
                 actions.showBattleInventory();
                battlePrompt();
            } else {
                 actions.showInventory();
                if (game.currentContext === 'barter') {
                     rl.question('BARTER> ', (input) => processCommand(input));
                } else {
                     promptUser();
                }
            }
            break;
        case 'jelajah':
            const exploreResult = actions.exploreArea();
            if (exploreResult === 'found_items') {
                foundItemsPrompt();
            }
            
            break;
        case 'pindah':
            actions.moveArea(args.join(' '));
            break;
        case 'istirahat':
            actions.rest();
            break;
        case 'area':
            actions.showAreas();
            promptUser();
            break;
        case 'makan':
            actions.eat(args.join(' '));
            break;
        case 'minum':
            actions.drink(args.join(' '));
            break;
        case 'pakai':
            actions.equipItem(args.join(' '));
            break;
        case 'lepas':
            actions.unequipItem(args.join(' '));
            break;
        case 'gunakan':
             
            if (game.currentContext === 'battle') {
                actions.useItemInCombat(args.join(' '));
            } else {
                console.log("Perintah 'gunakan' di luar pertarungan belum diimplementasikan sepenuhnya. Gunakan 'makan' atau 'minum'.");
                promptUser();
            }
            break;
        case 'resep':
            actions.showRecipes();
            break;
        case 'buat':
            actions.craftItem(args.join(' '));
            break;
        case 'barter':
            actions.showBarterOptions();
            break;
        case 'tukar':
            actions.barterItem(args[0]);
            break;
        case 'pergi':
            actions.leaveBarter();
            break;
        case 'serang':
            actions.attackEnemy(args[0]);
            break;
        case 'bertahan':
            actions.defend();
            break;
        case 'kabur':
            actions.fleeBattle();
            break;
        case 'ambil':
            if (game.currentContext === 'found_items') {
                const itemName = args.length > 1 ?
                args.slice(0, -1).join(' ') : (args.length === 1 && isNaN(parseInt(args[0])) ? args[0] : null);
                const quantity = args.length > 0 ?
                args[args.length - 1] : null;
                
                if (!itemName && !quantity) actions.takeItems(); 
                else if (itemName && quantity && !isNaN(parseInt(quantity))) actions.takeItems(itemName, parseInt(quantity));
                else actions.takeItems(args.join(' '), 1); 
            } else {
                console.log("Perintah ini hanya bisa digunakan saat menemukan item.");
                promptUser();
            }
            break;
        case 'abaikan':
            if (game.currentContext === 'found_items') actions.ignoreItems();
            else {
                 console.log("Perintah ini hanya bisa digunakan saat menemukan item.");
                 promptUser();
            }
            break;
        default:
            console.log("Perintah tidak dikenali. Ketik 'bantuan' untuk melihat daftar perintah.");
            promptUser();
    }
}




console.log(`[PROLOG]
Dalam misi ekspedisi ke hutan Amazon, mesin pesawat mengalami kerusakan 
dan mengharuskanmu turun di area tidak diketahui.

Selamat datang di Survival Adventure!
Ketik 'bantuan' untuk melihat daftar perintah
`);
giveStarterItems();
promptUser(); 
