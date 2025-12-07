import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Box,
  Paper,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import type { ProductVariants } from '../../models/products/ProductVariant';
import type { ProductOption } from '../../models/products/ProductVariantOption';
import { ProductApi } from '../../api/product/ProductApi';
import { formatCurrency } from '../../utils/formatCurrency';

interface VariantRowProps {
  variant: ProductVariants;
  onSelectOption: (option: ProductOption, variant: ProductVariants) => void;
  loading?: boolean;
}

const VariantRow: React.FC<VariantRowProps> = ({ variant, onSelectOption, loading }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell align="center">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{variant.name}</TableCell>
        <TableCell>{variant.code}</TableCell>
        <TableCell align="right">{variant.stock} cái</TableCell>
      </TableRow>

      {/* Row mở rộng hiển thị các options */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Lựa chọn biến thể:
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : variant.options && variant.options.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                  {variant.options.map((option) => (
                    <Paper
                      key={option.sku}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-4px)',
                          borderColor: '#2196f3',
                        },
                        opacity: option.availability?.quantity > 0 ? 1 : 0.5,
                      }}
                      onClick={() =>
                        option.availability?.quantity > 0 &&
                        onSelectOption(option, variant)
                      }
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                          {option.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          SKU: {option.sku}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold', mb: 1 }}>
                          {option.availability?.salePrice ? formatCurrency(option.availability.salePrice) : 'N/A'}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', mb: 1 }}>
                          <Typography variant="caption">
                            Kho: {option.availability?.quantity || 0}
                          </Typography>
                          {option.reviewCount && (
                            <Typography variant="caption">
                              ⭐ {option.reviewAvg?.toFixed(1)} ({option.reviewCount} đánh giá)
                            </Typography>
                          )}
                        </Box>

                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          disabled={!option.availability?.quantity || !option.availability?.salePrice}
                          sx={{
                            backgroundColor:
                              option.availability?.quantity > 0 && option.availability?.salePrice
                                ? '#4caf50'
                                : '#ccc',
                            '&:hover': {
                              backgroundColor:
                                option.availability?.quantity > 0 && option.availability?.salePrice
                                  ? '#45a049'
                                  : '#ccc',
                            },
                          }}
                        >
                          {!option.availability?.salePrice 
                            ? 'Giá N/A'
                            : option.availability?.quantity > 0 
                              ? 'Chọn' 
                              : 'Hết Hàng'}
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Không có lựa chọn nào
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

interface ProductVariantListModalProps {
  open: boolean;
  onClose: () => void;
  onSelectOption: (option: ProductOption, variant: ProductVariants) => void;
  productId?: number;
}

const ProductVariantListModal: React.FC<ProductVariantListModalProps> = ({
  open,
  onClose,
  onSelectOption,
  productId,
}) => {
  const [variants, setVariants] = useState<ProductVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Fetch danh sách products nếu chưa chọn productId, hoặc chi tiết product với variants
  const fetchVariants = async () => {
    setLoading(true);
    setError(null);
    try {
      if (productId) {
        // Lấy chi tiết sản phẩm cùng variants
        const response = await ProductApi.getById(productId);
        setVariants(response.data.variants || []);
      } else {
        // Lấy danh sách sản phẩm
        const response = await ProductApi.getAll(0, 50);
        // ProductApi.getAll trả về { content: [], totalElements: number } hoặc []
        const products = response.data.content || response.data || [];
        // Flatten tất cả variants từ các products
        const allVariants = products.flatMap((product: any) => product.variants || []);
        setVariants(allVariants);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm');
      console.error('Failed to fetch variants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVariants();
    }
  }, [open, productId]);

  const handleSelectOption = (option: ProductOption, variant: ProductVariants) => {
    // Tạo OrderItemDisplay từ dữ liệu được chọn
    onSelectOption(option, variant);
    onClose();
  };

  // Lọc variants theo search
  const filteredVariants = variants.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '18px' }}>
        {productId ? 'Chọn Biến Thể Sản Phẩm' : 'Chọn Sản Phẩm'}
      </DialogTitle>

      <DialogContent>
        {/* Search Field */}
        <Box sx={{ mb: 2, mt: 1 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ color: 'error.main', mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
            {error}
          </Box>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '50px' }}>
                      Mở rộng
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên Sản Phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mã</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      Kho
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVariants.length > 0 ? (
                    filteredVariants.map((variant) => (
                      <VariantRow
                        key={variant.id}
                        variant={variant}
                        onSelectOption={handleSelectOption}
                        loading={loading}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        {search ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductVariantListModal;
