export interface CartItem {
  id?: number;
  optionId: number;
  sku: string;
  quantity: number;
  currentPrice: number;
  cartId?: number;

  productName?: string;
  prductImage?: string;
}
