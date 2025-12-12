export interface Notification {
  id: number;
  recipientType: "CUSTOMER" | "ADMIN" | "SUPERADMIN";
  recipientId: number; //customer hoặc admin
  title: string;
  message: string;
  type:
    | "CART_EXPIRED"
    | "ORDER_SUCCESS"
    | "ORDER_CONFIRMED"
    | "ORDER_CANCELLED"
    | "ORDER_SHIPPED"
    | "STAFF_CREATED_ORDER"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "PRODUCT_OUT_OF_STOCK"
    | "SYSTEM_ALERT"
    | "NEW_USER_REGISTERED"
    | "NEW_VOUCHER";
  read: boolean;
  audit: {
    createdAt: string;
    modifiedAt: string;
  };
}
