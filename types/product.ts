export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  old_price: number | null;
  image: string;
  unit: string;
  approx: string | null;
  stock: boolean;
  featured: boolean;
  badge: string | null;
  delivery: string | null;
  description: string | null;
  origin: string | null;
  created_at: string;
}