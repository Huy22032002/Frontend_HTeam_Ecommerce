import { useState } from "react";
import { VariantsApi } from "../../../api/product/VariantApi";

import type { ProductVariants } from "../../../models/products/ProductVariant";
import type { ProductOption } from "../../../models/products/ProductVariantOption";
import { CartApi } from "../../../api/cart/cartApi";
import type { CartItem } from "../../../models/cart/CartItem";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../../../store/cartSlice";
import type { RootState } from "../../../store/store";

const useVariantDetail = () => {
  const dispatch = useDispatch();
  const customer = useSelector((state: RootState) => state.customerAuth?.customer);
  const currentCart = useSelector((state: RootState) => state.cart.cart);

  const [variant, setVariant] = useState<ProductVariants | null>(null);
  const [currentOption, setCurrentOption] = useState<ProductOption | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const getProductVariant = async (variantId: number) => {
    const data = await VariantsApi.getById(variantId);
    if (data) {
      setVariant(data);
      setCurrentOption(data.options?.[0]);
      console.log("cur option: ", data.options?.[0]);
    }
  };

  //cart
  const addOptionsToCart = async (cartCode: string | undefined, option: ProductOption | undefined) => {
    if (!option?.id) {
      console.error("Option chưa có id, không thể thêm vào giỏ hàng");
      return;
    }

    // Nếu chưa có cartCode, tạo cart mới từ customer
    let finalCartCode = cartCode;

    if (!finalCartCode) {
      if (!customer?.id) {
        console.error("Khách hàng chưa đăng nhập");
        return;
      }

      try {
        setIsLoading(true);
        const newCart = await CartApi.getOrCreateByCustomerId(customer.id);
        if (!newCart?.cartCode) {
          console.error("Không thể tạo giỏ hàng mới");
          return;
        }
        finalCartCode = newCart.cartCode;
        // Cập nhật cart vào Redux
        dispatch(setCart(newCart));
      } catch (error) {
        console.error("Lỗi khi tạo giỏ hàng:", error);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Kiểm tra xem product này đã tồn tại trong cart chưa
    const existingItem = currentCart?.items?.find(
      (item) => item.optionId === option.id
    );

    if (existingItem && existingItem.id) {
      // Nếu đã có, tăng quantity lên 2
      console.log("Product đã tồn tại trong giỏ, tăng quantity lên 2");
      const data = await CartApi.updateCartItemQuantity(
        finalCartCode,
        existingItem.id,
        "inc"
      );
      if (data) {
        dispatch(setCart(data));
        console.log("Tăng số lượng thành công");
      } else {
        console.error("Lỗi khi tăng số lượng");
      }
    } else {
      // Nếu chưa có, thêm item mới
      const cartItem: CartItem = {
        optionId: option.id,
        quantity: 1,
        sku: option.sku,
        cartId: 0,
        currentPrice:
          option.availability.salePrice ?? option.availability.regularPrice,
      };

      const data = await CartApi.addCartItem(finalCartCode, cartItem);
      if (data) {
        dispatch(setCart(data));
        console.log("Thêm vào giỏ hàng thành công");
      } else console.error("Lỗi khi thêm vào giỏ hàng");
    }
  };

  return {
    //productVariant
    getProductVariant,
    variant,
    setVariant,
    //option
    currentOption,
    setCurrentOption,
    //cart
    addOptionsToCart,
    isLoading,
  };
};

export default useVariantDetail;
