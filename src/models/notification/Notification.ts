export interface Notification {
  id: number;
  recipientType: "CUSTOMER" | "ADMIN" | "SUPERADMIN";
  recipientId: number; //customer hoặc admin
  title: string;
  message: string;
  type:
    | "CART_EXPIRED"
    | "ORDER_SUCCESS"
    | "PRODUCT_OUT_OF_STOCK"
    | "SYSTEM_ALERT"
    | "NEW_USER_REGISTERED"
    | "PAYMENT_FAILED";
  read: boolean;
  audit: {
    createdAt: string;
    modifiedAt: string;
  };
}
