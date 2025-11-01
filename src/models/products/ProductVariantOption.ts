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
  images?: [];
}
