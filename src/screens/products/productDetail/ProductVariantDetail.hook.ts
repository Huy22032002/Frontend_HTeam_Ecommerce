import { useState } from "react";
import { VariantsApi } from "../../../api/product/VariantApi";

import type { ProductVariants } from "../../../models/products/ProductVariant";
import type { ProductOption } from "../../../models/products/ProductVariantOption";
import { CartApi } from "../../../api/cart/cartApi";
import type { CartItem } from "../../../models/cart/CartItem";
import { useDispatch } from "react-redux";
import { setCart } from "../../../store/cartSlice";

const useVariantDetail = () => {
  const dispatch = useDispatch();

  const [variant, setVariant] = useState<ProductVariants | null>(null);
  const [currentOption, setCurrentOption] = useState<ProductOption | null>(
    null
  );

  const getProductVariant = async (variantId: number) => {
    const data = await VariantsApi.getById(variantId);
    if (data) {
      setVariant(data);
      setCurrentOption(data.options?.[0]);
      console.log("cur option: ", data.options?.[0]);
    }
  };
  //cart
  const addOptionsToCart = async (cartCode: string, option: ProductOption) => {
    if (!option.id) {
      console.error("Option chưa có id, không thể thêm vào giỏ hàng");
      return;
    }

    const cartItem: CartItem = {
      optionId: option.id,
      quantity: 1,
      sku: option.sku,
      cartId: 0,
      currentPrice:
        option.availability.salePrice ?? option.availability.regularPrice,
    };

    const data = await CartApi.addCartItem(cartCode, cartItem);
    if (data) dispatch(setCart(data));
    else console.error("Lỗi khi thêm vào giỏ hàng");
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
  };
};

export default useVariantDetail;
