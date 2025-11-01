import { useState } from 'react';
import type { OrderItem, OrderItemDisplay, CreateOrderRequest } from '../models/orders/CreateOrderRequest';
import type { ReadableCustomer } from '../models/customer/ReadableCustomer';
import { PromotionApi } from '../api/promotion/PromotionApi';

export interface CreateOrderState {
  selectedCustomer: ReadableCustomer | null;
  selectedItems: OrderItemDisplay[];
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD' | 'E_WALLET';
  notes: string;
  shippingAddress: string;
  receiverPhoneNumber: string;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

export const useCreateOrder = () => {
  const [state, setState] = useState<CreateOrderState>({
    selectedCustomer: null,
    selectedItems: [],
    paymentMethod: 'CASH',
    notes: '',
    shippingAddress: '',
    receiverPhoneNumber: '',
    totalAmount: 0,
    loading: false,
    error: null,
  });

  // Chọn khách hàng
  const setCustomer = (customer: ReadableCustomer | null) => {
    setState(prev => ({
      ...prev,
      selectedCustomer: customer,
    }));
  };

  // Thêm sản phẩm vào đơn hàng
  const addItem = (item: OrderItemDisplay) => {
    setState(prev => {
      const existingItem = prev.selectedItems.find(
        i => i.productVariantOptionId === item.productVariantOptionId
      );

      let updatedItems: OrderItemDisplay[];

      if (existingItem) {
        // Nếu sản phẩm đã tồn tại, cộng thêm số lượng
        updatedItems = prev.selectedItems.map(i =>
          i.productVariantOptionId === item.productVariantOptionId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Thêm sản phẩm mới
        updatedItems = [...prev.selectedItems, item];
      }

      // Tính toán lại tổng tiền
      const total = updatedItems.reduce((sum, i) => {
        const itemTotal = i.price * i.quantity;
        const discount = i.discountAmount ? i.discountAmount * i.quantity : 0;
        return sum + (itemTotal - discount);
      }, 0);

      return {
        ...prev,
        selectedItems: updatedItems,
        totalAmount: total,
        error: null,
      };
    });
  };

  // Cập nhật số lượng sản phẩm
  const updateItemQuantity = (productVariantOptionId: number, quantity: number) => {
    setState(prev => {
      if (quantity <= 0) {
        // Xoá sản phẩm nếu số lượng <= 0
        const updatedItems = prev.selectedItems.filter(
          i => i.productVariantOptionId !== productVariantOptionId
        );
        const total = updatedItems.reduce((sum, i) => {
          const itemTotal = i.price * i.quantity;
          const discount = i.discountAmount ? i.discountAmount * i.quantity : 0;
          return sum + (itemTotal - discount);
        }, 0);

        return {
          ...prev,
          selectedItems: updatedItems,
          totalAmount: total,
        };
      }

      const updatedItems = prev.selectedItems.map(i =>
        i.productVariantOptionId === productVariantOptionId
          ? { ...i, quantity }
          : i
      );

      const total = updatedItems.reduce((sum, i) => {
        const itemTotal = i.price * i.quantity;
        const discount = i.discountAmount ? i.discountAmount * i.quantity : 0;
        return sum + (itemTotal - discount);
      }, 0);

      return {
        ...prev,
        selectedItems: updatedItems,
        totalAmount: total,
      };
    });
  };

  // Xoá sản phẩm khỏi đơn hàng
  const removeItem = (productVariantOptionId: number) => {
    setState(prev => {
      const updatedItems = prev.selectedItems.filter(
        i => i.productVariantOptionId !== productVariantOptionId
      );
      const total = updatedItems.reduce((sum, i) => {
        const itemTotal = i.price * i.quantity;
        const discount = i.discountAmount ? i.discountAmount * i.quantity : 0;
        return sum + (itemTotal - discount);
      }, 0);

      return {
        ...prev,
        selectedItems: updatedItems,
        totalAmount: total,
      };
    });
  };

  // Cập nhật promotion cho sản phẩm
  const updateItemPromotion = (productVariantOptionId: number, promotionId?: number, discountAmount?: number, promotionName?: string) => {
    setState(prev => {
      const updatedItems = prev.selectedItems.map(i =>
        i.productVariantOptionId === productVariantOptionId
          ? { ...i, promotionId, discountAmount, promotionName }
          : i
      );

      const total = updatedItems.reduce((sum, i) => {
        const itemTotal = i.price * i.quantity;
        const discount = i.discountAmount ? i.discountAmount * i.quantity : 0;
        return sum + (itemTotal - discount);
      }, 0);

      return {
        ...prev,
        selectedItems: updatedItems,
        totalAmount: total,
      };
    });
  };

  // Cập nhật phương thức thanh toán
  const setPaymentMethod = (method: 'CASH' | 'TRANSFER' | 'CARD' | 'E_WALLET') => {
    setState(prev => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  // Cập nhật ghi chú
  const setNotes = (notes: string) => {
    setState(prev => ({
      ...prev,
      notes,
    }));
  };

  // Cập nhật địa chỉ giao hàng
  const setShippingAddress = (address: string) => {
    setState(prev => ({
      ...prev,
      shippingAddress: address,
    }));
  };

  // Cập nhật số điện thoại người nhận
  const setReceiverPhoneNumber = (phoneNumber: string) => {
    setState(prev => ({
      ...prev,
      receiverPhoneNumber: phoneNumber,
    }));
  };

  // Tìm promotions cho sản phẩm (dùng SKU)
  const fetchPromotionsForSku = async (sku: string) => {
    try {
      const response = await PromotionApi.getByProductSku(sku);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return [];
    }
  };

  // Xây dựng request để gửi đến backend
  const buildOrderRequest = (): CreateOrderRequest | null => {
    if (!state.selectedCustomer) {
      setState(prev => ({ ...prev, error: 'Vui lòng chọn khách hàng' }));
      return null;
    }

    if (state.selectedItems.length === 0) {
      setState(prev => ({ ...prev, error: 'Vui lòng thêm ít nhất 1 sản phẩm' }));
      return null;
    }

    // Lấy userId từ localStorage
    let userId: number | null = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user?.id || null;
      }
    } catch (error) {
      console.error('Error getting userId:', error);
    }

    const items: OrderItem[] = state.selectedItems.map(item => ({
      variantId: item.variantId,
      productVariantOptionId: item.productVariantOptionId,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      promotionId: item.promotionId,
      discountAmount: item.discountAmount,
    }));

    return {
      customerId: state.selectedCustomer.id, // Đã là Long
      userId: userId || undefined, // Thêm userId (undefined nếu khách hàng tạo)
      items,
      paymentMethod: state.paymentMethod,
      notes: state.notes,
      shippingAddress: state.shippingAddress,
      receiverPhoneNumber: state.receiverPhoneNumber,
      totalAmount: state.totalAmount,
    };
  };

  // Reset form
  const reset = () => {
    setState({
      selectedCustomer: null,
      selectedItems: [],
      paymentMethod: 'CASH',
      notes: '',
      shippingAddress: '',
      receiverPhoneNumber: '',
      totalAmount: 0,
      loading: false,
      error: null,
    });
  };

  return {
    state,
    setCustomer,
    addItem,
    updateItemQuantity,
    removeItem,
    updateItemPromotion,
    setPaymentMethod,
    setNotes,
    setShippingAddress,
    setReceiverPhoneNumber,
    fetchPromotionsForSku,
    buildOrderRequest,
    reset,
    setLoading: (loading: boolean) => setState(prev => ({ ...prev, loading })),
    setError: (error: string | null) => setState(prev => ({ ...prev, error })),
  };
};
