import type { ProductOption } from "./ProductVariantOption";

export interface ProductVariants {
  id: number;
  code: string;
  name: string;
  defaultSelection: boolean;
  sortOrder: number | null;
  options: ProductOption[];
  specs: Record<string, any>; // nếu specs là object tự do
}
