import React, { useState } from "react";
import { Box, Stack, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type ImageModalGalleryProps = {
  imageUrls?: string[];
  thumbnailSize?: number;
};

const ImageModalGallery: React.FC<ImageModalGalleryProps> = ({
  imageUrls = [],
  thumbnailSize = 80,
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  if (!imageUrls || imageUrls.length === 0) return null;

  const handleClickImage = (img: string) => setPreview(img);
  const handleClosePreview = () => setPreview(null);

  return (
    <>
      {/* Thumbnails */}
      <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
        {imageUrls.map((img, idx) => (
          <Box
            key={idx}
            component="img"
            src={img}
            alt={`image-${idx}`}
            sx={{
              width: thumbnailSize,
              height: thumbnailSize,
              objectFit: "cover",
              borderRadius: 1,
              border: "1px solid #ddd",
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main", boxShadow: 1 },
            }}
            onClick={() => handleClickImage(img)}
          />
        ))}
      </Stack>

      {/* Modal xem ảnh */}
      <Modal open={!!preview} onClose={handleClosePreview}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            outline: "none",
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8, color: "#fff" }}
            onClick={handleClosePreview}
          >
            <CloseIcon />
          </IconButton>
          {preview && (
            <Box
              component="img"
              src={preview}
              alt="preview-large"
              sx={{
                maxHeight: "80vh",
                maxWidth: "80vw",
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ImageModalGallery;
