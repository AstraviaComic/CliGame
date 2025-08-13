const items = require('./items');
const enemies = require('./enemies');

module.exports = [
  { 
    name: "Hutan (Lv.1)", 
    connected: ["Sungai Amazon (Lv.2)", "Gua Rahasia (Lv.3)", "Perkemahan (Lv.1)"],
    difficulty: 1,
    materials: [
      items.find(i => i.name === "Kulit Kayu"),
      items.find(i => i.name === "Batu"),
      items.find(i => i.name === "Kayu")
    ],
    enemies: [
      enemies.find(e => e.name === "Tikus Hutan")
    ]
  },
  { 
    name: "Sungai Amazon (Lv.2)", 
    connected: ["Hutan (Lv.1)", "Danau Biru (Lv.3)"],
    difficulty: 2,
    materials: [
      items.find(i => i.name === "Batu"),
      items.find(i => i.name === "Racun Ular")
    ],
    enemies: [
      enemies.find(e => e.name === "Ular Cobra")
    ]
  },
  { 
    name: "Gua Rahasia (Lv.3)",
    connected: ["Hutan (Lv.1)"],
    difficulty: 3,
    materials: [
      items.find(i => i.name === "Kristal Bercahaya"),
      items.find(i => i.name === "Batu Langka")
    ],
    enemies: [
      enemies.find(e => e.name === "Raja Kera")
    ]
  },
  { 
    name: "Perkemahan (Lv.1)",
    connected: ["Hutan (Lv.1)"],
    difficulty: 1,
    materials: [
      items.find(i => i.name === "Kain")
    ],
    enemies: []
  }
];