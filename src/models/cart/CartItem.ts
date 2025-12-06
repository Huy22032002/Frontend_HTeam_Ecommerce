export interface ProductImage {
  id?: number;
  productImageUrl?: string;
  sortOrder?: number;
  altTag: "";
}

export interface CartItem {
  id?: number;
  optionId: number;
  sku: string;
  quantity: number;
  currentPrice: number;
  cartId?: number;

  productName?: string;
  prductImage?: string;
  images?: ProductImage[];
}
