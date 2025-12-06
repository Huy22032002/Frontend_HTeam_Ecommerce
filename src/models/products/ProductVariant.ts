import type { ProductOption } from "./ProductVariantOption";

export interface ProductVariants {
  id: number;
  code: string;
  name: string;
  defaultSelection: boolean;
  sortOrder: number | null;
  specs: Record<string, any>; 
  stock: number;
  options: ProductOption[];
  productName?: string;
  manufacturerName?: string;
  categories?: string[];
}
