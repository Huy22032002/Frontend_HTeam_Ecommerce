import type { CartItem } from "./CartItem";

export interface Cart {
  id?: number;
  cartCode: string;
  items?: CartItem[];
  customerId?: number | null;
  orderId?: number | null;
}
