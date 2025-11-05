import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Switch,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { CategoryApi } from "../../api/catalog/CategoryApi";
import { CloudApi } from "../../api/CloudApi";
import type { Category } from "../../models/catalogs/Category";

interface CategoryFormData {
  id?: number;
  name: string;
  code: string;
  sortOrder: number;
  visible: boolean;
  featured: boolean;
  imageUrl?: string;
}

const CategoryListScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    code: "",
    sortOrder: 0,
    visible: true,
    featured: false,
    imageUrl: undefined,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogTitle, setDialogTitle] = useState("Thêm danh mục");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryApi.getAllNoPaging();
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      alert("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingId(null);
    setDialogTitle("Thêm danh mục");
    setFormData({
      name: "",
      code: "",
      sortOrder: 0,
      visible: true,
      featured: false,
      imageUrl: undefined,
    });
    setSelectedFile(null);
    setImagePreview(undefined);
    setOpenDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditDialog = async (category: Category) => {
    setEditingId(category.id);
    setDialogTitle("Chỉnh sửa danh mục");
    setFormData({
      id: category.id,
      name: category.name,
      code: category.code,
      sortOrder: category.sortOrder || 0,
      visible: category.visible || true,
      featured: category.featured || false,
      imageUrl: category.imageUrl,
    });
    setSelectedFile(null);
    setImagePreview(category.imageUrl);
    setOpenDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Vui lòng nhập tên và code danh mục");
      return;
    }

    try {
      setUploading(true);
      let finalImageUrl = formData.imageUrl;

      // If a new file was selected, upload it to cloud
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        uploadFormData.append("folder", "categories");
        const urls = await CloudApi.uploadImages(uploadFormData);
        if (urls && urls.length > 0) {
          finalImageUrl = urls[0];
        } else {
          alert("Lỗi khi tải ảnh lên cloud");
          return;
        }
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
      };

      if (editingId) {
        // Update
        const res = await CategoryApi.update(editingId, payload);
        const updated = res?.data;
        // update local list without full reload
        if (updated) {
          setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }
        setSnackbar({ open: true, message: 'Cập nhật danh mục thành công!', severity: 'success' });
      } else {
        // Create
        const res = await CategoryApi.create(payload);
        const created = res?.data;
        if (created) {
          setCategories((prev) => [created, ...prev]);
        } else {
          // fallback to reload
          loadCategories();
        }
        setSnackbar({ open: true, message: 'Tạo danh mục thành công!', severity: 'success' });
      }
      setOpenDialog(false);
      setSelectedFile(null);
      setImagePreview(undefined);
    } catch (error) {
      console.error("Failed to save category:", error);
      setSnackbar({ open: true, message: 'Lỗi khi lưu danh mục', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisible = async (category: Category) => {
    try {
      const res = await CategoryApi.toggleVisible(category.id);
      const updated = res?.data;
      if (updated) {
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        loadCategories();
      }
      setSnackbar({ open: true, message: 'Cập nhật trạng thái hiển thị danh mục thành công!', severity: 'success' });
    } catch (error) {
      console.error("Failed to toggle category visible:", error);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật trạng thái hiển thị', severity: 'error' });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      await CategoryApi.delete(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setSnackbar({ open: true, message: 'Xóa danh mục thành công!', severity: 'success' });
    } catch (error) {
      console.error("Failed to delete category:", error);
      setSnackbar({ open: true, message: 'Lỗi khi xóa danh mục', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ p: 3, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý danh mục
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Thêm danh mục
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Ảnh</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Tên danh mục</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Thứ tự
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Nổi bật
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
                      />
                    ) : (
                      <Box sx={{ width: 50, height: 50, bgcolor: "#f0f0f0", borderRadius: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.code}</TableCell>
                  <TableCell align="center">{category.sortOrder || 0}</TableCell>
                  <TableCell align="center">
                    {category.featured ? (
                      <VisibilityIcon color="primary" />
                    ) : (
                      <VisibilityOffIcon color="disabled" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={category.visible}
                      onChange={() => handleToggleVisible(category)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEditDialog(category)}
                      title="Chỉnh sửa"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCategory(category)}
                      title="Xóa"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    Chưa có danh mục nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog tạo/sửa danh mục */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={2}>
            <TextField
              label="Tên danh mục"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Laptop"
            />
            <TextField
              label="Code"
              fullWidth
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ví dụ: laptop"
              disabled={editingId !== null}
            />
            <TextField
              label="Thứ tự"
              type="number"
              fullWidth
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
              }
            />
            <Box display="flex" gap={2} alignItems="center">
              <Typography>Nổi bật:</Typography>
              <Switch
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
              />
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <Typography>Hiển thị:</Typography>
              <Switch
                checked={formData.visible}
                onChange={(e) =>
                  setFormData({ ...formData, visible: e.target.checked })
                }
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1 }}>Ảnh danh mục</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ marginBottom: 12 }}
              />
              {imagePreview && (
                <Box mt={1}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6 }}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={uploading}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveCategory}
            disabled={uploading}
          >
            {uploading ? "Đang tải lên..." : editingId ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CategoryListScreen;
