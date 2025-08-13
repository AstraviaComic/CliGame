module.exports = [
  {
    name: "Pedagang Keliling", 
    area: "Hutan (Lv.1)",     
    description: "Seorang pedagang keliling menawarkan beberapa barang.",
    trades: [ 
      {
        id: 1, 
        give: [{ item: "Kayu", quantity: 10 }],
        receive: [{ item: "Daun Herba", quantity: 3 }]
      },
      {
        id: 2,
        give: [{ item: "Batu", quantity: 5 }],
        receive: [{ item: "Pisau Batu", quantity: 1 }]
      }
    ]
  },
  {
    name: "Kolektor Racun",
    area: "Sungai Amazon (Lv.2)",
    description: "Seorang kolektor misterius tertarik dengan racun ular.",
    trades: [
      {
        id: 1,
        give: [{ item: "Racun Ular", quantity: 2 }],
        receive: [{ item: "Tongkat", quantity: 1 }]
      },
      {
        id: 2,
        give: [{ item: "Daging Ular", quantity: 5 }],
        receive: [{ item: "Jaket", quantity: 1 }]
      }
    ]
  }
];