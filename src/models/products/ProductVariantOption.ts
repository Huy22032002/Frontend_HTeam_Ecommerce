import type { Availability } from "./ProductAvailability";

export interface ProductOption {
  id?: number;
  sku: string;
  code: string;
  value: string;
  sortOrder?: number | null;
  reviewAvg?: number;
  reviewCount?: number;
  description?: string | null;
  availability: Availability;
  price: number;
  images?: ProductImage[];
  image?: ProductImage[];
  name?: string; //name variant
  variantId?: number; //id variant
}

export interface ProductImage {
  id?: number;
  productImageUrl?: string;
  sortOrder?: number;
  altTag: "";
}
