class Item {
  constructor(name, category, quality, effect = {}, quantity = 1, maxDurability = null, slot = null) {
    this.name = name;
    this.category = category;
    this.quality = quality;
    this.effect = effect;
    this.quantity = quantity;
    this.durability = maxDurability;
    this.maxDurability = maxDurability;
    this.slot = slot;
  }
}

module.exports = Item;