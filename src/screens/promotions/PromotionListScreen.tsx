import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TableContainer,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState } from 'react';
import { usePromotions } from '../../hooks/usePromotions';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { PromotionApi } from '../../api/promotion/PromotionApi';
import { PromotionFormDialog } from '../../components/promotion/PromotionFormDialog';
import type { PromotionReadableDTO } from '../../models/promotions/Promotion';

const PromotionListScreen = () => {
  const { promotions, loading, error, refetch } = usePromotions();
  const { isSuperAdmin } = useAdminPermissions();
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionReadableDTO | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // TODO: Load all product options from ProductOptionApi when available

  const handleOpenForm = (promotion?: PromotionReadableDTO) => {
    setSelectedPromotion(promotion || null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedPromotion(null);
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;

    setLoadingAction(true);
    try {
      await PromotionApi.delete(deleteTargetId);
      setMessage({ type: 'success', text: 'Xóa khuyến mãi thành công' });
      setOpenDeleteConfirm(false);
      setDeleteTargetId(null);
      setTimeout(() => {
        refetch();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errorMessage || 'Lỗi khi xóa khuyến mãi';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    setLoadingAction(true);
    try {
      await PromotionApi.setActive(id, !isActive);
      setMessage({ type: 'success', text: 'Cập nhật trạng thái thành công' });
      setTimeout(() => {
        refetch();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errorMessage || 'Lỗi khi cập nhật trạng thái';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleViewDetails = (promotion: PromotionReadableDTO) => {
    setSelectedPromotion(promotion);
    setOpenDetails(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <Box>
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight={600}>Quản lý khuyến mãi</Typography>
        <Tooltip title={!isSuperAdmin ? "Chỉ SuperAdmin có thể tạo khuyến mãi" : ""}>
          <span>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleOpenForm()}
              disabled={!isSuperAdmin}
            >
              + Thêm khuyến mãi
            </Button>
          </span>
        </Tooltip>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">
          Lỗi: {error.response?.data?.errorMessage || String(error)}
        </Alert>
      ) : promotions.length === 0 ? (
        <Alert severity="info">Không có khuyến mãi nào</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Mã</strong></TableCell>
                <TableCell><strong>Tên chương trình</strong></TableCell>
                <TableCell align="right"><strong>Giảm giá</strong></TableCell>
                <TableCell><strong>Ngày bắt đầu</strong></TableCell>
                <TableCell><strong>Ngày kết thúc</strong></TableCell>
                <TableCell><strong>Trạng thái</strong></TableCell>
                <TableCell align="center"><strong>Hành động</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promotions.map((p: PromotionReadableDTO) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell align="right">
                    {p.discountPercentage ? `${p.discountPercentage}%` : formatCurrency(p.discountAmount)}
                  </TableCell>
                  <TableCell>{formatDate(p.validFrom)}</TableCell>
                  <TableCell>{formatDate(p.validTo)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={p.isActive ? 'success' : 'default'}
                      label={p.isActive ? 'Đang chạy' : 'Ngừng'}
                      onClick={() => handleToggleActive(p.id, p.isActive)}
                      style={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Chi tiết">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewDetails(p)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={!isSuperAdmin ? "Chỉ SuperAdmin có thể sửa" : "Sửa"}>
                      <span>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenForm(p)}
                          disabled={!isSuperAdmin}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={!isSuperAdmin ? "Chỉ SuperAdmin có thể xóa" : "Xóa"}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(p.id)}
                          disabled={!isSuperAdmin}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form Dialog */}
      <PromotionFormDialog
        open={openForm}
        onClose={handleCloseForm}
        onSuccess={refetch}
        promotion={selectedPromotion}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            disabled={loadingAction}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loadingAction}
          >
            {loadingAction ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết khuyến mãi</DialogTitle>
        <DialogContent>
          {selectedPromotion && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Mã khuyến mãi</Typography>
                <Typography variant="body1">{selectedPromotion.code}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Tên chương trình</Typography>
                <Typography variant="body1">{selectedPromotion.description}</Typography>
              </Box>
              {selectedPromotion.discountPercentage && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Phần trăm giảm giá</Typography>
                  <Typography variant="body1">{selectedPromotion.discountPercentage}%</Typography>
                </Box>
              )}
              {selectedPromotion.discountAmount && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Số tiền giảm giá</Typography>
                  <Typography variant="body1">{formatCurrency(selectedPromotion.discountAmount)}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Ngày bắt đầu</Typography>
                <Typography variant="body1">{formatDate(selectedPromotion.validFrom)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Ngày kết thúc</Typography>
                <Typography variant="body1">{formatDate(selectedPromotion.validTo)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Trạng thái</Typography>
                <Chip
                  size="small"
                  color={selectedPromotion.isActive ? 'success' : 'default'}
                  label={selectedPromotion.isActive ? 'Đang chạy' : 'Ngừng'}
                />
              </Box>
              {selectedPromotion.applicableProductOptions && selectedPromotion.applicableProductOptions.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Sản phẩm áp dụng</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {selectedPromotion.applicableProductOptions.map((p) => (
                      <Chip
                        key={p.sku}
                        label={`${p.sku}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromotionListScreen;
