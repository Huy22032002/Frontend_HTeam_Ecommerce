import type { ProductOption } from "../products/ProductVariantOption";

export interface FlashSaleItemDTO {
  sku: string;
  flashPrice: number;
  maxPerUser?: number;
  limitQuantity: number;
  soldQuantity?: number;
  option: ProductOption;
  endTime: string;
}
