class Enemy {
  constructor(name, health, attack, defense, escapeChance, exp, drops) {
    this.name = name;
    this.health = health;
    this.maxHealth = health;
    this.attack = attack;
    this.defense = defense;
    this.escapeChance = escapeChance;
    this.exp = exp;
    this.drops = drops;
  }
}

module.exports = Enemy;