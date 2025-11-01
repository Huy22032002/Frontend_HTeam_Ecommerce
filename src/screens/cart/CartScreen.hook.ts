import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { OrderApi } from '../../api/order/OrderApi';
import type { CreateOrderRequest } from '../../models/orders/CreateOrderRequest';
import type { CartItem } from '../../models/cart/CartItem';

export interface CheckoutData {
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD' | 'E_WALLET';
  notes?: string;
  shippingAddress: string;
  receiverPhoneNumber: string;
}

const useCartScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const cart = useSelector((state: RootState) => state.cart.cart);
  const customer = useSelector((state: RootState) => state.customerAuth?.customer);

  // Chuyển đổi CartItem thành OrderItem
  const convertCartToOrderItems = useCallback((cartItems: CartItem[]) => {
    return cartItems.map(item => ({
      variantId: item.optionId, // Tạm thời sử dụng optionId làm variantId
      productVariantOptionId: item.optionId,
      sku: item.sku,
      quantity: item.quantity,
      price: item.currentPrice,
    }));
  }, []);

  // Xử lý thanh toán
  const handleCheckout = useCallback(async (checkoutData: CheckoutData) => {
    if (!cart?.items || cart.items.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    if (!customer?.id) {
      setError('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    if (!checkoutData.shippingAddress) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (!checkoutData.receiverPhoneNumber) {
      setError('Vui lòng nhập số điện thoại người nhận');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const orderRequest: CreateOrderRequest = {
        customerId: customer.id,
        items: convertCartToOrderItems(cart.items),
        paymentMethod: checkoutData.paymentMethod,
        notes: checkoutData.notes || '',
        shippingAddress: checkoutData.shippingAddress,
        receiverPhoneNumber: checkoutData.receiverPhoneNumber,
        totalAmount: cart.items.reduce(
          (sum, item) => sum + item.currentPrice * item.quantity,
          0
        ),
        customerCartCode: cart.cartCode,
      };

      const response = await OrderApi.create(orderRequest as any);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Tạo đơn hàng thành công!');
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng';
      setError(errorMessage);
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cart, customer, convertCartToOrderItems]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    isLoading,
    error,
    successMessage,
    handleCheckout,
    clearMessages,
    hasCart: cart?.items && cart.items.length > 0,
    isAuthenticated: !!customer?.id,
  };
};

export default useCartScreen;
