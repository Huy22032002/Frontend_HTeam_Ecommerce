import React from "react";
import { Box, Typography, Rating, Stack, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { ReadableProductReview } from "../../models/products/ProductReview";
import { useNavigate } from "react-router-dom";
import ImageModalGallery from "../ImageGallery";

type MyReviewItemProps = {
  review: ReadableProductReview;
  onEdit?: (review: ReadableProductReview) => void;
  onDelete?: (review: ReadableProductReview) => void;
};

const MyReviewItem: React.FC<MyReviewItemProps> = ({
  review,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  //modal image

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 2,
        mb: 2,
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": {
                color: "primary.main",
                textDecoration: "underline",
              },
            }}
            onClick={() => navigate(`/product/${review.productVariantId}`)}
            fontWeight={600}
          >
            {review.productVariantOptionName}
          </Typography>
          <Rating size="small" value={review.reviewRating} readOnly /> <br />
          <Typography variant="caption" color="text.secondary">
            {review.reviewDate
              ? new Date(review.reviewDate).toLocaleDateString()
              : ""}{" "}
          </Typography>
        </Box>
        {onEdit && (
          <IconButton size="small" onClick={() => onEdit(review)}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        {onDelete && (
          <IconButton size="small" onClick={() => onDelete(review)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      {/* Comment */}
      {review.comment && (
        <Typography sx={{ mt: 1, mb: 1 }}>{review.comment}</Typography>
      )}

      {/* Review Images */}
      {review.imageUrls && review.imageUrls.length > 0 && (
        <ImageModalGallery imageUrls={review.imageUrls} thumbnailSize={80} />
      )}
    </Box>
  );
};

export default MyReviewItem;
