
const Player = require('./core/Player');
const Item = require('./core/Item');
const itemsData = require('./data/items');
const areasData = require('./data/areas');
const recipesData = require('./data/recipes');
const barterOptionsData = require('./data/barter');


const game = {
  player: new Player(),
  areas: areasData,
  
  items: itemsData.map(item => new Item(item.name, item.category, item.quality, item.effect, item.quantity, item.maxDurability, item.slot)),
  foundMaterials: [],
  currentContext: "normal", 
  currentBattleEnemies: [],
  gameActive: true,
  recipes: recipesData,
  barterOptions: barterOptionsData
};

module.exports = game;
