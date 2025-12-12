import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Switch,
  FormControlLabel,
  Container,
  Stack,
  Card,
  Typography,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useBannerApi } from "../../../api/cms/BannerApi";
import { CloudApi } from "../../../api/CloudApi";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LinkIcon from "@mui/icons-material/Link";

interface Banner {
  id?: number;
  title: string;
  imageUrl: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

const BannerManagement = () => {
  const {
    banners,
    loading,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
  } = useBannerApi();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Banner>({
    title: "",
    imageUrl: "",
    description: "",
    displayOrder: 0,
    active: true,
  });
  const [tabValue, setTabValue] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  // Validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const URL_TIMEOUT = 5000; // 5 seconds timeout for URL validation

  // Load banners on component mount
  useEffect(() => {
    getAllBanners();
  }, []);

  // ===== VALIDATION FUNCTIONS =====
  /**
   * Validate file khi upload ảnh
   */
  const validateImageFile = (file: File): { valid: boolean; message?: string } => {
    // Kiểm tra file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `File quá lớn. Kích thước tối đa là ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Kiểm tra MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: `Định dạng không hỗ trợ. Vui lòng upload ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`,
      };
    }

    // Kiểm tra file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExtension) {
      return {
        valid: false,
        message: `File extension không hợp lệ. Chỉ chấp nhận ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`,
      };
    }

    return { valid: true };
  };

  /**
   * Validate URL ảnh
   */
  const validateImageUrl = (url: string): { valid: boolean; message?: string } => {
    if (!url || url.trim() === "") {
      return { valid: false, message: "URL không được để trống" };
    }

    // Kiểm tra format URL
    try {
      const urlObj = new URL(url);
      // Kiểm tra protocol
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return {
          valid: false,
          message: "URL phải bắt đầu bằng http:// hoặc https://",
        };
      }
    } catch {
      return { valid: false, message: "URL không hợp lệ" };
    }

    // Kiểm tra file extension từ URL
    const urlPath = new URL(url).pathname.toLowerCase();
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
      urlPath.endsWith(ext)
    );
    if (!hasValidExtension) {
      return {
        valid: false,
        message: `URL phải trỏ đến file ảnh (${ALLOWED_IMAGE_EXTENSIONS.join(", ")})`,
      };
    }

    return { valid: true };
  };

  /**
   * Kiểm tra URL có hoạt động không (image loads successfully)
   */
  const validateUrlAccessibility = (
    url: string
  ): Promise<{ valid: boolean; message?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve({
          valid: false,
          message: "URL ảnh không thể truy cập hoặc timeout",
        });
      }, URL_TIMEOUT);

      img.onload = () => {
        clearTimeout(timeout);
        resolve({ valid: true });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve({
          valid: false,
          message: "URL ảnh không hợp lệ hoặc không thể tải được",
        });
      };

      img.src = url;
    });
  };

  // ===== UPLOAD FUNCTIONS =====
  /**
   * Upload ảnh lên cloud và lưu link
   */
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.message || "File không hợp lệ");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("files", file);

      // Upload to cloud
      const uploadedUrls = await CloudApi.uploadImages(formData);

      if (!uploadedUrls || uploadedUrls.length === 0) {
        setError("Upload thất bại. Vui lòng thử lại");
        return;
      }

      const uploadedUrl = uploadedUrls[0];

      // Validate accessibility của URL vừa upload
      const accessibilityCheck = await validateUrlAccessibility(uploadedUrl);
      if (!accessibilityCheck.valid) {
        setError(accessibilityCheck.message || "URL ảnh không hợp lệ");
        return;
      }

      // Set form data với URL từ cloud
      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadedUrl,
      }));

      setSuccess("✅ Upload ảnh thành công!");
      setTabValue(0); // Switch back to main tab
    } catch (err) {
      setError("Lỗi khi upload ảnh: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Sử dụng URL ảnh trực tiếp
   */
  const handleUseImageUrl = async () => {
    if (!urlInput.trim()) {
      setError("Vui lòng nhập URL");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate URL format
      const formatValidation = validateImageUrl(urlInput);
      if (!formatValidation.valid) {
        setError(formatValidation.message || "URL không hợp lệ");
        setUploading(false);
        return;
      }

      // Validate URL accessibility
      const accessibilityValidation = await validateUrlAccessibility(urlInput);
      if (!accessibilityValidation.valid) {
        setError(accessibilityValidation.message || "URL ảnh không thể tải");
        setUploading(false);
        return;
      }

      // Set form data với URL
      setFormData((prev) => ({
        ...prev,
        imageUrl: urlInput,
      }));

      setSuccess("✅ URL ảnh hợp lệ!");
      setUrlInput("");
      setTimeout(() => {
        setTabValue(0);
      }, 500);
    } catch (err) {
      setError("Lỗi: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingId(banner.id || null);
      setFormData(banner);
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        imageUrl: "",
        description: "",
        displayOrder: banners.length,
        active: true,
      });
    }
    setError(null);
    setSuccess(null);
    setUrlInput("");
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      title: "",
      imageUrl: "",
      description: "",
      displayOrder: 0,
      active: true,
    });
    setError(null);
    setSuccess(null);
    setUrlInput("");
    setTabValue(0);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }

    if (!formData.imageUrl.trim()) {
      setError("Vui lòng chọn hoặc nhập URL ảnh");
      return;
    }

    try {
      if (editingId) {
        await updateBanner(editingId, formData);
      } else {
        await createBanner(formData);
      }
      setSuccess(
        editingId ? "✅ Cập nhật banner thành công!" : "✅ Thêm banner thành công!"
      );
      handleCloseDialog();
      getAllBanners();
    } catch (error) {
      setError("Lỗi khi lưu banner: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá banner này?")) {
      try {
        await deleteBanner(id);
        getAllBanners();
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleBannerStatus(id);
      getAllBanners();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  if (loading && banners.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Quản lý Banner
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm Banner Mới
          </Button>
        </Stack>

        {/* Banner List */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell align="center">Ảnh xem trước</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell align="center">Thứ tự</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    Chưa có banner nào
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner: Banner) => (
                  <TableRow key={banner.id} hover>
                    <TableCell>{banner.id}</TableCell>
                    <TableCell>{banner.title}</TableCell>
                    <TableCell align="center">
                      <Box
                        component="img"
                        src={banner.imageUrl}
                        sx={{
                          maxWidth: 80,
                          maxHeight: 60,
                          objectFit: "contain",
                        }}
                        alt={banner.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </TableCell>
                    <TableCell>{banner.description || "-"}</TableCell>
                    <TableCell align="center">{banner.displayOrder}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={banner.active}
                        onChange={() => handleToggleStatus(banner.id!)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(banner)}
                        sx={{ mr: 1 }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(banner.id!)}
                      >
                        Xoá
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog for Add/Edit Banner */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingId ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Stack spacing={3}>
              {/* Basic Info */}
              <TextField
                fullWidth
                label="Tiêu đề"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <TextField
                fullWidth
                type="number"
                label="Thứ tự hiển thị"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value) || 0,
                  })
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                  />
                }
                label="Kích hoạt"
              />

              {/* Image Selection Tabs */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Chọn ảnh Banner
                </Typography>
                <Card>
                  <Tabs
                    value={tabValue}
                    onChange={(_e, newValue) => setTabValue(newValue)}
                    aria-label="Image source tabs"
                  >
                    <Tab
                      label="Upload Ảnh"
                      icon={<UploadFileIcon />}
                      iconPosition="start"
                      id="tab-0"
                    />
                    <Tab
                      label="Dùng Link"
                      icon={<LinkIcon />}
                      iconPosition="start"
                      id="tab-1"
                    />
                  </Tabs>

                  {/* Upload Tab */}
                  <TabPanel value={tabValue} index={0}>
                    <Stack spacing={2}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        disabled={uploading}
                      >
                        {uploading ? "Đang upload..." : "Chọn ảnh từ máy tính"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleUploadImage}
                          disabled={uploading}
                        />
                      </Button>

                      {uploading && (
                        <Box>
                          <LinearProgress />
                          <Typography variant="caption" sx={{ mt: 1 }}>
                            Đang tải lên...
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="caption" color="textSecondary">
                        Định dạng: JPG, PNG, WebP, GIF
                        <br />
                        Kích thước tối đa: 5MB
                      </Typography>
                    </Stack>
                  </TabPanel>

                  {/* URL Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Nhập URL ảnh"
                        placeholder="https://example.com/banner.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        disabled={uploading}
                      />

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleUseImageUrl}
                        disabled={uploading || !urlInput.trim()}
                      >
                        {uploading ? "Đang kiểm tra..." : "Sử dụng URL này"}
                      </Button>

                      {uploading && <LinearProgress />}

                      <Typography variant="caption" color="textSecondary">
                        URL phải trỏ đến file ảnh hợp lệ (http/https)
                        <br />
                        Định dạng: JPG, PNG, WebP, GIF
                      </Typography>
                    </Stack>
                  </TabPanel>
                </Card>
              </Box>

              {/* Image Preview */}
              {formData.imageUrl && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Xem trước
                  </Typography>
                  <Box
                    component="img"
                    src={formData.imageUrl}
                    sx={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                    }}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).alt =
                        "Không thể tải ảnh";
                    }}
                  />
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              disabled={uploading || !formData.title || !formData.imageUrl}
            >
              {editingId ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default BannerManagement;
