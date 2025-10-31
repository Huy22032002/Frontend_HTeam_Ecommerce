import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Typography,
  Collapse,
  IconButton,
  Checkbox,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useProducts } from '../../hooks/useProducts';

interface SelectedVariant {
  variantId: number;
  variantName: string;
  productId: number;
  productName: string;
  selectedOptions: Record<string, string>;
  quantity: number;
  price: number;
}

interface ProductSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProducts: (items: SelectedVariant[]) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  open,
  onClose,
  onSelectProducts,
}) => {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedVariant[]>([]);
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const [variantOptions, setVariantOptions] = useState<Record<number, Record<string, string>>>({});
  const [variantQuantities, setVariantQuantities] = useState<Record<number, number>>({});
  const [variantPrices, setVariantPrices] = useState<Record<number, number>>({});

  const filteredProducts = products.filter(
    p =>
      p.productName?.toLowerCase().includes(search.toLowerCase()) ||
      p.variants?.some(v => v.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleProductExpand = (productId: number) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const handleVariantExpand = (variantId: number) => {
    setExpandedVariant(expandedVariant === variantId ? null : variantId);
  };

  const handleOptionChange = (variantId: number, optionName: string, value: string) => {
    setVariantOptions(prev => ({
      ...prev,
      [variantId]: {
        ...(prev[variantId] || {}),
        [optionName]: value,
      },
    }));
  };

  const handleQuantityChange = (variantId: number, quantity: number) => {
    setVariantQuantities(prev => ({
      ...prev,
      [variantId]: Math.max(1, quantity),
    }));
  };

  const handlePriceChange = (variantId: number, price: number) => {
    setVariantPrices(prev => ({
      ...prev,
      [variantId]: Math.max(0, price),
    }));
  };

  const handleSelectVariant = (variant: any, product: any) => {
    const variantId = variant.id;
    const isAlreadySelected = selectedItems.some(item => item.variantId === variantId);

    if (isAlreadySelected) {
      setSelectedItems(selectedItems.filter(item => item.variantId !== variantId));
      setVariantOptions(prev => {
        const newOptions = { ...prev };
        delete newOptions[variantId];
        return newOptions;
      });
      setVariantQuantities(prev => {
        const newQty = { ...prev };
        delete newQty[variantId];
        return newQty;
      });
      setVariantPrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[variantId];
        return newPrices;
      });
    } else {
      const newItem: SelectedVariant = {
        variantId,
        variantName: variant.name,
        productId: product.id,
        productName: product.productName,
        selectedOptions: {},
        quantity: variantQuantities[variantId] || 1,
        price: variantPrices[variantId] || 0,
      };
      setSelectedItems([...selectedItems, newItem]);
      setExpandedVariant(variantId);
    }
  };

  const handleConfirm = () => {
    // Validate that all required options are selected
    const validItems = selectedItems.every(item => {
      const product = products.find(p => p.id === item.productId);
      const variant = product?.variants?.find(v => v.id === item.variantId);
      if (variant?.options && variant.options.length > 0) {
        return variant.options.every(opt => item.selectedOptions[opt.name || 'name']);
      }
      return true;
    });

    if (!validItems) {
      alert('Vui lòng chọn đầy đủ các option cho tất cả sản phẩm');
      return;
    }

    // Update quantities and prices before submitting
    const finalItems = selectedItems.map(item => ({
      ...item,
      quantity: variantQuantities[item.variantId] || item.quantity,
      price: variantPrices[item.variantId] || item.price,
      selectedOptions: variantOptions[item.variantId] || item.selectedOptions,
    }));

    onSelectProducts(finalItems);
    handleClose();
  };

  const handleClose = () => {
    setSearch('');
    setExpandedProduct(null);
    setSelectedItems([]);
    setExpandedVariant(null);
    setVariantOptions({});
    setVariantQuantities({});
    setVariantPrices({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Chọn Sản Phẩm</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }}
          sx={{ mb: 2 }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Products Table */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Danh sách sản phẩm ({filteredProducts.length})
            </Typography>
            <Table size="small" sx={{ mb: 3, border: '1px solid #ddd' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell width={50}></TableCell>
                  <TableCell>Tên Sản Phẩm</TableCell>
                  <TableCell width={200}>Biến Thể</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map(product => (
                  <React.Fragment key={product.id}>
                    {/* Product Row */}
                    <TableRow hover onClick={() => handleProductExpand(product.id)}>
                      <TableCell>
                        <IconButton size="small">
                          {expandedProduct === product.id ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.variants?.length || 0} biến thể</TableCell>
                    </TableRow>

                    {/* Variants Collapse */}
                    {expandedProduct === product.id && product.variants && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Collapse in={true} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell width={50}>Chọn</TableCell>
                                    <TableCell>Tên Biến Thể</TableCell>
                                    <TableCell>Mã</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {product.variants.map(variant => (
                                    <React.Fragment key={variant.id}>
                                      {/* Variant Row */}
                                      <TableRow
                                        hover
                                        sx={{
                                          bgcolor: selectedItems.some(
                                            item => item.variantId === variant.id
                                          )
                                            ? '#e3f2fd'
                                            : 'inherit',
                                        }}
                                      >
                                        <TableCell>
                                          <Checkbox
                                            checked={selectedItems.some(
                                              item => item.variantId === variant.id
                                            )}
                                            onChange={() =>
                                              handleSelectVariant(variant, product)
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>{variant.name}</TableCell>
                                        <TableCell>{variant.code}</TableCell>
                                        <TableCell width={50}>
                                          {selectedItems.some(
                                            item => item.variantId === variant.id
                                          ) && (
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleVariantExpand(variant.id)
                                              }
                                            >
                                              {expandedVariant === variant.id ? (
                                                <ExpandLessIcon />
                                              ) : (
                                                <ExpandMoreIcon />
                                              )}
                                            </IconButton>
                                          )}
                                        </TableCell>
                                      </TableRow>

                                      {/* Options Collapse */}
                                      {selectedItems.some(
                                        item => item.variantId === variant.id
                                      ) && (
                                        <TableRow>
                                          <TableCell colSpan={4}>
                                            <Collapse
                                              in={expandedVariant === variant.id}
                                              timeout="auto"
                                              unmountOnExit
                                            >
                                              <Box sx={{ p: 2, bgcolor: '#fff' }}>
                                                {/* Options */}
                                                {variant.options &&
                                                  variant.options.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                      <Typography
                                                        variant="body2"
                                                        fontWeight="bold"
                                                        sx={{ mb: 1 }}
                                                      >
                                                        Lựa chọn:
                                                      </Typography>
                                                      {variant.options.map(
                                                        (option, idx) => (
                                                          <Box key={idx} sx={{ mb: 1 }}>
                                                            <Typography
                                                              variant="body2"
                                                              sx={{ mb: 0.5 }}
                                                            >
                                                              {option.name}: {option.value}
                                                            </Typography>
                                                          </Box>
                                                        )
                                                      )}
                                                    </Box>
                                                  )}

                                                {/* Quantity and Price */}
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                  <TextField
                                                    size="small"
                                                    label="Số lượng"
                                                    type="number"
                                                    value={
                                                      variantQuantities[variant.id] || 1
                                                    }
                                                    onChange={(e) =>
                                                      handleQuantityChange(
                                                        variant.id,
                                                        parseInt(e.target.value) || 1
                                                      )
                                                    }
                                                    inputProps={{ min: 1 }}
                                                    sx={{ width: 100 }}
                                                  />
                                                  <TextField
                                                    size="small"
                                                    label="Giá"
                                                    type="number"
                                                    value={
                                                      variantPrices[variant.id] || 0
                                                    }
                                                    onChange={(e) =>
                                                      handlePriceChange(
                                                        variant.id,
                                                        parseFloat(e.target.value) || 0
                                                      )
                                                    }
                                                    inputProps={{
                                                      min: 0,
                                                      step: 1000,
                                                    }}
                                                    sx={{ width: 120 }}
                                                  />
                                                </Box>
                                              </Box>
                                            </Collapse>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>

            {/* Selected Items Summary */}
            {selectedItems.length > 0 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Đã chọn {selectedItems.length} sản phẩm:
                </Typography>
                {selectedItems.map((item, idx) => (
                  <Typography key={idx} variant="body2">
                    • {item.productName} - {item.variantName} (SL: {variantQuantities[item.variantId] || item.quantity}, Giá:{' '}
                    {(variantPrices[item.variantId] || item.price).toLocaleString()}₫)
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Đóng</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedItems.length === 0}
        >
          Xác Nhận ({selectedItems.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductSelectionModal;
