import type { Availability } from "./ProductAvailability";

export interface ProductOption {
  id: number;
  sku: string;
  code: string;
  name: string | null;
  value: string;
  sortOrder: number | null;
  reviewAvg: number;
  reviewCount: number;
  description: string | null;
  image?: string[]; // hoặc Array<string> nếu muốn rõ hơn
  availability: Availability;
  price: number;
}
