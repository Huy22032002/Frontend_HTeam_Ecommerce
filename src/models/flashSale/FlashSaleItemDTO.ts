export interface FlashSaleItemDTO {
  sku: string;
  flashPrice: number;
  startTime?: string;
  endTime?: string;
  maxPerUser?: number;
  limitQuantity: number;
  soldQuantity?: number;
}
