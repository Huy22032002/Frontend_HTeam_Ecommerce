import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { useState } from 'react';
import { usePromotions } from '../../hooks/usePromotions';
import { PromotionApi } from '../../api/promotion/PromotionApi';

const PromotionListScreen = () => {
  const { promotions, loading, error } = usePromotions();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [formData, setFormData] = useState({
    promotionCode: '',
    promotionName: '',
    type: 'PERCENTAGE',
    value: 0,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const handleOpenDialog = (promotion?: any) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData(promotion);
    } else {
      setEditingPromotion(null);
      setFormData({
        promotionCode: '',
        promotionName: '',
        type: 'PERCENTAGE',
        value: 0,
        startDate: '',
        endDate: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPromotion(null);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) : value,
    }));
  };

  const handleSwitchChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleSave = async () => {
    try {
      if (editingPromotion) {
        // Update existing promotion
        await PromotionApi.create(formData);
      } else {
        // Create new promotion
        await PromotionApi.create(formData);
      }
      handleCloseDialog();
      window.location.reload();
    } catch (err) {
      console.error('Error saving promotion:', err);
      alert('Lỗi khi lưu khuyến mãi');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
      try {
        await PromotionApi.delete(id);
        window.location.reload();
      } catch (err) {
        console.error('Error deleting promotion:', err);
        alert('Lỗi khi xóa khuyến mãi');
      }
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await PromotionApi.setActive(id, !isActive);
      window.location.reload();
    } catch (err) {
      console.error('Error updating promotion status:', err);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight={600}>Khuyến mãi</Typography>
        <Button variant="contained" size="small" onClick={() => handleOpenDialog()}>
          + Thêm khuyến mãi
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Lỗi: {String(error)}</Typography>
      ) : promotions.length === 0 ? (
        <Typography>Không có khuyến mãi nào</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mã</TableCell>
              <TableCell>Tên chương trình</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Giá trị</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promotions.map((p: any) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.promotionCode}</TableCell>
                <TableCell>{p.promotionName}</TableCell>
                <TableCell>{p.type === 'PERCENTAGE' ? 'Phần trăm' : p.type === 'FIXED_AMOUNT' ? 'Tiền cố định' : 'Quà tặng'}</TableCell>
                <TableCell>{p.type === 'PERCENTAGE' ? `${p.value}%` : `${p.value?.toLocaleString()}₫`}</TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    color={p.isActive ? 'success' : 'default'} 
                    label={p.isActive ? 'Đang chạy' : 'Ngừng'} 
                    onClick={() => handleToggleActive(p.id, p.isActive)}
                    style={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell>{new Date(p.startDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{new Date(p.endDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => handleOpenDialog(p)}
                  >
                    Sửa
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => handleDelete(p.id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog thêm/sửa khuyến mãi */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Mã khuyến mãi"
              name="promotionCode"
              value={formData.promotionCode}
              onChange={handleInputChange}
              fullWidth
              disabled={!!editingPromotion}
            />
            <TextField
              label="Tên chương trình"
              name="promotionName"
              value={formData.promotionName}
              onChange={handleInputChange}
              fullWidth
            />
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              fullWidth
            >
              <MenuItem value="PERCENTAGE">Phần trăm (%)</MenuItem>
              <MenuItem value="FIXED_AMOUNT">Tiền cố định (₫)</MenuItem>
              <MenuItem value="GIFT">Quà tặng</MenuItem>
            </Select>
            <TextField
              label="Giá trị"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Ngày bắt đầu"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ngày kết thúc"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                />
              }
              label="Kích hoạt"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            {editingPromotion ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromotionListScreen;
