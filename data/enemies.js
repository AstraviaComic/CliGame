module.exports = [
  {
    name: "Tikus Hutan",
    health: 60,
    attack: 8,
    defense: 3,
    escapeChance: 30,
    exp: 20,
    drops: [
      { item: "Kulit Kayu", quantity: 2, chance: 0.7 },
      { item: "Daging Tikus", quantity: 1, chance: 0.4 }
    ]
  },
  {
    name: "Ular Cobra",
    health: 80,
    attack: 12,
    defense: 5,
    escapeChance: 20,
    exp: 30,
    drops: [
      { item: "Racun Ular", quantity: 1, chance: 0.5 },
      { item: "Daging Ular", quantity: 1, chance: 0.6 }
    ]
  },
  {
    name: "Raja Kera",
    health: 150,
    attack: 20,
    defense: 10,
    escapeChance: 10,
    exp: 100,
    drops: [
      { item: "Daging Lezat", quantity: 2, chance: 0.8 },
      { item: "Kristal Bercahaya", quantity: 1, chance: 0.25 }
    ]
  }
];