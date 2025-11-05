import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import useCreateProduct from "./CreateProduct.hook";
import { useNavigate } from "react-router-dom";

//icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import type { ProductImage } from "../../../models/products/CreateProduct";

const CreateProductScreen = () => {
  const navigate = useNavigate();
  const {
    submitProductForm,
    //state
    setProductName,
    setProductDescription,
    //variants
    variants,
    handleAddVariant,
    handleAddOption,
    handleVariantChange,
    handleOptionChange,
    handleRemoveOption,
    handleRemoveVariant,
    //image

    //cate
    selectedCategoryId,
    setSelectedCategoryId,
    categories,
    //manu
    manufacturers,
    selectedManufacturerId,
    setSelectedManufacturerId,
    //image
    handleRemoveImage,
    handleImageUpload,
    //specs
    handleAddSpec,
    handleRemoveSpec,
    handlePasteSpecsJson,
  } = useCreateProduct();

  return (
    <Card
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* --- Header --- */}
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Thông tin sản phẩm
      </Typography>

      <Stack direction="row" spacing={4} alignItems="flex-start">
        {/* --- Cột trái: Thông tin chung --- */}
        <Box flex={1.2}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              borderColor: "divider",
              bgcolor: "#fafafa",
            }}
          >
            <Typography variant="h6" mb={2} fontWeight="600">
              Thông tin chung
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Tên sản phẩm"
                placeholder="Nhập tên sản phẩm..."
                onChange={(e) => setProductName(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả"
                placeholder="Mô tả ngắn gọn về sản phẩm..."
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </Stack>
          </Card>
        </Box>

        {/* --- Cột phải: Phân loại --- */}
        <Box flex={0.8}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              borderColor: "divider",
              bgcolor: "#fafafa",
            }}
          >
            <Typography variant="h6" mb={2} fontWeight="600">
              Phân loại
            </Typography>

            <Stack spacing={3}>
              {/* Danh mục */}
              <Box display="flex" gap={1} alignItems="flex-end">
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    label="Danh mục"
                    value={selectedCategoryId || ""}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem value={category.id} key={category.id}>
                        <Box display="flex" gap={1} alignItems="center">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            height={28}
                            style={{ borderRadius: 4, objectFit: "cover" }}
                          />
                          <Typography>{category.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  color="primary"
                  onClick={() => navigate("/admin/categories")}
                  title="Thêm danh mục"
                >
                  <AddIcon />
                </IconButton>
              </Box>

              {/* Thương hiệu */}
              <Box display="flex" gap={1} alignItems="flex-end">
                <FormControl fullWidth>
                  <InputLabel>Thương hiệu</InputLabel>
                  <Select
                    label="Thương hiệu"
                    value={selectedManufacturerId || ""}
                    onChange={(e) => setSelectedManufacturerId(e.target.value)}
                  >
                    {manufacturers.map((manufacturer) => (
                      <MenuItem value={manufacturer.id} key={manufacturer.id}>
                        <Box display="flex" gap={1} alignItems="center">
                          <img
                            src={manufacturer.imageUrl}
                            alt={manufacturer.name}
                            height={28}
                            style={{ borderRadius: 4, objectFit: "cover" }}
                          />
                          <Typography>{manufacturer.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  color="primary"
                  onClick={() => navigate("/admin/manufacturers/create")}
                  title="Thêm thương hiệu"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Stack>
          </Card>
        </Box>
      </Stack>

      {/* --- Biến thể sản phẩm --- */}
      <Card
        variant="outlined"
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 2,
          borderColor: "divider",
          bgcolor: "#fff",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={3}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Inventory2OutlinedIcon color="primary" /> Biến thể sản phẩm
        </Typography>

        <Stack spacing={3}>
          {variants.map((variant, variantIndex: number) => (
            <Card
              key={variantIndex}
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                borderColor: "divider",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    placeholder="Ví dụ: Laptop Zenbook 14 512GB"
                    label="Tên biến thể"
                    value={variant.name}
                    onChange={(e) =>
                      handleVariantChange(variantIndex, "name", e.target.value)
                    }
                  />
                  <TextField
                    fullWidth
                    label="Code"
                    placeholder="Ví dụ: zenbook-15-512gb"
                    value={variant.code}
                    onChange={(e) =>
                      handleVariantChange(variantIndex, "code", e.target.value)
                    }
                  />
                  {variants.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveVariant(variantIndex)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>

                <Divider />

                {/* Danh sách option con */}
                <Typography variant="subtitle1" fontWeight={600}>
                  <LocalOfferOutlinedIcon
                    sx={{ fontSize: 18, mr: 0.5, verticalAlign: "middle" }}
                    color="primary"
                  />
                  Tuỳ chọn màu sắc
                </Typography>

                {variant.options.map((option, optionIndex: number) => (
                  <Card
                    key={optionIndex}
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor: "#fff",
                      borderRadius: 2,
                      borderColor: "divider",
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          label="SKU"
                          value={option.sku}
                          placeholder="zenbook_14_512gb_red"
                          onChange={(e) =>
                            handleOptionChange(
                              variantIndex,
                              optionIndex,
                              "sku",
                              e.target.value
                            )
                          }
                        />
                        <TextField
                          label="Màu"
                          placeholder="Ví dụ: Đỏ"
                          value={option.value}
                          onChange={(e) =>
                            handleOptionChange(
                              variantIndex,
                              optionIndex,
                              "value",
                              e.target.value
                            )
                          }
                        />
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          label="Giá gốc (VNĐ)"
                          type="number"
                          value={option.availability.regularPrice}
                          onChange={(e) =>
                            handleOptionChange(
                              variantIndex,
                              optionIndex,
                              "regularPrice",
                              +e.target.value
                            )
                          }
                        />
                        <TextField
                          label="Giá sale (VNĐ)"
                          type="number"
                          value={option.availability.salePrice}
                          onChange={(e) =>
                            handleOptionChange(
                              variantIndex,
                              optionIndex,
                              "salePrice",
                              +e.target.value
                            )
                          }
                        />
                        <TextField
                          label="Tồn kho"
                          type="number"
                          value={option.availability.quantity}
                          onChange={(e) =>
                            handleOptionChange(
                              variantIndex,
                              optionIndex,
                              "quantity",
                              +e.target.value
                            )
                          }
                        />
                        {variant.options.length > 1 && (
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleRemoveOption(variantIndex, optionIndex)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                      <Box>
                        <Typography fontWeight={600} mb={1}>
                          <ImageOutlinedIcon
                            sx={{
                              fontSize: 18,
                              mr: 0.5,
                              verticalAlign: "middle",
                            }}
                            color="primary"
                          />
                          Hình ảnh sản phẩm
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          {(option.images || []).map(
                            (img: ProductImage, imgIndex: number) => (
                              <Box key={imgIndex} position="relative">
                                <img
                                  src={img.productImageUrl}
                                  alt={`option-${imgIndex}`}
                                  width={70}
                                  height={70}
                                  style={{
                                    borderRadius: 6,
                                    objectFit: "cover",
                                    border: "1px solid #ddd",
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleRemoveImage(
                                      variantIndex,
                                      optionIndex,
                                      imgIndex
                                    )
                                  }
                                  sx={{
                                    position: "absolute",
                                    top: -10,
                                    right: -10,
                                    bgcolor: "white",
                                    boxShadow: 1,
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )
                          )}
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AddIcon />}
                            sx={{
                              width: 70,
                              height: 70,
                              borderRadius: 2,
                              borderStyle: "dashed",
                              fontSize: 12,
                            }}
                          >
                            <input
                              type="file"
                              multiple
                              hidden
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(
                                  variantIndex,
                                  optionIndex,
                                  e.target.files
                                )
                              }
                            />
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddOption(variantIndex)}
                  sx={{ alignSelf: "flex-start", mt: 1 }}
                >
                  Thêm tuỳ chọn
                </Button>

                {/* --- Thông số kỹ thuật --- */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Thông số kỹ thuật
                </Typography>

                {/* Display existing specs */}
                {variant.specifications && Object.keys(variant.specifications).length > 0 && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    {Object.entries(variant.specifications).map(([key, value]) => (
                      <Box key={key} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          <strong>{key}:</strong> {String(value)}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveSpec(variantIndex, key)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Add new spec */}
                <Stack direction="row" spacing={1} mb={2}>
                  <TextField
                    label="Khóa (Key)"
                    placeholder="ví dụ: màu_sắc, bộ_nhớ"
                    size="small"
                    id={`spec-key-${variantIndex}`}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Giá trị (Value)"
                    placeholder="ví dụ: Đen, 512GB"
                    size="small"
                    id={`spec-value-${variantIndex}`}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      const keyEl = document.getElementById(`spec-key-${variantIndex}`) as HTMLInputElement;
                      const valEl = document.getElementById(`spec-value-${variantIndex}`) as HTMLInputElement;
                      if (keyEl?.value && valEl?.value) {
                        handleAddSpec(variantIndex, keyEl.value, valEl.value);
                        keyEl.value = '';
                        valEl.value = '';
                      } else {
                        alert('Vui lòng nhập cả khóa và giá trị');
                      }
                    }}
                  >
                    Thêm Spec
                  </Button>
                </Stack>

                {/* Paste JSON specs */}
                <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
                  <Typography variant="caption" display="block" mb={1} fontWeight={600}>
                    Hoặc dán JSON specs (sẽ ghi đè thông số hiện tại):
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      multiline
                      rows={3}
                      placeholder='{"key1": "value1", "key2": "value2"}'
                      size="small"
                      sx={{ flex: 1, fontFamily: 'monospace' }}
                      id={`spec-json-${variantIndex}`}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const jsonEl = document.getElementById(`spec-json-${variantIndex}`) as HTMLTextAreaElement;
                        if (jsonEl?.value) {
                          handlePasteSpecsJson(variantIndex, jsonEl.value);
                          jsonEl.value = '';
                        }
                      }}
                      sx={{ mt: 1 }}
                    >
                      Áp dụng JSON
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          ))}

          {/* Nút thêm variant */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVariant}
            sx={{
              alignSelf: "flex-start",
              mt: 2,
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            Thêm biến thể
          </Button>
        </Stack>
      </Card>
      <Button
        variant="contained"
        color="primary"
        onClick={submitProductForm}
        sx={{ mt: 3, borderRadius: 2, textTransform: "none" }}
      >
        Tạo sản phẩm
      </Button>
    </Card>
  );
};

export default CreateProductScreen;
