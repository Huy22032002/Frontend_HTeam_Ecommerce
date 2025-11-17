import type { Notification } from "../models/notification/Notification";

export const mapNotificationRoute = (n: Notification): string | null => {
  switch (n.type) {
    case "ORDER_SUCCESS":
      //  lấy orderId từ message hoặc để mặc định
      return `/customer/orders-history`;

    case "CART_EXPIRED":
      return `/cart`;

    case "PRODUCT_OUT_OF_STOCK":
      return `/products`;

    case "NEW_USER_REGISTERED":
      return `/admin/users`;

    default:
      return null;
  }
};
