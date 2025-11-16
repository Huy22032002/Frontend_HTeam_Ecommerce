import {
  Box,
  Button,
  IconButton,
  Modal,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { CreateReviewDto } from "../../models/products/ProductReview";
import React, { useState } from "react";
//icons
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";

type CreateReviewModalProps = {
  open: boolean;
  onClose: () => void;
  onCreateReview: (data: CreateReviewDto) => void;
  sku: string;
  customerId: number;
};

const CreateReviewModal = ({
  open,
  onClose,
  onCreateReview,
  sku,
  customerId,
}: CreateReviewModalProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [imagesFile, setImagesFile] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImagesFile((prev) => [...prev, ...files]);
  };

  const handleSubmit = () => {
    if (!rating) return;

    const createReviewDto: CreateReviewDto = {
      customerId: customerId,
      sku: sku,
      rating: rating,
      comment: comment,
      images: [],
      files: imagesFile,
    };

    onCreateReview(createReviewDto);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 480,
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          boxShadow: 4,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* close button */}
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Viết đánh giá của bạn
        </Typography>
        {/* rating */}
        <Typography variant="subtitle1" mb={1}>
          Đánh giá số sao:{" "}
        </Typography>
        <Rating size="large" value={rating} onChange={(e, v) => setRating(v)} />
        {/* Comment */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Nhận xét của bạn"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mt: 2 }}
        />
        {/* image upload */}
        <Stack direction="row" spacing={1} mt={2} alignItems="center">
          <Button
            variant="outlined"
            component="label"
            startIcon={<AddPhotoAlternateIcon />}
          >
            Thêm hình
            <input type="file" hidden multiple onChange={handleImageUpload} />
          </Button>
        </Stack>

        {/* Xem trước hình */}
        <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
          {imagesFile.map((img, i) => (
            <Box
              key={i}
              component={"img"}
              alt="preview"
              src={URL.createObjectURL(img)}
              sx={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid #ddd",
              }}
            />
          ))}
        </Stack>

        {/* submit */}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, textTransform: "none" }}
          onClick={handleSubmit}
          disabled={!rating}
        >
          Gửi đánh giá
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateReviewModal;
