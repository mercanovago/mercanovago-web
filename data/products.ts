export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  unit: string;
  approx: string;
  stock: boolean;
  featured: boolean;
  badge: string;
  delivery: string;
  description: string;
  origin: string;
}

export const products: Product[] = [
  {
    id: 1,
    slug: "tomate-rinon",
    name: "Tomate Riñón",
    category: "Hortalizas",
    price: 0.55,
    oldPrice: 0.65,
    image: "/hero-market.jpg",
    unit: "1 libra",
    approx: "4 a 5 unidades aprox.",
    stock: true,
    featured: true,
    badge: "Fresh Day",
    delivery: "20-25 min",
    description:
      "Tomate fresco seleccionado, ideal para ensaladas, refritos, jugos y preparación diaria.",
    origin: "Mercado Mayorista de Riobamba",
  },
  {
    id: 2,
    slug: "papa-chola",
    name: "Papa Chola",
    category: "Tubérculos",
    price: 0.4,
    oldPrice: 0.48,
    image: "/hero-market.jpg",
    unit: "1 libra",
    approx: "3 a 4 unidades aprox.",
    stock: true,
    featured: true,
    badge: "Oferta",
    delivery: "20-25 min",
    description:
      "Papa seleccionada para sopas, locros, tortillas, puré y preparaciones tradicionales.",
    origin: "Productores locales de Chimborazo",
  },
  {
    id: 3,
    slug: "cebolla-colorada",
    name: "Cebolla Colorada",
    category: "Hortalizas",
    price: 0.45,
    oldPrice: 0.55,
    image: "/hero-market.jpg",
    unit: "1 libra",
    approx: "3 a 5 unidades aprox.",
    stock: true,
    featured: true,
    badge: "Más vendido",
    delivery: "20-25 min",
    description:
      "Cebolla colorada fresca, ideal para encebollados, curtidos, ensaladas y refritos.",
    origin: "Mercado Mayorista de Riobamba",
  },
  {
    id: 4,
    slug: "aguacate",
    name: "Aguacate",
    category: "Frutas",
    price: 0.9,
    oldPrice: 1.1,
    image: "/hero-market.jpg",
    unit: "unidad",
    approx: "1 unidad mediana",
    stock: true,
    featured: true,
    badge: "Fresh Day",
    delivery: "20-25 min",
    description:
      "Aguacate fresco y cremoso, ideal para desayunos, ensaladas y acompañamientos.",
    origin: "Proveedores seleccionados",
  },
  {
    id: 5,
    slug: "frutilla",
    name: "Frutilla",
    category: "Frutas",
    price: 1.6,
    oldPrice: 1.85,
    image: "/hero-market.jpg",
    unit: "libra",
    approx: "18 a 25 unidades aprox.",
    stock: true,
    featured: false,
    badge: "Nuevo",
    delivery: "20-25 min",
    description:
      "Frutilla fresca, dulce y seleccionada para postres, batidos, desayunos y snacks saludables.",
    origin: "Productores locales",
  },
  {
    id: 6,
    slug: "queso-fresco",
    name: "Queso Fresco",
    category: "Lácteos",
    price: 2.5,
    oldPrice: 2.75,
    image: "/hero-market.jpg",
    unit: "500 g",
    approx: "1 bloque aprox.",
    stock: true,
    featured: true,
    badge: "Recomendado",
    delivery: "20-25 min",
    description:
      "Queso fresco suave, ideal para desayunos, locros, humitas y preparaciones familiares.",
    origin: "Lácteos seleccionados",
  },
  {
    id: 7,
    slug: "huevos-medianos",
    name: "Huevos Medianos",
    category: "Abarrotes",
    price: 2.2,
    oldPrice: 2.45,
    image: "/hero-market.jpg",
    unit: "cubeta x 12",
    approx: "12 unidades",
    stock: true,
    featured: false,
    badge: "Disponible",
    delivery: "20-25 min",
    description:
      "Huevos medianos seleccionados para desayunos, repostería y cocina diaria.",
    origin: "Granjas locales",
  },
  {
    id: 8,
    slug: "arroz-flor",
    name: "Arroz Flor",
    category: "Abarrotes",
    price: 1.25,
    oldPrice: 1.4,
    image: "/hero-market.jpg",
    unit: "1 libra",
    approx: "empaque familiar",
    stock: true,
    featured: false,
    badge: "Básico",
    delivery: "20-25 min",
    description:
      "Arroz de consumo diario, ideal para almuerzos familiares y preparación semanal.",
    origin: "Distribuidor nacional",
  },
];