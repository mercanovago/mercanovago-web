export const products = [
  {
    id: 1,
    name: "Tomate Riñón",
    category: "Hortalizas",
    unit: "1 libra",
    approx: "4 a 5 unidades aprox.",
    price: 0.55,
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Papa Chola",
    category: "Tubérculos",
    unit: "1 libra",
    approx: "4 a 7 unidades aprox.",
    price: 0.40,
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Cebolla Colorada",
    category: "Hortalizas",
    unit: "1 libra",
    approx: "3 a 5 unidades aprox.",
    price: 0.45,
    image:
      "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Aguacate",
    category: "Frutas",
    unit: "unidad",
    approx: "1 unidad mediana",
    price: 0.90,
    image:
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Frutilla",
    category: "Frutas",
    unit: "1 libra",
    approx: "20 a 28 unidades aprox.",
    price: 1.60,
    image:
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Queso Fresco",
    category: "Lácteos",
    unit: "500 g",
    approx: "1 bloque aprox.",
    price: 2.50,
    image:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Huevos Medianos",
    category: "Abarrotes",
    unit: "cubeta x12",
    approx: "12 unidades",
    price: 2.20,
    image:
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Arroz Flor",
    category: "Abarrotes",
    unit: "1 kilo",
    approx: "1000 g",
    price: 1.25,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
  },
];

export type Product = (typeof products)[number];