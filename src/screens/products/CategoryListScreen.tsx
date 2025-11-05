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
import type { Category } from "../../models/catalogs/Category";

interface CategoryFormData {
  id?: number;
  name: string;
  code: string;
  sortOrder: number;
  visible: boolean;
  featured: boolean;
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
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogTitle, setDialogTitle] = useState("Thêm danh mục");

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
    });
    setOpenDialog(true);
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
    });
    setOpenDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Vui lòng nhập tên và code danh mục");
      return;
    }

    try {
      if (editingId) {
        // Update
        await CategoryApi.update(editingId, formData);
        alert("Cập nhật danh mục thành công!");
      } else {
        // Create
        await CategoryApi.create(formData);
        alert("Tạo danh mục thành công!");
      }
      setOpenDialog(false);
      loadCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Lỗi khi lưu danh mục");
    }
  };

  const handleToggleVisible = async (category: Category) => {
    try {
      await CategoryApi.toggleVisible(category.id);
      alert("Cập nhật trạng thái hiển thị danh mục thành công!");
      loadCategories();
    } catch (error) {
      console.error("Failed to toggle category visible:", error);
      alert("Lỗi khi cập nhật trạng thái hiển thị");
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      await CategoryApi.delete(category.id);
      alert("Xóa danh mục thành công!");
      loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Lỗi khi xóa danh mục");
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
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveCategory}>
            {editingId ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CategoryListScreen;
