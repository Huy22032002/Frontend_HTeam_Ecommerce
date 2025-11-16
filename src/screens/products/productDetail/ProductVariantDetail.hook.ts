import { useState } from "react";
import { VariantsApi } from "../../../api/product/VariantApi";

import type { ProductVariants } from "../../../models/products/ProductVariant";
import type { ProductOption } from "../../../models/products/ProductVariantOption";
import { CartApi } from "../../../api/cart/cartApi";
import type { CartItem } from "../../../models/cart/CartItem";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../../../store/cartSlice";
import type { RootState } from "../../../store/store";
import type {
  CreateReviewDto,
  ReadableProductReview,
} from "../../../models/products/ProductReview";
import { ReviewApi } from "../../../api/review/ProductReviewApi";
import { CloudApi } from "../../../api/CloudApi";

const useVariantDetail = () => {
  const dispatch = useDispatch();
  const customer = useSelector(
    (state: RootState) => state.customerAuth?.customer
  );
  const currentCart = useSelector((state: RootState) => state.cart.cart);

  const [variant, setVariant] = useState<ProductVariants | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<
    ProductVariants[]
  >([]);
  const [currentOption, setCurrentOption] = useState<ProductOption | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const getProductVariant = async (variantId: number) => {
    const data = await VariantsApi.getById(variantId);
    if (data) {
      setVariant(data);
      setCurrentOption(data.options?.[0]);

      // Set recommended products từ response, lọc ra sản phẩm hiện tại
      if (data.recommendedProducts && Array.isArray(data.recommendedProducts)) {
        const filtered = data.recommendedProducts.filter(
          (product: ProductVariants) => product.id !== data.id
        );
        setRecommendedProducts(filtered);
      } else {
        setRecommendedProducts([]);
      }

      console.log("cur option: ", data.options?.[0]);
      console.log(
        "recommended products (filtered): ",
        data.recommendedProducts
      );
    }
  };

  //cart
  const addOptionsToCart = async (
    cartCode: string | undefined,
    option: ProductOption | undefined
  ) => {
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

  //reviews
  const [reviews, setReviews] = useState<ReadableProductReview[]>([]);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("ALL");

  const loadReviews = async () => {
    if (!currentOption || currentOption.id === undefined) {
      setReviews([]); // tránh treo UI
      setTotalPages(1);
      setIsLoadingReview(false);
      return;
    }
    setIsLoadingReview(true);

    try {
      const data = await ReviewApi.getListByProductOptionId(
        currentOption.id,
        page - 1 // nếu API hỗ trợ phân trang
      );

      if (data && Array.isArray(data.content)) {
        let filtered = data.content;

        if (filter === "WITH_IMAGES") {
          filtered = filtered.filter(
            (r) => r.imageUrls && r.imageUrls.length > 0
          );
        } else if (filter === "5_STAR") {
          filtered = filtered.filter((r) => r.reviewRating === 5);
        } else if (filter === "4_STAR") {
          filtered = filtered.filter((r) => r.reviewRating === 4);
        } else if (filter === "3_STAR") {
          filtered = filtered.filter((r) => r.reviewRating === 3);
        } else if (filter === "2_STAR") {
          filtered = filtered.filter((r) => r.reviewRating === 2);
        } else if (filter === "1_STAR") {
          filtered = filtered.filter((r) => r.reviewRating === 1);
        }

        setReviews(filtered);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setReviews([]);
      setTotalPages(1);
    } finally {
      setIsLoadingReview(false);
    }
  };
  //check can review
  const [canReview, setCanReview] = useState(false);
  const checkCanReview = async () => {
    if (customer?.id == undefined || currentOption?.sku == undefined) return;

    const result = await ReviewApi.checkCanReview(
      customer?.id,
      currentOption?.sku
    );
    setCanReview(result);
  };

  //tạo review
  const [openCreateReview, setOpenCreateReview] = useState(false);
  const handleCreateReview = async (data: CreateReviewDto) => {
    if (!data) return;
    setIsLoadingReview(true);
    try {
      //upload hinh len cloud
      if (data.files) {
        const formData = new FormData();
        formData.append("folder", "reviews");
        data.files.forEach((file) => formData.append("file", file));

        const imgUrls = await CloudApi.uploadImages(formData);
        if (imgUrls == null) {
          alert("Loi ko upload dc hinh");
          return;
        }
        console.log("list url img uploaded: ", imgUrls);

        data.images = imgUrls ?? [];
      }

      const readableReview = await ReviewApi.createReview(data);
      //response.data la ReadableReview
      if (readableReview) {
        setReviews((prev) => [readableReview, ...prev]); // Thêm review mới lên đầu
      }
    } catch (err: any) {
      throw new Error(err.message);
    } finally {
      setIsLoadingReview(false);
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
    //recommendations
    recommendedProducts,
    //cart
    addOptionsToCart,
    isLoading,
    setIsLoading,
    //review
    canReview,
    checkCanReview,
    openCreateReview,
    setOpenCreateReview,
    handleCreateReview,
    reviews,
    isLoadingReview,
    setIsLoadingReview,
    setReviews,
    loadReviews,
    page,
    setPage,
    filter,
    setFilter,
    totalPages,
    setTotalPages,
  };
};

export default useVariantDetail;
