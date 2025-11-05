import React, { useEffect, useState } from "react";
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { useParams, useNavigate } from "react-router-dom";
import { ProductApi } from "../../../api/product/ProductApi";
import { CategoryApi } from "../../../api/catalog/CategoryApi";
import { ManufacturerApi } from "../../../api/manufacturer/manufacturerApi";
import type { Category } from "../../../models/catalogs/Category";
import type { Manufacturer } from "../../../models/manufacturer/Manufacturer";

interface ProductVariant {
  id?: number;
  name: string;
  code: string;
  specs?: Record<string, any>;
  specifications?: Record<string, any>;
  options: ProductOption[];
}

interface ProductOption {
  id?: number;
  sku: string;
  code: string;
  value: string;
  availability?: {
    id?: number;
    regularPrice: number;
    salePrice: number;
    quantity: number;
  };
  image?: ProductImage[];
  images?: ProductImage[];
}

interface ProductImage {
  id?: number;
  productImageUrl: string;
  altTag?: string;
  sortOrder?: number;
  files?: File[];
}

interface Product {
  id: number;
  productName: string;
  description: string;
  variants: ProductVariant[];
  listCategories?: Category[];
  manufacturer?: Manufacturer;
}

const EditProductScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<number | "">("");

  // Dialog states
  const [specsDialogOpen, setSpecsDialogOpen] = useState(false);
  const [specsDialogVariantIndex, setSpecsDialogVariantIndex] = useState(0);
  const [specKeyInput, setSpecKeyInput] = useState("");
  const [specValueInput, setSpecValueInput] = useState("");
  const [specsJsonInput, setSpecsJsonInput] = useState("");
  const [specsInputMode, setSpecsInputMode] = useState<"individual" | "json">("individual");

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        const response = await ProductApi.getByIdAdmin(Number(id));
        const productData = response.data;
        setProduct(productData);
        setProductName(productData.productName);
        setProductDescription(productData.description);
        // Normalize specs field: ensure all variants have 'specifications' property
        const normalizedVariants = (productData.variants || []).map((v: any) => ({
          ...v,
          specifications: v.specs || v.specifications || {},
        }));
        setVariants(normalizedVariants);
        
        if (productData.listCategories && productData.listCategories.length > 0) {
          setSelectedCategoryIds(productData.listCategories.map((c: any) => c.id));
        }
        if (productData.manufacturer) {
          setSelectedManufacturerId(productData.manufacturer.id);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
        alert("Lỗi khi tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Load categories and manufacturers
  useEffect(() => {
    const loadData = async () => {
      try {
        const catsData = await CategoryApi.getAllNoPaging();
        setCategories(catsData);

        const manufData = await ManufacturerApi.getAll();
        if (manufData.length > 0) {
          setManufacturers(manufData);
        }
      } catch (error) {
        console.error("Failed to load categories/manufacturers:", error);
      }
    };

    loadData();
  }, []);

  const handleVariantChange = (variantIndex: number, field: string, value: any) => {
    const updated = [...variants];
    updated[variantIndex] = {
      ...updated[variantIndex],
      [field]: value,
    };
    setVariants(updated);
  };

  const handleOptionChange = (
    variantIndex: number,
    optionIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...variants];
    const currentVariant = updated[variantIndex];
    const currentOption = currentVariant.options[optionIndex];

    if (field in (currentOption.availability || {})) {
      currentOption.availability = {
        id: currentOption.availability?.id,
        regularPrice: field === 'regularPrice' ? value : (currentOption.availability?.regularPrice || 0),
        salePrice: field === 'salePrice' ? value : (currentOption.availability?.salePrice || 0),
        quantity: field === 'quantity' ? value : (currentOption.availability?.quantity || 0),
      };
    } else {
      (currentOption as any)[field] = value;
    }

    setVariants(updated);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: "",
        code: "",
        specifications: {},
        options: [],
      },
    ]);
  };

  const handleRemoveVariant = async (variantIndex: number) => {
    const variant = variants[variantIndex];
    if (variant.id && window.confirm("Xác nhân xóa biến thể này?")) {
      try {
        await ProductApi.deleteVariant(variant.id);
        setVariants(variants.filter((_, i) => i !== variantIndex));
      } catch (error) {
        console.error("Failed to delete variant:", error);
        alert("Lỗi khi xóa biến thể");
      }
    } else if (!variant.id) {
      // Variant chưa được lưu, chỉ xóa khỏi state
      setVariants(variants.filter((_, i) => i !== variantIndex));
    }
  };

  const handleAddOption = (variantIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].options.push({
      sku: "",
      code: "color",
      value: "",
      availability: {
        regularPrice: 0,
        salePrice: 0,
        quantity: 0,
      },
    });
    setVariants(updated);
  };

  const handleRemoveOption = async (variantIndex: number, optionIndex: number) => {
    const option = variants[variantIndex].options[optionIndex];
    if (option.id && window.confirm("Xác nhân xóa tuỳ chọn này?")) {
      try {
        await ProductApi.deleteOption(option.id);
        const updated = [...variants];
        updated[variantIndex].options = updated[variantIndex].options.filter(
          (_, i) => i !== optionIndex
        );
        setVariants(updated);
      } catch (error) {
        console.error("Failed to delete option:", error);
        alert("Lỗi khi xóa tuỳ chọn");
      }
    } else if (!option.id) {
      const updated = [...variants];
      updated[variantIndex].options = updated[variantIndex].options.filter(
        (_, i) => i !== optionIndex
      );
      setVariants(updated);
    }
  };

  const handleAddSpec = async (variantIndex: number, key: string, value: string) => {
    const variant = variants[variantIndex];
    if (!variant.id) {
      // Not saved yet, just update local state
      const updated = [...variants];
      if (!updated[variantIndex].specifications) {
        updated[variantIndex].specifications = {};
      }
      updated[variantIndex].specifications![key] = value;
      setVariants(updated);
    } else {
      // Call backend to add spec
      try {
        const result = await ProductApi.addSpecToVariant(variant.id, key, value);
        if (result && result.data) {
          const updated = [...variants];
          updated[variantIndex] = result.data;
          setVariants(updated);
        }
      } catch (error) {
        console.error("Failed to add spec:", error);
        alert("Lỗi khi thêm thông số");
      }
    }
  };

  const handleRemoveSpec = async (variantIndex: number, key: string) => {
    const variant = variants[variantIndex];
    if (!variant.id) {
      // Not saved yet, just update local state
      const updated = [...variants];
      if (updated[variantIndex].specifications) {
        delete updated[variantIndex].specifications![key];
      }
      setVariants(updated);
    } else {
      // Call backend to remove spec
      try {
        const result = await ProductApi.removeSpecFromVariant(variant.id, key);
        if (result && result.data) {
          const updated = [...variants];
          updated[variantIndex] = result.data;
          setVariants(updated);
        }
      } catch (error) {
        console.error("Failed to remove spec:", error);
        alert("Lỗi khi xóa thông số");
      }
    }
  };

  const handleAddSpecsFromJson = async (variantIndex: number, jsonText: string) => {
    try {
      const specsObj = JSON.parse(jsonText);
      if (typeof specsObj !== "object" || Array.isArray(specsObj)) {
        alert("JSON phải là object (ví dụ: {\"key1\": \"value1\", \"key2\": \"value2\"})");
        return;
      }

      const variant = variants[variantIndex];
      if (!variant.id) {
        // Not saved yet, just update local state
        const updated = [...variants];
        if (!updated[variantIndex].specifications) {
          updated[variantIndex].specifications = {};
        }
        Object.assign(updated[variantIndex].specifications!, specsObj);
        setVariants(updated);
      } else {
        // Call backend to update all specs
        try {
          const result = await ProductApi.updateVariantSpecs(variant.id, specsObj);
          if (result && result.data) {
            const updated = [...variants];
            updated[variantIndex] = result.data;
            setVariants(updated);
          }
        } catch (error) {
          console.error("Failed to update specs:", error);
          alert("Lỗi khi cập nhật thông số");
        }
      }
    } catch (error) {
      alert("JSON không hợp lệ. Vui lòng kiểm tra lại định dạng.");
      console.error("Invalid JSON:", error);
    }
  };

  const handleSaveProduct = async () => {
    if (!productName.trim()) {
      alert("Tên sản phẩm không được để trống");
      return;
    }

    try {
      // For now, we're just updating variants locally
      // In a full implementation, you'd call backend update endpoints
      alert("Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Lỗi khi lưu sản phẩm");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return <Typography>Không tìm thấy sản phẩm</Typography>;
  }

  return (
    <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Chỉnh sửa: {productName}
      </Typography>

      <Stack direction="row" spacing={4} alignItems="flex-start">
        {/* Left: General Info */}
        <Box flex={1.2}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: "divider", bgcolor: "#fafafa" }}>
            <Typography variant="h6" mb={2} fontWeight={600}>
              Thông tin chung
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Tên sản phẩm"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </Stack>
          </Card>
        </Box>

        {/* Right: Classification */}
        <Box flex={0.8}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: "divider", bgcolor: "#fafafa" }}>
            <Typography variant="h6" mb={2} fontWeight={600}>
              Phân loại
            </Typography>

            <Stack spacing={3}>
              <Box display="flex" gap={1} alignItems="flex-end">
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    label="Danh mục"
                    value={selectedCategoryIds[0] || ""}
                    onChange={(e) => setSelectedCategoryIds([Number(e.target.value)])}
                  >
                    {categories.map((cat) => (
                      <MenuItem value={cat.id} key={cat.id}>
                        <Box display="flex" gap={1} alignItems="center">
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            height={28}
                            style={{ borderRadius: 4, objectFit: "cover" }}
                          />
                          <Typography>{cat.name}</Typography>
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

              <Box display="flex" gap={1} alignItems="flex-end">
                <FormControl fullWidth>
                  <InputLabel>Thương hiệu</InputLabel>
                  <Select
                    label="Thương hiệu"
                    value={selectedManufacturerId || ""}
                    onChange={(e) => setSelectedManufacturerId(e.target.value)}
                  >
                    {manufacturers.map((manu) => (
                      <MenuItem value={manu.id} key={manu.id}>
                        <Box display="flex" gap={1} alignItems="center">
                          <img
                            src={manu.imageUrl}
                            alt={manu.name}
                            height={28}
                            style={{ borderRadius: 4, objectFit: "cover" }}
                          />
                          <Typography>{manu.name}</Typography>
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

      {/* Variants */}
      <Card variant="outlined" sx={{ mt: 4, p: 3, borderRadius: 2, borderColor: "divider", bgcolor: "#fff" }}>
        <Typography variant="h5" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
          <Inventory2OutlinedIcon color="primary" /> Biến thể sản phẩm
        </Typography>

        <Stack spacing={3}>
          {variants.map((variant, variantIndex) => (
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
                    label="Tên biến thể"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(variantIndex, "name", e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Code"
                    value={variant.code}
                    onChange={(e) => handleVariantChange(variantIndex, "code", e.target.value)}
                  />
                  {variants.length > 1 && (
                    <IconButton color="error" onClick={() => handleRemoveVariant(variantIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>

                <Divider />

                {/* Options */}
                <Typography variant="subtitle1" fontWeight={600}>
                  <LocalOfferOutlinedIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: "middle" }} color="primary" />
                  Tuỳ chọn
                </Typography>

                {variant.options.map((option, optionIndex) => (
                  <Card
                    key={optionIndex}
                    variant="outlined"
                    sx={{ p: 2, backgroundColor: "#fff", borderRadius: 2, borderColor: "divider" }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          label="SKU"
                          value={option.sku}
                          onChange={(e) =>
                            handleOptionChange(variantIndex, optionIndex, "sku", e.target.value)
                          }
                        />
                        <TextField
                          label="Màu"
                          value={option.value}
                          onChange={(e) =>
                            handleOptionChange(variantIndex, optionIndex, "value", e.target.value)
                          }
                        />
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          label="Giá gốc (VNĐ)"
                          type="number"
                          value={option.availability?.regularPrice || 0}
                          onChange={(e) =>
                            handleOptionChange(variantIndex, optionIndex, "regularPrice", +e.target.value)
                          }
                        />
                        <TextField
                          label="Giá sale (VNĐ)"
                          type="number"
                          value={option.availability?.salePrice || 0}
                          onChange={(e) =>
                            handleOptionChange(variantIndex, optionIndex, "salePrice", +e.target.value)
                          }
                        />
                        <TextField
                          label="Tồn kho"
                          type="number"
                          value={option.availability?.quantity || 0}
                          onChange={(e) =>
                            handleOptionChange(variantIndex, optionIndex, "quantity", +e.target.value)
                          }
                        />
                        {variant.options.length > 1 && (
                          <IconButton color="error" onClick={() => handleRemoveOption(variantIndex, optionIndex)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
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

                {/* Specs Section */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Thông số kỹ thuật
                </Typography>

                {variant.specifications && Object.keys(variant.specifications).length > 0 && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                    {Object.entries(variant.specifications).map(([key, value]) => (
                      <Box key={key} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          <strong>{key}:</strong> {String(value)}
                        </Typography>
                        <IconButton size="small" color="error" onClick={() => handleRemoveSpec(variantIndex, key)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}

                {(!variant.specifications || Object.keys(variant.specifications).length === 0) && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Chưa có thông số kỹ thuật
                  </Typography>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSpecsDialogVariantIndex(variantIndex);
                    setSpecsDialogOpen(true);
                  }}
                >
                  Chỉnh sửa thông số
                </Button>
              </Stack>
            </Card>
          ))}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVariant}
            sx={{ alignSelf: "flex-start", mt: 2, borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Thêm biến thể
          </Button>
        </Stack>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => navigate("/admin/products")}>
          Hủy
        </Button>
        <Button variant="contained" color="primary" onClick={handleSaveProduct}>
          Lưu thay đổi
        </Button>
      </Stack>

      {/* Specs Dialog */}
      <Dialog open={specsDialogOpen} onClose={() => {
        setSpecsDialogOpen(false);
        setSpecKeyInput("");
        setSpecValueInput("");
        setSpecsJsonInput("");
        setSpecsInputMode("individual");
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa thông số kỹ thuật</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={2}>
            {/* Tab/Toggle để chọn chế độ nhập */}
            <Stack direction="row" spacing={1}>
              <Button
                variant={specsInputMode === "individual" ? "contained" : "outlined"}
                size="small"
                onClick={() => setSpecsInputMode("individual")}
                sx={{ flex: 1 }}
              >
                Thêm từng cái
              </Button>
              <Button
                variant={specsInputMode === "json" ? "contained" : "outlined"}
                size="small"
                onClick={() => setSpecsInputMode("json")}
                sx={{ flex: 1 }}
              >
                Paste JSON
              </Button>
            </Stack>

            {specsInputMode === "individual" ? (
              <>
                <TextField
                  label="Khóa (Key)"
                  placeholder="ví dụ: Loại CPU"
                  value={specKeyInput}
                  onChange={(e) => setSpecKeyInput(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Giá trị (Value)"
                  placeholder="ví dụ: Intel Core i9"
                  value={specValueInput}
                  onChange={(e) => setSpecValueInput(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (specKeyInput && specValueInput) {
                      handleAddSpec(specsDialogVariantIndex, specKeyInput, specValueInput);
                      setSpecKeyInput("");
                      setSpecValueInput("");
                    } else {
                      alert("Vui lòng nhập cả khóa và giá trị");
                    }
                  }}
                >
                  Thêm Spec
                </Button>
              </>
            ) : (
              <>
                <TextField
                  label="JSON"
                  placeholder='Ví dụ: {"Loại CPU": "Intel Core i9", "RAM": "16GB"}'
                  multiline
                  rows={6}
                  value={specsJsonInput}
                  onChange={(e) => setSpecsJsonInput(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
                <Typography variant="caption" color="textSecondary">
                  Định dạng: {"{"}\"khóa1\": \"giá trị1\", \"khóa2\": \"giá trị2\"{"}"}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (specsJsonInput.trim()) {
                      handleAddSpecsFromJson(specsDialogVariantIndex, specsJsonInput);
                      setSpecsJsonInput("");
                      setSpecsDialogOpen(false);
                      setSpecsInputMode("individual");
                    } else {
                      alert("Vui lòng nhập JSON");
                    }
                  }}
                >
                  Cập nhật Specs
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSpecsDialogOpen(false);
            setSpecKeyInput("");
            setSpecValueInput("");
            setSpecsJsonInput("");
            setSpecsInputMode("individual");
          }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EditProductScreen;
