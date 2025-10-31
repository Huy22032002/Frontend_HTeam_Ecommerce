import { useState } from "react";
import { VariantsApi } from "../../../api/product/VariantApi";

import type { ProductVariants } from "../../../models/products/ProductVariant";
import type { ProductOption } from "../../../models/products/ProductVariantOption";

const useVariantDetail = () => {
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

  return {
    //productVariant
    getProductVariant,
    variant,
    setVariant,
    //option
    currentOption,
    setCurrentOption,
  };
};

export default useVariantDetail;
