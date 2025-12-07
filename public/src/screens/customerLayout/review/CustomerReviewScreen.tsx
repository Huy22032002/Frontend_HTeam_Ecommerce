import { Box, Typography } from "@mui/material";
import useCustomerReview from "./CustomerReview.hook";
import { useEffect } from "react";
import MyReviewItem from "../../../components/review/MyReviewItem";

const CustomerReviewScreen = () => {
  const { getCustomerReviews, reviews } = useCustomerReview();

  useEffect(() => {
    getCustomerReviews();
  }, []);

  return (
    <Box sx={{ flex: 1 }}>
      {" "}
      <Typography variant="h5" fontWeight={600} mb={3}>
        Đánh giá của tôi
      </Typography>
      {reviews.length == 0 && (
        <Typography>Bạn chưa đánh giá lần nào!</Typography>
      )}
      {reviews.map((review) => (
        <MyReviewItem review={review} key={review.id} />
      ))}
    </Box>
  );
};

export default CustomerReviewScreen;
