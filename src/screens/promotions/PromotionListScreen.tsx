import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Box, CircularProgress } from '@mui/material';
import { usePromotions } from '../../hooks/usePromotions';

const PromotionListScreen = () => {
  const { promotions, loading, error } = usePromotions();

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight={600}>Khuyến mãi</Typography>
        <Button variant="contained" size="small">+ Thêm</Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Lỗi: {String(error)}</Typography>
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
              <TableCell>Lần áp dụng</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promotions.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>{p.promotionCode}</TableCell>
                <TableCell>{p.promotionName}</TableCell>
                <TableCell>{p.type === 'PERCENTAGE' ? 'Phần trăm' : p.type === 'FIXED_AMOUNT' ? 'Tiền cố định' : 'Quà tặng'}</TableCell>
                <TableCell>{p.type === 'PERCENTAGE' ? `${p.value}%` : `${p.value?.toLocaleString()}₫`}</TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    color={p.status === 'ACTIVE' ? 'success' : 'default'} 
                    label={p.status === 'ACTIVE' ? 'Đang chạy' : 'Ngừng'} 
                  />
                </TableCell>
                <TableCell>{new Date(p.startDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{new Date(p.endDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{p.appliedCount || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default PromotionListScreen;
