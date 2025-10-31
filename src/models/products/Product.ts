import type { ProductVariants } from "./ProductVariant";

export interface Product {
  id: number;
  productName: string;
  dateAvailable?: string; // Instant -> string (ISO format)
  available?: boolean;
  manufacturerName?: string; // optional
  taxClassName?: string; // optional
  categories: string[];
  variants: ProductVariants[];
}
