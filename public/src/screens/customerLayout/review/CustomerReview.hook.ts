import { useState } from "react";
import type { ReadableProductReview } from "../../../models/products/ProductReview";
import { ReviewApi } from "../../../api/review/ProductReviewApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

const useCustomerReview = () => {
  const customer = useSelector(
    (state: RootState) => state.customerAuth.customer
  );

  const [reviews, setReviews] = useState<ReadableProductReview[]>([]);
  const getCustomerReviews = async () => {
    if (!customer) return;
    const data = await ReviewApi.getByCustomerId(customer.id);
    setReviews(data.content);
  };

  return { getCustomerReviews, reviews };
};

export default useCustomerReview;
