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
  Checkbox,
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
  selectedOptions: Set<number>;
  onToggleOption: (option: ProductOption, variant: ProductVariants) => void;
  loading?: boolean;
}

const VariantRow: React.FC<VariantRowProps> = ({ 
  variant, 
  selectedOptions, 
  onToggleOption, 
  loading 
}) => {
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
                  {variant.options.map((option) => {
                    const isSelected = selectedOptions.has(option.id || 0);
                    return (
                      <Paper
                        key={option.sku}
                        sx={{
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          border: isSelected ? '2px solid #2196f3' : '1px solid #e0e0e0',
                          backgroundColor: isSelected ? '#e3f2fd' : 'white',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-4px)',
                            borderColor: '#2196f3',
                          },
                          opacity: option.availability?.quantity > 0 ? 1 : 0.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => onToggleOption(option, variant)}
                            sx={{ mt: -1, mr: 1 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                              {option.value}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                              SKU: {option.sku}
                            </Typography>
                          </Box>
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

                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              color: isSelected ? '#2196f3' : '#666',
                              fontWeight: isSelected ? 'bold' : 'normal'
                            }}
                          >
                            {isSelected ? '✓ Đã chọn' : 'Click để chọn'}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
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

interface ProductVariantListModalForPromotionProps {
  open: boolean;
  onClose: () => void;
  onApply: (selectedOptionIds: number[]) => void;
  productId?: number;
}

const ProductVariantListModalForPromotion: React.FC<ProductVariantListModalForPromotionProps> = ({
  open,
  onClose,
  onApply,
  productId,
}) => {
  const [variants, setVariants] = useState<ProductVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());

  // Fetch danh sách products
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
      setSelectedOptions(new Set());
    }
  }, [open, productId]);

  const filteredVariants = variants.filter((variant) =>
    variant.name?.toLowerCase().includes(search.toLowerCase()) ||
    variant.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleOption = (_option: ProductOption, _variant: ProductVariants) => {
    const optionId = _option.id || 0;
    const newSelected = new Set(selectedOptions);
    
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    
    setSelectedOptions(newSelected);
  };

  const handleApply = () => {
    onApply(Array.from(selectedOptions));
    setSelectedOptions(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedOptions(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Chọn sản phẩm áp dụng khuyến mãi
        {selectedOptions.size > 0 && (
          <Typography component="span" sx={{ ml: 2, color: '#2196f3', fontWeight: 'bold' }}>
            ({selectedOptions.size} sản phẩm được chọn)
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2, mt: 2 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />,
            }}
          />
        </Box>

        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredVariants.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center', color: '#999' }}>
            {search ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm nào'}
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Mã</TableCell>
                  <TableCell align="right">Kho</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVariants.map((variant) => (
                  <VariantRow
                    key={variant.id}
                    variant={variant}
                    selectedOptions={selectedOptions}
                    onToggleOption={handleToggleOption}
                    loading={loading}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={selectedOptions.size === 0 || loading}
        >
          Áp dụng ({selectedOptions.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductVariantListModalForPromotion;
